import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { z } from 'zod';
import { prisma } from './src/lib/db';
import { hashPassword, verifyPassword, generateToken } from './src/lib/auth';
import { encryptKey, decryptKey, maskKey } from './src/lib/encryption';
import { getStateByCodeOrName } from './src/lib/usData';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory session store mapping token -> userId
const sessions = new Map<string, string>();

// Helper to get authenticated user from request
async function getAuthUser(req: Request) {
  const authHeader = req.headers.authorization;
  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc, c) => {
      const [k, v] = c.trim().split('=');
      acc[k] = v;
      return acc;
    }, {} as Record<string, string>);
    token = cookies['session_token'] || '';
  }

  if (!token) return null;
  const userId = sessions.get(token);
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, avatar: true },
  });
  return user;
}

// Helper to resolve effective Google Maps API Key
async function getEffectiveGoogleKey(userId?: string): Promise<string> {
  if (userId) {
    const userKey = await prisma.userGoogleKey.findUnique({
      where: { userId },
    });
    if (userKey && userKey.encryptedKey) {
      const decrypted = decryptKey(userKey.encryptedKey);
      if (decrypted) return decrypted;
    }
  }

  // Fallback to system environment variable
  return (
    process.env.GOOGLE_MAPS_PLATFORM_KEY ||
    process.env.GEMINI_API_KEY ||
    ''
  );
}

// Compute community amenity summary from reviews
function computeCommunitySummary(reviews: any[]) {
  if (!reviews || reviews.length === 0) {
    return {
      wifiRating: 0,
      wifiText: 'Unknown' as const,
      outletRating: 0,
      outletText: 'Unknown' as const,
      noiseRating: 0,
      noiseText: 'Unknown' as const,
      seatingRating: 0,
      seatingText: 'Unknown' as const,
      workFriendlyPercent: 0,
      totalCommunityReviews: 0,
      overallCommunityRating: 0,
    };
  }

  const count = reviews.length;
  let wifiSum = 0, wifiCount = 0;
  let outletSum = 0, outletCount = 0;
  let seatingSum = 0, seatingCount = 0;
  let overallSum = 0;
  let workFriendlyCount = 0;
  const noiseCounts: Record<string, number> = { Quiet: 0, Moderate: 0, Loud: 0 };

  for (const r of reviews) {
    overallSum += r.overallRating;
    if (r.wifiRating > 0) { wifiSum += r.wifiRating; wifiCount++; }
    if (r.outletRating > 0) { outletSum += r.outletRating; outletCount++; }
    if (r.seatingRating > 0) { seatingSum += r.seatingRating; seatingCount++; }
    if (r.workFriendly) { workFriendlyCount++; }
    if (r.noiseLevel in noiseCounts) {
      noiseCounts[r.noiseLevel]++;
    }
  }

  const avgWifi = wifiCount > 0 ? wifiSum / wifiCount : 0;
  const avgOutlet = outletCount > 0 ? outletSum / outletCount : 0;
  const avgSeating = seatingCount > 0 ? seatingSum / seatingCount : 0;
  const avgOverall = overallSum / count;
  const workFriendlyPct = Math.round((workFriendlyCount / count) * 100);

  // Wifi Text Mapping
  let wifiText: 'Excellent' | 'Good' | 'Poor' | 'None' | 'Unknown' = 'Unknown';
  if (avgWifi >= 4.2) wifiText = 'Excellent';
  else if (avgWifi >= 3.0) wifiText = 'Good';
  else if (avgWifi > 1.0) wifiText = 'Poor';
  else if (wifiCount > 0) wifiText = 'None';

  // Outlet Text Mapping
  let outletText: 'Many' | 'Some' | 'Limited' | 'Unknown' = 'Unknown';
  if (avgOutlet >= 4.0) outletText = 'Many';
  else if (avgOutlet >= 2.5) outletText = 'Some';
  else if (outletCount > 0) outletText = 'Limited';

  // Noise Text Mapping
  let noiseText: 'Quiet' | 'Moderate' | 'Loud' | 'Unknown' = 'Unknown';
  const dominantNoise = Object.entries(noiseCounts).sort((a, b) => b[1] - a[1])[0];
  if (dominantNoise && dominantNoise[1] > 0) {
    noiseText = dominantNoise[0] as 'Quiet' | 'Moderate' | 'Loud';
  }

  // Seating Text Mapping
  let seatingText: 'Plenty' | 'Moderate' | 'Limited' | 'Unknown' = 'Unknown';
  if (avgSeating >= 4.0) seatingText = 'Plenty';
  else if (avgSeating >= 2.5) seatingText = 'Moderate';
  else if (seatingCount > 0) seatingText = 'Limited';

  let noiseRatingNum = 3;
  if (noiseText === 'Quiet') noiseRatingNum = 1;
  else if (noiseText === 'Moderate') noiseRatingNum = 3;
  else if (noiseText === 'Loud') noiseRatingNum = 5;

  return {
    wifiRating: Number(avgWifi.toFixed(1)),
    wifiText,
    outletRating: Number(avgOutlet.toFixed(1)),
    outletText,
    noiseRating: noiseRatingNum,
    noiseText,
    seatingRating: Number(avgSeating.toFixed(1)),
    seatingText,
    workFriendlyPercent: workFriendlyPct,
    totalCommunityReviews: count,
    overallCommunityRating: Number(avgOverall.toFixed(1)),
  };
}

// --------------------------------------------------
// API ROUTES
// --------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AUTH: Register
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const registerSchema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().min(2),
    });

    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid registration input', details: parsed.error.format() });
    }

    const { email, password, name } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const passwordHash = hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
      },
    });

    const token = generateToken();
    sessions.set(token, user.id);

    res.cookie('session_token', token, { httpOnly: true, maxAge: 30 * 24 * 3600 * 1000 });
    return res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Failed to create user account' });
  }
});

// AUTH: Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string(),
    });

    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid login details' });
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken();
    sessions.set(token, user.id);

    res.cookie('session_token', token, { httpOnly: true, maxAge: 30 * 24 * 3600 * 1000 });
    return res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Authentication failed' });
  }
});

// AUTH: Current User
app.get('/api/auth/me', async (req: Request, res: Response) => {
  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ user: null });
  }
  return res.json({ user });
});

// AUTH: Logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    sessions.delete(authHeader.substring(7));
  }
  res.clearCookie('session_token');
  return res.json({ success: true });
});

// BYOK: Get user Google Key status
app.get('/api/byok', async (req: Request, res: Response) => {
  const user = await getAuthUser(req);
  if (!user) {
    return res.json({ configured: false, maskedKey: null, source: 'none' });
  }

  const userKey = await prisma.userGoogleKey.findUnique({
    where: { userId: user.id },
  });

  if (userKey && userKey.encryptedKey) {
    const decrypted = decryptKey(userKey.encryptedKey);
    return res.json({
      configured: true,
      maskedKey: maskKey(decrypted),
      source: 'user',
    });
  }

  const systemKey = process.env.GOOGLE_MAPS_PLATFORM_KEY || process.env.GEMINI_API_KEY || '';
  return res.json({
    configured: Boolean(systemKey),
    maskedKey: systemKey ? maskKey(systemKey) : null,
    source: systemKey ? 'system' : 'none',
  });
});

// BYOK: Save or update BYOK Key
app.post('/api/byok', async (req: Request, res: Response) => {
  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'You must be logged in to configure a custom Google Maps API key.' });
  }

  const schema = z.object({
    apiKey: z.string().trim().min(10, 'API key must be at least 10 characters long'),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid API Key format' });
  }

  const { apiKey } = parsed.data;

  // Optional: Verify key against Google Places API
  try {
    const testUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=coffee&inputtype=textquery&fields=place_id&key=${apiKey}`;
    const testRes = await fetch(testUrl);
    const testData = await testRes.json() as any;
    if (testData.status === 'REQUEST_DENIED') {
      return res.status(400).json({ error: 'Google Maps API key validation failed: ' + (testData.error_message || 'Key rejected by Google') });
    }
  } catch (e) {
    // Non-blocking network check fallback
  }

  const encryptedKey = encryptKey(apiKey);

  await prisma.userGoogleKey.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      encryptedKey,
    },
    update: {
      encryptedKey,
    },
  });

  return res.json({
    success: true,
    maskedKey: maskKey(apiKey),
    message: 'Google Maps API key encrypted and saved successfully.',
  });
});

// BYOK: Remove stored BYOK Key
app.delete('/api/byok', async (req: Request, res: Response) => {
  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await prisma.userGoogleKey.deleteMany({
    where: { userId: user.id },
  });

  return res.json({ success: true, message: 'Custom API key removed.' });
});

// COFFEE SHOPS: Query and Search
app.get('/api/coffee-shops', async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    const stateInput = (req.query.state as string || 'California').trim();
    const cityInput = (req.query.city as string || 'San Francisco').trim();
    const searchQuery = (req.query.q as string || '').trim();

    const wifiFilter = (req.query.wifi as string || 'All');
    const outletFilter = (req.query.outlet as string || 'All');
    const noiseFilter = (req.query.noise as string || 'All');
    const seatingFilter = (req.query.seating as string || 'All');
    const workFriendlyOnly = req.query.workFriendly === 'true';
    const minRating = parseFloat(req.query.minRating as string || '0');
    const priceLevel = req.query.priceLevel ? parseInt(req.query.priceLevel as string, 10) : null;
    const sortBy = (req.query.sortBy as string || 'recommended');

    const stateObj = getStateByCodeOrName(stateInput);
    const stateName = stateObj ? stateObj.name : stateInput;

    // 1. Check local database
    let localShops = await prisma.coffeeShop.findMany({
      where: {
        city: { equals: cityInput },
        state: { equals: stateName },
      },
      include: {
        reviews: true,
        favorites: user ? { where: { userId: user.id } } : false,
      },
    });

    // 2. Fetch from Google Places API if local cache is sparse and key exists
    const apiKey = await getEffectiveGoogleKey(user?.id);
    if (localShops.length < 5 && apiKey) {
      try {
        const queryText = `coffee shop in ${cityInput}, ${stateName}`;
        const googleUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(queryText)}&key=${apiKey}`;
        const response = await fetch(googleUrl);
        const data = await response.json() as any;

        if (data.results && Array.isArray(data.results)) {
          for (const item of data.results.slice(0, 15)) {
            if (!item.place_id || !item.geometry?.location) continue;

            const existing = await prisma.coffeeShop.findUnique({
              where: { googlePlaceId: item.place_id },
            });

            if (!existing) {
              let photoUrl = null;
              if (item.photos && item.photos.length > 0) {
                photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photo_reference=${item.photos[0].photo_reference}&key=${apiKey}`;
              }

              await prisma.coffeeShop.create({
                data: {
                  googlePlaceId: item.place_id,
                  name: item.name,
                  address: item.formatted_address || `${item.name}, ${cityInput}, ${stateName}`,
                  city: cityInput,
                  state: stateName,
                  latitude: item.geometry.location.lat,
                  longitude: item.geometry.location.lng,
                  googleRating: item.rating || null,
                  userRatingsTotal: item.user_ratings_total || 0,
                  priceLevel: item.price_level ?? null,
                  photoUrl: photoUrl || `https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80`,
                },
              });
            }
          }

          // Re-fetch after populate
          localShops = await prisma.coffeeShop.findMany({
            where: {
              city: { equals: cityInput },
              state: { equals: stateName },
            },
            include: {
              reviews: true,
              favorites: user ? { where: { userId: user.id } } : false,
            },
          });
        }
      } catch (err) {
        console.error('Error querying Google Places API:', err);
      }
    }

    // 3. User favorites map
    let userFavoriteIds = new Set<string>();
    if (user) {
      const favs = await prisma.favorite.findMany({
        where: { userId: user.id },
        select: { coffeeShopId: true },
      });
      userFavoriteIds = new Set(favs.map(f => f.coffeeShopId));
    }

    // 4. Transform into CoffeeShop DTO with community amenities
    let formattedShops = localShops.map((shop) => {
      const communityAmenities = computeCommunitySummary(shop.reviews);
      return {
        id: shop.id,
        googlePlaceId: shop.googlePlaceId,
        name: shop.name,
        address: shop.address,
        city: shop.city,
        state: shop.state,
        latitude: shop.latitude,
        longitude: shop.longitude,
        googleRating: shop.googleRating,
        userRatingsTotal: shop.userRatingsTotal ?? 0,
        priceLevel: shop.priceLevel,
        phoneNumber: shop.phoneNumber,
        website: shop.website,
        photoUrl: shop.photoUrl,
        isFavorite: userFavoriteIds.has(shop.id),
        communityAmenities,
      };
    });

    // 5. Apply Search query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      formattedShops = formattedShops.filter(
        (s) => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q)
      );
    }

    // 6. Apply Amenity & Rating Filters
    formattedShops = formattedShops.filter((s) => {
      const comm = s.communityAmenities;

      // Rating filter
      if (minRating > 0) {
        const rating = s.googleRating || comm.overallCommunityRating;
        if (rating < minRating) return false;
      }

      // Price filter
      if (priceLevel !== null && s.priceLevel !== null && s.priceLevel !== priceLevel) {
        return false;
      }

      // Wifi Filter
      if (wifiFilter === 'Available' && comm.wifiText !== 'Excellent' && comm.wifiText !== 'Good') return false;
      if (wifiFilter === 'Unavailable' && comm.wifiText !== 'None' && comm.wifiText !== 'Poor') return false;
      if (wifiFilter === 'Unknown' && comm.wifiText !== 'Unknown') return false;

      // Outlet Filter
      if (outletFilter === 'Many' && comm.outletText !== 'Many') return false;
      if (outletFilter === 'Some' && comm.outletText !== 'Some' && comm.outletText !== 'Many') return false;
      if (outletFilter === 'Limited' && comm.outletText !== 'Limited') return false;
      if (outletFilter === 'Unknown' && comm.outletText !== 'Unknown') return false;

      // Noise Filter
      if (noiseFilter === 'Quiet' && comm.noiseText !== 'Quiet') return false;
      if (noiseFilter === 'Moderate' && comm.noiseText !== 'Moderate') return false;
      if (noiseFilter === 'Loud' && comm.noiseText !== 'Loud') return false;
      if (noiseFilter === 'Unknown' && comm.noiseText !== 'Unknown') return false;

      // Seating Filter
      if (seatingFilter === 'Plenty' && comm.seatingText !== 'Plenty') return false;
      if (seatingFilter === 'Moderate' && comm.seatingText !== 'Moderate' && comm.seatingText !== 'Plenty') return false;
      if (seatingFilter === 'Limited' && comm.seatingText !== 'Limited') return false;
      if (seatingFilter === 'Unknown' && comm.seatingText !== 'Unknown') return false;

      // Work Friendly Only
      if (workFriendlyOnly && comm.totalCommunityReviews > 0 && comm.workFriendlyPercent < 60) return false;

      return true;
    });

    // 7. Apply Sorting
    formattedShops.sort((a, b) => {
      if (sortBy === 'rating') {
        return (b.googleRating || 0) - (a.googleRating || 0);
      }
      if (sortBy === 'reviews') {
        return (b.userRatingsTotal + b.communityAmenities.totalCommunityReviews) - (a.userRatingsTotal + a.communityAmenities.totalCommunityReviews);
      }
      if (sortBy === 'wifi') {
        return b.communityAmenities.wifiRating - a.communityAmenities.wifiRating;
      }
      if (sortBy === 'outlets') {
        return b.communityAmenities.outletRating - a.communityAmenities.outletRating;
      }
      if (sortBy === 'quietest') {
        return a.communityAmenities.noiseRating - b.communityAmenities.noiseRating;
      }
      if (sortBy === 'seating') {
        return b.communityAmenities.seatingRating - a.communityAmenities.seatingRating;
      }
      // recommended default
      return (b.communityAmenities.overallCommunityRating * 2 + (b.googleRating || 0)) -
             (a.communityAmenities.overallCommunityRating * 2 + (a.googleRating || 0));
    });

    return res.json({
      city: cityInput,
      state: stateName,
      total: formattedShops.length,
      coffeeShops: formattedShops,
    });
  } catch (err) {
    console.error('Error in /api/coffee-shops:', err);
    return res.status(500).json({ error: 'Failed to fetch coffee shops' });
  }
});

// COFFEE SHOP DETAIL
app.get('/api/coffee-shops/:id', async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    const { id } = req.params;

    const shop = await prisma.coffeeShop.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!shop) {
      return res.status(404).json({ error: 'Coffee shop not found' });
    }

    let isFavorite = false;
    if (user) {
      const fav = await prisma.favorite.findUnique({
        where: {
          userId_coffeeShopId: {
            userId: user.id,
            coffeeShopId: shop.id,
          },
        },
      });
      isFavorite = Boolean(fav);
    }

    const communityAmenities = computeCommunitySummary(shop.reviews);

    const formattedReviews = shop.reviews.map((r) => ({
      id: r.id,
      userId: r.userId,
      coffeeShopId: r.coffeeShopId,
      userName: r.user.name,
      userAvatar: r.user.avatar,
      overallRating: r.overallRating,
      wifiRating: r.wifiRating,
      outletRating: r.outletRating,
      noiseLevel: r.noiseLevel as 'Quiet' | 'Moderate' | 'Loud' | 'Unknown',
      seatingRating: r.seatingRating,
      workFriendly: r.workFriendly,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    return res.json({
      coffeeShop: {
        id: shop.id,
        googlePlaceId: shop.googlePlaceId,
        name: shop.name,
        address: shop.address,
        city: shop.city,
        state: shop.state,
        latitude: shop.latitude,
        longitude: shop.longitude,
        googleRating: shop.googleRating,
        userRatingsTotal: shop.userRatingsTotal ?? 0,
        priceLevel: shop.priceLevel,
        phoneNumber: shop.phoneNumber,
        website: shop.website,
        photoUrl: shop.photoUrl,
        isFavorite,
        communityAmenities,
      },
      reviews: formattedReviews,
    });
  } catch (err) {
    console.error('Error fetching detail:', err);
    return res.status(500).json({ error: 'Failed to fetch coffee shop details' });
  }
});

// FAVORITE: Toggle Add / Remove
app.post('/api/coffee-shops/:id/favorites', async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Please log in to save favorites' });
    }

    const coffeeShopId = req.params.id;
    const shop = await prisma.coffeeShop.findUnique({ where: { id: coffeeShopId } });
    if (!shop) {
      return res.status(404).json({ error: 'Coffee shop not found' });
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_coffeeShopId: {
          userId: user.id,
          coffeeShopId,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return res.json({ isFavorite: false, message: 'Removed from favorites' });
    } else {
      await prisma.favorite.create({
        data: {
          userId: user.id,
          coffeeShopId,
        },
      });
      return res.json({ isFavorite: true, message: 'Saved to favorites' });
    }
  } catch (err) {
    console.error('Error toggling favorite:', err);
    return res.status(500).json({ error: 'Failed to update favorite status' });
  }
});

// FAVORITES: Get list for user
app.get('/api/favorites', async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        coffeeShop: {
          include: { reviews: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const coffeeShops = favorites.map((f) => {
      const shop = f.coffeeShop;
      const communityAmenities = computeCommunitySummary(shop.reviews);
      return {
        id: shop.id,
        googlePlaceId: shop.googlePlaceId,
        name: shop.name,
        address: shop.address,
        city: shop.city,
        state: shop.state,
        latitude: shop.latitude,
        longitude: shop.longitude,
        googleRating: shop.googleRating,
        userRatingsTotal: shop.userRatingsTotal ?? 0,
        priceLevel: shop.priceLevel,
        phoneNumber: shop.phoneNumber,
        website: shop.website,
        photoUrl: shop.photoUrl,
        isFavorite: true,
        communityAmenities,
      };
    });

    return res.json({ coffeeShops });
  } catch (err) {
    console.error('Error getting favorites:', err);
    return res.status(500).json({ error: 'Failed to load favorites' });
  }
});

// REVIEWS: Submit / Update review
app.post('/api/coffee-shops/:id/reviews', async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Please log in to submit a review' });
    }

    const coffeeShopId = req.params.id;

    const reviewSchema = z.object({
      overallRating: z.number().min(1).max(5),
      wifiRating: z.number().min(0).max(5).default(0),
      outletRating: z.number().min(0).max(5).default(0),
      noiseLevel: z.enum(['Quiet', 'Moderate', 'Loud', 'Unknown']).default('Unknown'),
      seatingRating: z.number().min(0).max(5).default(0),
      workFriendly: z.boolean().default(true),
      comment: z.string().min(5, 'Review comment must be at least 5 characters').max(1000),
    });

    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid review data', details: parsed.error.format() });
    }

    const data = parsed.data;

    const review = await prisma.review.upsert({
      where: {
        userId_coffeeShopId: {
          userId: user.id,
          coffeeShopId,
        },
      },
      create: {
        userId: user.id,
        coffeeShopId,
        ...data,
      },
      update: {
        ...data,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    return res.json({
      success: true,
      review: {
        id: review.id,
        userId: review.userId,
        coffeeShopId: review.coffeeShopId,
        userName: review.user.name,
        userAvatar: review.user.avatar,
        overallRating: review.overallRating,
        wifiRating: review.wifiRating,
        outletRating: review.outletRating,
        noiseLevel: review.noiseLevel as 'Quiet' | 'Moderate' | 'Loud' | 'Unknown',
        seatingRating: review.seatingRating,
        workFriendly: review.workFriendly,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error('Error saving review:', err);
    return res.status(500).json({ error: 'Failed to submit review' });
  }
});

// REVIEWS: Delete review
app.delete('/api/coffee-shops/:id/reviews/:reviewId', async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { reviewId } = req.params;
    const review = await prisma.review.findUnique({ where: { id: reviewId } });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.userId !== user.id) {
      return res.status(403).json({ error: 'You can only delete your own reviews' });
    }

    await prisma.review.delete({ where: { id: reviewId } });
    return res.json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Error deleting review:', err);
    return res.status(500).json({ error: 'Failed to delete review' });
  }
});

// --------------------------------------------------
// DATABASE SEEDING
// --------------------------------------------------

async function seedInitialData() {
  const count = await prisma.coffeeShop.count();
  if (count > 0) return;

  console.log('Seeding initial coffee shops & community reviews dataset...');

  // Create demo user
  const demoPasswordHash = hashPassword('demo123456');
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@coffeeshopfinder.com',
      name: 'Alex Johnson (Coffee Enthusiast)',
      passwordHash: demoPasswordHash,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
  });

  const reviewer2 = await prisma.user.create({
    data: {
      email: 'sam.remote@tech.io',
      name: 'Sam Rivera (Software Dev)',
      passwordHash: hashPassword('password123'),
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
  });

  const seedShops = [
    // San Francisco CA
    {
      googlePlaceId: 'sf_sightglass_7_st',
      name: 'Sightglass Coffee',
      address: '270 7th St, San Francisco, CA 94103',
      city: 'San Francisco',
      state: 'California',
      latitude: 37.7772,
      longitude: -122.4085,
      googleRating: 4.6,
      userRatingsTotal: 1840,
      priceLevel: 2,
      phoneNumber: '(415) 861-1313',
      website: 'https://sightglasscoffee.com',
      photoUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
      reviews: [
        {
          userId: demoUser.id,
          overallRating: 5,
          wifiRating: 5,
          outletRating: 4,
          noiseLevel: 'Moderate',
          seatingRating: 5,
          workFriendly: true,
          comment: 'Incredible flagship venue in SoMa! Massive high ceilings, plenty of wooden benches, stellar pour-overs, and rock-solid fiber Wi-Fi on both floors.',
        },
        {
          userId: reviewer2.id,
          overallRating: 4,
          wifiRating: 4,
          outletRating: 3,
          noiseLevel: 'Moderate',
          seatingRating: 4,
          workFriendly: true,
          comment: 'Great espresso and bustling vibe. Power outlets are mainly along the side walls on the main floor, so come early if you need to plug in.',
        },
      ],
    },
    {
      googlePlaceId: 'sf_ritual_valencia',
      name: 'Ritual Coffee Roasters',
      address: '1026 Valencia St, San Francisco, CA 94110',
      city: 'San Francisco',
      state: 'California',
      latitude: 37.7564,
      longitude: -122.4211,
      googleRating: 4.5,
      userRatingsTotal: 1210,
      priceLevel: 2,
      phoneNumber: '(415) 641-1011',
      website: 'https://ritualcoffee.com',
      photoUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
      reviews: [
        {
          userId: demoUser.id,
          overallRating: 5,
          wifiRating: 5,
          outletRating: 4,
          noiseLevel: 'Quiet',
          seatingRating: 4,
          workFriendly: true,
          comment: 'Iconic Mission district café. Quiet morning work environment with smooth gigabit internet and delicious single-origin roasts.',
        },
      ],
    },
    {
      googlePlaceId: 'sf_blue_bottle_mint',
      name: 'Blue Bottle Coffee - Mint Plaza',
      address: '66 Mint Plaza, San Francisco, CA 94103',
      city: 'San Francisco',
      state: 'California',
      latitude: 37.7825,
      longitude: -122.4072,
      googleRating: 4.4,
      userRatingsTotal: 1450,
      priceLevel: 2,
      phoneNumber: '(510) 653-3394',
      website: 'https://bluebottlecoffee.com',
      photoUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
      reviews: [
        {
          userId: reviewer2.id,
          overallRating: 4,
          wifiRating: 4,
          outletRating: 2,
          noiseLevel: 'Quiet',
          seatingRating: 3,
          workFriendly: true,
          comment: 'Beautiful outdoor plaza seating. Good for focused 1-hour laptop sessions, though outlet access is minimal.',
        },
      ],
    },

    // Austin TX
    {
      googlePlaceId: 'atx_houndstooth_congress',
      name: 'Houndstooth Coffee',
      address: '401 Congress Ave #100, Austin, TX 78701',
      city: 'Austin',
      state: 'Texas',
      latitude: 30.2662,
      longitude: -97.7428,
      googleRating: 4.7,
      userRatingsTotal: 980,
      priceLevel: 2,
      phoneNumber: '(512) 531-9417',
      website: 'https://houndstoothcoffee.com',
      photoUrl: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80',
      reviews: [
        {
          userId: demoUser.id,
          overallRating: 5,
          wifiRating: 5,
          outletRating: 5,
          noiseLevel: 'Quiet',
          seatingRating: 4,
          workFriendly: true,
          comment: 'Top-tier Austin workspace! Outlets at almost every stool, reliable high-speed Wi-Fi, and masterfully pulled espresso.',
        },
      ],
    },
    {
      googlePlaceId: 'atx_mozarts_lake',
      name: 'Mozart’s Coffee Roasters',
      address: '3825 Lake Austin Blvd, Austin, TX 78703',
      city: 'Austin',
      state: 'Texas',
      latitude: 30.2952,
      longitude: -97.7844,
      googleRating: 4.6,
      userRatingsTotal: 4800,
      priceLevel: 2,
      phoneNumber: '(512) 477-2900',
      website: 'https://mozartscoffee.com',
      photoUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
      reviews: [
        {
          userId: reviewer2.id,
          overallRating: 5,
          wifiRating: 5,
          outletRating: 4,
          noiseLevel: 'Moderate',
          seatingRating: 5,
          workFriendly: true,
          comment: 'Unbeatable outdoor waterfront patio overlooking Lake Austin! Massive seating capacity and great study vibe until midnight.',
        },
      ],
    },

    // Seattle WA
    {
      googlePlaceId: 'sea_espresso_vivace',
      name: 'Espresso Vivace Roasteria',
      address: '537 Broadway E, Seattle, WA 98102',
      city: 'Seattle',
      state: 'Washington',
      latitude: 47.6238,
      longitude: -122.3211,
      googleRating: 4.8,
      userRatingsTotal: 2100,
      priceLevel: 2,
      phoneNumber: '(206) 860-2722',
      website: 'https://espressovivace.com',
      photoUrl: 'https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=800&q=80',
      reviews: [
        {
          userId: demoUser.id,
          overallRating: 5,
          wifiRating: 5,
          outletRating: 5,
          noiseLevel: 'Quiet',
          seatingRating: 5,
          workFriendly: true,
          comment: 'The gold standard of Seattle espresso. Warm interior, cozy booths, and super fast Wi-Fi for study sessions.',
        },
      ],
    },
    {
      googlePlaceId: 'sea_victrola_cap_hill',
      name: 'Victrola Coffee Roasters',
      address: '310 E Pike St, Seattle, WA 98122',
      city: 'Seattle',
      state: 'Washington',
      latitude: 47.6141,
      longitude: -122.3262,
      googleRating: 4.6,
      userRatingsTotal: 1350,
      priceLevel: 2,
      phoneNumber: '(206) 624-1725',
      website: 'https://victrolacoffee.com',
      photoUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80',
      reviews: [
        {
          userId: reviewer2.id,
          overallRating: 5,
          wifiRating: 5,
          outletRating: 4,
          noiseLevel: 'Quiet',
          seatingRating: 4,
          workFriendly: true,
          comment: 'Spacious Capitol Hill coffee hall with vintage charm, art exhibits, and fantastic cold brew.',
        },
      ],
    },

    // New York NY
    {
      googlePlaceId: 'nyc_devocion_williamsburg',
      name: 'Devoción',
      address: '69 Grand St, Brooklyn, NY 11249',
      city: 'New York',
      state: 'New York',
      latitude: 40.7161,
      longitude: -73.9647,
      googleRating: 4.6,
      userRatingsTotal: 2600,
      priceLevel: 2,
      phoneNumber: '(718) 285-6180',
      website: 'https://devocion.com',
      photoUrl: 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&w=800&q=80',
      reviews: [
        {
          userId: demoUser.id,
          overallRating: 5,
          wifiRating: 5,
          outletRating: 4,
          noiseLevel: 'Moderate',
          seatingRating: 5,
          workFriendly: true,
          comment: 'Lush living vertical plant wall with a huge skylight! Outstanding farm-to-cup Colombian roasts and comfortable leather couches.',
        },
      ],
    },
  ];

  for (const shop of seedShops) {
    const { reviews, ...shopData } = shop;
    const createdShop = await prisma.coffeeShop.create({
      data: shopData,
    });

    for (const r of reviews) {
      await prisma.review.create({
        data: {
          coffeeShopId: createdShop.id,
          ...r,
        },
      });
    }
  }

  console.log('Seeding completed successfully!');
}

// --------------------------------------------------
// VITE / STATIC MIDDLWARE
// --------------------------------------------------

async function startServer() {
  await seedInitialData();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
