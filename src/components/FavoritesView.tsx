import React from 'react';
import { CoffeeShop } from '../lib/types';
import { CoffeeShopCard } from './CoffeeShopCard';
import { Heart, ArrowLeft, Coffee } from 'lucide-react';

interface FavoritesViewProps {
  favorites: CoffeeShop[];
  isLoading: boolean;
  onBackToExplore: () => void;
  onSelectShop: (shop: CoffeeShop) => void;
  onOpenDetails: (shop: CoffeeShop) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  isLoading,
  onBackToExplore,
  onSelectShop,
  onOpenDetails,
  onToggleFavorite,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E8E2D9]">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToExplore}
            className="p-2 bg-white hover:bg-[#FAF7F2] text-[#5D4037] rounded-lg transition-colors border border-[#E8E2D9]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#5D4037] flex items-center gap-2">
              <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
              Saved Favorites
            </h1>
            <p className="text-xs text-[#7A6860]">Your personal collection of work & study coffee shops</p>
          </div>
        </div>

        <span className="text-sm font-bold bg-[#FAF7F2] text-[#5D4037] px-3.5 py-1 rounded-full border border-[#E8E2D9]">
          {favorites.length} Saved
        </span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white border border-[#E8E2D9] rounded-xl h-80 animate-pulse p-4" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="bg-white border border-[#E8E2D9] rounded-2xl p-12 text-center max-w-md mx-auto my-12 shadow-xs">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500 border border-rose-200">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#5D4037] mb-2">No Saved Favorites Yet</h3>
          <p className="text-xs text-[#7A6860] mb-6 leading-relaxed">
            Heart any coffee shop card while exploring cities to save it to your personal study list.
          </p>
          <button
            onClick={onBackToExplore}
            className="px-6 py-2.5 bg-[#5D4037] hover:bg-[#432C25] text-white font-bold text-xs rounded-lg shadow-xs transition-all"
          >
            Explore Coffee Shops
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((shop) => (
            <CoffeeShopCard
              key={shop.id}
              coffeeShop={shop}
              isSelected={false}
              onSelect={onSelectShop}
              onOpenDetails={onOpenDetails}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};
