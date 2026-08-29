# Coffee Shop Finder

Coffee Shop Finder is a location-based web application focused on discovering coffee shops across the United States for remote work, studying, relaxing, or meeting friends.

Users can select any U.S. State and City, search and filter coffee shops based on practical work/study characteristics (Wi-Fi speed, power outlet availability, noise levels, seating capacity, work friendliness), save coffee shops to favorites, leave community reviews, and configure their own Google Maps API Key using Bring Your Own Key (BYOK) support.

---

## Key Features

- **U.S. Location Selection**: Two-step location selector covering all 50 U.S. states and Washington D.C., with popular city presets and custom city search.
- **Real Google Maps Integration**: Uses `@vis.gl/react-google-maps` with Places API and Maps JavaScript API, rendering interactive maps with custom coffee markers, InfoWindows, and viewport auto-centering.
- **Work & Study Filters**: Filter by Wi-Fi availability (Fast, Good, Poor, None), Power Outlets (Many, Some, Few), Noise Levels (Quiet, Moderate, Loud), Seating Capacity (Plenty, Moderate, Limited), Minimum Rating, Price Tier ($–$$$$), and Work-Friendly approval.
- **Clear Separation of Data Sources**: Distinctly separates official Google Places business information (Google Rating, Total Reviews, Address, Phone, Website) from Coffee Shop Finder Community Work & Study Ratings.
- **BYOK (Bring Your Own Key) Support**: Authenticated users can provide their own Google Maps API Key.
- **AES-256 Key Security**: User API keys are encrypted at rest using server-side AES-256-GCM encryption and masked (`••••••••••••ABCD`) in user interface responses.
- **User Authentication**: Secure password hashing with PBKDF2, session management, and instant 1-click Demo Account login.
- **Saved Favorites**: Save and manage favorite coffee shops backed by database unique constraints.
- **Community Reviews**: Write, edit, and delete 1–5 star reviews with detailed amenity ratings.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, `@vis.gl/react-google-maps`
- **Backend**: Express.js server, Node.js v22
- **Database & ORM**: Prisma ORM with SQLite / PostgreSQL compatibility schema
- **Security & Validation**: Node `crypto` AES-256-GCM encryption, PBKDF2 password hashing, Zod validation
- **Build Tooling**: Vite, esbuild, tsx

---

## Database Schema (Prisma)

- `User`: User accounts, emails, password hashes, timestamps
- `CoffeeShop`: Cached place metadata, googlePlaceId (unique index), name, address, city, state, coordinates, Google ratings
- `Favorite`: Saved user favorites with unique composite constraint `(userId, coffeeShopId)`
- `Review`: Community reviews with ratings for overall quality, Wi-Fi, outlets, noise level, seating, and work-friendliness
- `UserGoogleKey`: Encrypted BYOK Google Maps API keys linked to users `(userId)`

---

## Setup & Environment Variables

Copy `.env.example` to `.env`:

```env
GEMINI_API_KEY="YOUR_API_KEY"
GOOGLE_MAPS_PLATFORM_KEY="YOUR_GOOGLE_MAPS_API_KEY"
ENCRYPTION_SECRET="your-32-character-secret-key"
```

### Installation Commands

```bash
# Install dependencies
npm install

# Initialize Prisma Database
npx prisma db push

# Run Development Server
npm run dev
```

---

## BYOK & Security Considerations

User-provided API keys are treated as sensitive credentials:
1. Keys are encrypted server-side using AES-256-GCM prior to database storage.
2. The server-side decryption key resides exclusively in environment variables (`ENCRYPTION_SECRET`).
3. Decrypted keys are never returned in network JSON responses.
4. UI displays masked keys (`••••••••••••ABCD`).
