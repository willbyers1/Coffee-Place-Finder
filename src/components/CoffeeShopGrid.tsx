import React from 'react';
import { CoffeeShopCard } from './CoffeeShopCard';
import { CoffeeShop } from '../lib/types';
import { Coffee, SearchX, MapPin } from 'lucide-react';

interface CoffeeShopGridProps {
  coffeeShops: CoffeeShop[];
  selectedShopId: string | null;
  isLoading: boolean;
  onSelectShop: (shop: CoffeeShop) => void;
  onOpenDetails: (shop: CoffeeShop) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onResetFilters: () => void;
  currentCity: string;
  currentState: string;
}

export const CoffeeShopGrid: React.FC<CoffeeShopGridProps> = ({
  coffeeShops,
  selectedShopId,
  isLoading,
  onSelectShop,
  onOpenDetails,
  onToggleFavorite,
  onResetFilters,
  currentCity,
  currentState,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="bg-white border border-[#E8E2D9] rounded-xl h-80 animate-pulse overflow-hidden p-4">
            <div className="bg-[#FAF7F2] h-40 rounded-lg mb-4" />
            <div className="bg-[#FAF7F2] h-5 w-3/4 rounded mb-2" />
            <div className="bg-[#FAF7F2] h-4 w-1/2 rounded mb-4" />
            <div className="bg-[#FAF7F2] h-8 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (coffeeShops.length === 0) {
    return (
      <div className="bg-white border border-[#E8E2D9] rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs my-6">
        <div className="w-16 h-16 bg-[#FAF7F2] rounded-full flex items-center justify-center mx-auto mb-4 text-[#5D4037] border border-[#E8E2D9]">
          <SearchX className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-[#5D4037] mb-2">No Coffee Shops Found</h3>
        <p className="text-sm text-[#7A6860] mb-6 leading-relaxed">
          No coffee shops matched your active filters in <strong className="text-[#5D4037]">{currentCity}, {currentState}</strong>. Try clearing your filters or choosing another city.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onResetFilters}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#5D4037] hover:bg-[#432C25] text-white font-bold text-sm rounded-lg transition-all shadow-xs"
          >
            Reset Active Filters
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {coffeeShops.map((shop) => (
        <CoffeeShopCard
          key={shop.id}
          coffeeShop={shop}
          isSelected={selectedShopId === shop.id}
          onSelect={onSelectShop}
          onOpenDetails={onOpenDetails}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
};
