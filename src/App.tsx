import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FilterPanel } from './components/FilterPanel';
import { CoffeeShopGrid } from './components/CoffeeShopGrid';
import { CoffeeShopMap } from './components/CoffeeShopMap';
import { CoffeeShopDetailModal } from './components/CoffeeShopDetailModal';
import { LocationSelector } from './components/LocationSelector';
import { ReviewModal } from './components/ReviewModal';
import { ByokModal } from './components/ByokModal';
import { AuthModal } from './components/AuthModal';
import { FavoritesView } from './components/FavoritesView';
import {
  CoffeeShop,
  FilterOptions,
  User,
  ByokStatus,
} from './lib/types';
import { Map, List, MapPin } from 'lucide-react';

const DEFAULT_FILTERS: FilterOptions = {
  wifi: 'All',
  outlets: 'All',
  noise: 'All',
  seating: 'All',
  workFriendlyOnly: false,
  minRating: 0,
  priceLevel: null,
  openNow: false,
  searchQuery: '',
  sortBy: 'recommended',
};

export default function App() {
  // Navigation & Location state
  const [activeView, setActiveView] = useState<'explore' | 'favorites'>('explore');
  const [currentState, setCurrentState] = useState<string>('California');
  const [currentCity, setCurrentCity] = useState<string>('San Francisco');
  const [mobileTab, setMobileTab] = useState<'list' | 'map'>('list');

  // Data & Selection State
  const [coffeeShops, setCoffeeShops] = useState<CoffeeShop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [detailShop, setDetailShop] = useState<CoffeeShop | null>(null);
  const [favorites, setFavorites] = useState<CoffeeShop[]>([]);
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);

  // Status & Loading State
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingFavs, setIsLoadingFavs] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [byokStatus, setByokStatus] = useState<ByokStatus>({
    configured: false,
    maskedKey: null,
    source: 'none',
  });

  // Modal Open States
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isByokOpen, setIsByokOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Initialize location from URL query params if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stateParam = params.get('state');
    const cityParam = params.get('city');
    if (stateParam) setCurrentState(stateParam);
    if (cityParam) setCurrentCity(cityParam);
  }, []);

  // Sync state & city to URL
  const updateUrlLocation = (stateName: string, cityName: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set('state', stateName);
    params.set('city', cityName);
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  // Fetch BYOK Status
  const fetchByokStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/byok');
      const data = await res.json();
      setByokStatus(data);
    } catch (err) {
      console.error('Failed to fetch BYOK status:', err);
    }
  }, []);

  // Fetch Current User Auth Session
  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setUser(data.user || null);
    } catch (err) {
      console.error('Failed to fetch auth session:', err);
    }
  }, []);

  // Fetch Coffee Shops with current location and filters
  const fetchCoffeeShops = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        state: currentState,
        city: currentCity,
        q: filters.searchQuery,
        wifi: filters.wifi,
        outlet: filters.outlets,
        noise: filters.noise,
        seating: filters.seating,
        workFriendly: String(filters.workFriendlyOnly),
        minRating: String(filters.minRating),
        sortBy: filters.sortBy,
      });

      if (filters.priceLevel) {
        params.append('priceLevel', String(filters.priceLevel));
      }

      const res = await fetch(`/api/coffee-shops?${params.toString()}`);
      const data = await res.json();

      if (data.coffeeShops) {
        setCoffeeShops(data.coffeeShops);
        if (data.coffeeShops.length > 0 && !selectedShopId) {
          setSelectedShopId(data.coffeeShops[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch coffee shops:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentState, currentCity, filters, selectedShopId]);

  // Fetch Favorites for logged in user
  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }
    setIsLoadingFavs(true);
    try {
      const res = await fetch('/api/favorites');
      const data = await res.json();
      if (data.coffeeShops) {
        setFavorites(data.coffeeShops);
      }
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
    } finally {
      setIsLoadingFavs(false);
    }
  }, [user]);

  // Bootup Initial Data
  useEffect(() => {
    fetchByokStatus();
    fetchCurrentUser();
  }, [fetchByokStatus, fetchCurrentUser]);

  useEffect(() => {
    fetchCoffeeShops();
  }, [fetchCoffeeShops]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Location Selector apply
  const handleSelectLocation = (stateName: string, cityName: string) => {
    setCurrentState(stateName);
    setCurrentCity(cityName);
    setSelectedShopId(null);
    updateUrlLocation(stateName, cityName);
  };

  // Toggle favorite status
  const handleToggleFavorite = async (shopId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    try {
      const res = await fetch(`/api/coffee-shops/${shopId}/favorites`, {
        method: 'POST',
      });
      const data = await res.json();

      // Update local state
      setCoffeeShops((prev) =>
        prev.map((s) => (s.id === shopId ? { ...s, isFavorite: data.isFavorite } : s))
      );

      if (detailShop && detailShop.id === shopId) {
        setDetailShop((prev) => (prev ? { ...prev, isFavorite: data.isFavorite } : null));
      }

      fetchFavorites();
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  // Submit new review
  const handleSubmitReview = async (reviewData: any) => {
    if (!detailShop) return;
    const res = await fetch(`/api/coffee-shops/${detailShop.id}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit review');
    }

    // Refresh coffee shops and detail view
    fetchCoffeeShops();
    const detailRes = await fetch(`/api/coffee-shops/${detailShop.id}`);
    const detailData = await detailRes.json();
    if (detailData.coffeeShop) {
      setDetailShop(detailData.coffeeShop);
    }
  };

  // Delete user review
  const handleDeleteReview = async (reviewId: string) => {
    if (!detailShop) return;
    try {
      const res = await fetch(`/api/coffee-shops/${detailShop.id}/reviews/${reviewId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchCoffeeShops();
        const detailRes = await fetch(`/api/coffee-shops/${detailShop.id}`);
        const detailData = await detailRes.json();
        if (detailData.coffeeShop) {
          setDetailShop(detailData.coffeeShop);
        }
      }
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  // BYOK Key Save
  const handleSaveByokKey = async (apiKey: string) => {
    const res = await fetch('/api/byok', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to save API key');
    }

    await fetchByokStatus();
    fetchCoffeeShops();
  };

  // BYOK Key Remove
  const handleRemoveByokKey = async () => {
    const res = await fetch('/api/byok', { method: 'DELETE' });
    if (!res.ok) {
      throw new Error('Failed to remove custom key');
    }
    await fetchByokStatus();
    fetchCoffeeShops();
  };

  // Auth logout
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setFavorites([]);
    fetchByokStatus();
  };

  // Auth login success
  const handleLoginSuccess = (newUser: User) => {
    setUser(newUser);
    fetchFavorites();
    fetchByokStatus();
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C1810] font-sans flex flex-col bg-geometric-dots selection:bg-[#D4A373] selection:text-[#2C1810]">
      {/* Top Navigation */}
      <Navbar
        user={user}
        byokStatus={byokStatus}
        favoriteCount={favorites.length}
        currentState={currentState}
        currentCity={currentCity}
        onOpenLocationSelector={() => setIsLocationOpen(true)}
        onOpenByok={() => setIsByokOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenFavorites={() => setActiveView('favorites')}
        onLogout={handleLogout}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Views */}
      {activeView === 'favorites' ? (
        <FavoritesView
          favorites={favorites}
          isLoading={isLoadingFavs}
          onBackToExplore={() => setActiveView('explore')}
          onSelectShop={(shop) => {
            setSelectedShopId(shop.id);
            setDetailShop(shop);
            setIsDetailOpen(true);
          }}
          onOpenDetails={(shop) => {
            setDetailShop(shop);
            setIsDetailOpen(true);
          }}
          onToggleFavorite={handleToggleFavorite}
        />
      ) : (
        <>
          {/* Hero Header */}
          <Hero
            currentState={currentState}
            currentCity={currentCity}
            onOpenLocationSelector={() => setIsLocationOpen(true)}
            onOpenByok={() => setIsByokOpen(true)}
          />

          {/* Main Discovery Workspace */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Filter Panel */}
            <FilterPanel
              filters={filters}
              onFilterChange={(newFilters) => setFilters(newFilters)}
              onResetFilters={() => setFilters(DEFAULT_FILTERS)}
              totalResults={coffeeShops.length}
            />

            {/* Mobile Tab Switcher (List vs Map) */}
            <div className="lg:hidden flex rounded-xl bg-white border border-[#E8E2D9] p-1 mb-4 shadow-2xs">
              <button
                onClick={() => setMobileTab('list')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-colors ${
                  mobileTab === 'list'
                    ? 'bg-[#5D4037] text-white shadow-2xs'
                    : 'text-[#7A6860] hover:text-[#5D4037]'
                }`}
              >
                <List className="w-4 h-4" />
                <span>List View ({coffeeShops.length})</span>
              </button>
              <button
                onClick={() => setMobileTab('map')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-colors ${
                  mobileTab === 'map'
                    ? 'bg-[#5D4037] text-white shadow-2xs'
                    : 'text-[#7A6860] hover:text-[#5D4037]'
                }`}
              >
                <Map className="w-4 h-4" />
                <span>Map View</span>
              </button>
            </div>

            {/* Desktop Split View / Mobile Tab View */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Cards Grid */}
              <div
                className={`lg:col-span-7 xl:col-span-8 ${
                  mobileTab === 'map' ? 'hidden lg:block' : 'block'
                }`}
              >
                <CoffeeShopGrid
                  coffeeShops={coffeeShops}
                  selectedShopId={selectedShopId}
                  isLoading={isLoading}
                  onSelectShop={(shop) => setSelectedShopId(shop.id)}
                  onOpenDetails={(shop) => {
                    setDetailShop(shop);
                    setIsDetailOpen(true);
                  }}
                  onToggleFavorite={handleToggleFavorite}
                  onResetFilters={() => setFilters(DEFAULT_FILTERS)}
                  currentCity={currentCity}
                  currentState={currentState}
                />
              </div>

              {/* Right Column: Sticky Google Map */}
              <div
                className={`lg:col-span-5 xl:col-span-4 lg:sticky lg:top-20 h-[600px] ${
                  mobileTab === 'list' ? 'hidden lg:block' : 'block'
                }`}
              >
                <CoffeeShopMap
                  coffeeShops={coffeeShops}
                  selectedShopId={selectedShopId}
                  onSelectShop={(shop) => setSelectedShopId(shop.id)}
                  onOpenDetails={(shop) => {
                    setDetailShop(shop);
                    setIsDetailOpen(true);
                  }}
                  onOpenByok={() => setIsByokOpen(true)}
                  byokStatus={byokStatus}
                  currentCity={currentCity}
                  currentState={currentState}
                />
              </div>
            </div>
          </main>
        </>
      )}

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-[#E8E2D9] text-[#7A6860] text-xs py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#5D4037]">Coffee Shop Finder</span>
            <span>—</span>
            <span>Work & Study Café Discovery Across the U.S.</span>
          </div>

          <p className="text-[#7A6860]">
            Powered by Google Maps Platform & Community Verified Amenity Ratings.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <LocationSelector
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
        currentState={currentState}
        currentCity={currentCity}
        onSelectLocation={handleSelectLocation}
      />

      <CoffeeShopDetailModal
        coffeeShop={detailShop}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        user={user}
        onToggleFavorite={handleToggleFavorite}
        onOpenWriteReview={() => {
          if (!user) {
            setIsAuthOpen(true);
          } else {
            setIsReviewOpen(true);
          }
        }}
        onDeleteReview={handleDeleteReview}
      />

      <ReviewModal
        coffeeShop={detailShop}
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onSubmitReview={handleSubmitReview}
      />

      <ByokModal
        isOpen={isByokOpen}
        onClose={() => setIsByokOpen(false)}
        byokStatus={byokStatus}
        onSaveKey={handleSaveByokKey}
        onRemoveKey={handleRemoveByokKey}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
