import React from 'react';
import { Star, Wifi, Zap, Volume2, Users, Heart, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';
import { CoffeeShop } from '../lib/types';

interface CoffeeShopCardProps {
  coffeeShop: CoffeeShop;
  isSelected: boolean;
  onSelect: (shop: CoffeeShop) => void;
  onOpenDetails: (shop: CoffeeShop) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const CoffeeShopCard: React.FC<CoffeeShopCardProps> = ({
  coffeeShop,
  isSelected,
  onSelect,
  onOpenDetails,
  onToggleFavorite,
}) => {
  const comm = coffeeShop.communityAmenities;

  // Price level formatter
  const renderPrice = (level: number | null) => {
    if (!level) return null;
    return <span className="text-amber-400 font-semibold text-xs font-mono">{"$".repeat(level)}</span>;
  };

  // Wifi pill style
  const getWifiBadge = (wifiText: string) => {
    switch (wifiText) {
      case 'Excellent':
        return <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1"><Wifi className="w-3 h-3 text-emerald-600"/> Wi-Fi: Fast</span>;
      case 'Good':
        return <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1"><Wifi className="w-3 h-3 text-blue-600"/> Wi-Fi: Good</span>;
      case 'Poor':
      case 'None':
        return <span className="bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1"><Wifi className="w-3 h-3 text-rose-600"/> Wi-Fi: Poor</span>;
      default:
        return <span className="bg-[#FAF7F2] text-[#7A6860] border border-[#E8E2D9] px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1"><Wifi className="w-3 h-3 text-[#7A6860]"/> Wi-Fi: Unknown</span>;
    }
  };

  // Outlet pill style
  const getOutletBadge = (outletText: string) => {
    switch (outletText) {
      case 'Many':
        return <span className="bg-[#FAF7F2] text-[#5D4037] border border-[#D4A373] px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1"><Zap className="w-3 h-3 text-[#D4A373]"/> Plugs: Many</span>;
      case 'Some':
        return <span className="bg-[#FAF7F2] text-[#5D4037] border border-[#E8E2D9] px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1"><Zap className="w-3 h-3 text-[#D4A373]"/> Plugs: Some</span>;
      case 'Limited':
        return <span className="bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1"><Zap className="w-3 h-3 text-rose-600"/> Plugs: Few</span>;
      default:
        return <span className="bg-[#FAF7F2] text-[#7A6860] border border-[#E8E2D9] px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1"><Zap className="w-3 h-3 text-[#7A6860]"/> Plugs: Unknown</span>;
    }
  };

  // Noise pill style
  const getNoiseBadge = (noiseText: string) => {
    switch (noiseText) {
      case 'Quiet':
        return <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1"><Volume2 className="w-3 h-3 text-emerald-600"/> Noise: Quiet</span>;
      case 'Moderate':
        return <span className="bg-[#FAF7F2] text-[#5D4037] border border-[#E8E2D9] px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1"><Volume2 className="w-3 h-3 text-[#D4A373]"/> Noise: Moderate</span>;
      case 'Loud':
        return <span className="bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1"><Volume2 className="w-3 h-3 text-rose-600"/> Noise: Loud</span>;
      default:
        return <span className="bg-[#FAF7F2] text-[#7A6860] border border-[#E8E2D9] px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1"><Volume2 className="w-3 h-3 text-[#7A6860]"/> Noise: Unknown</span>;
    }
  };

  return (
    <div
      onClick={() => onSelect(coffeeShop)}
      className={`group relative bg-white rounded-xl border overflow-hidden transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md ${
        isSelected
          ? 'border-[#D4A373] border-l-4 bg-[#FAF7F2]'
          : 'border-[#E8E2D9] hover:border-[#D4A373]'
      }`}
    >
      {/* Top Image & Overlay */}
      <div className="relative h-44 w-full bg-[#FAF7F2] overflow-hidden">
        <img
          src={coffeeShop.photoUrl || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80'}
          alt={coffeeShop.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => onToggleFavorite(coffeeShop.id, e)}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
            coffeeShop.isFavorite
              ? 'bg-rose-100 text-rose-600 border border-rose-300 scale-105'
              : 'bg-white/90 text-[#5D4037] hover:text-rose-600 border border-[#E8E2D9]'
          }`}
          title={coffeeShop.isFavorite ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart className={`w-4 h-4 ${coffeeShop.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Google Rating Badge */}
        {coffeeShop.googleRating && (
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-md border border-[#E8E2D9] flex items-center space-x-1.5 shadow-xs">
            <Star className="w-3.5 h-3.5 fill-[#D4A373] text-[#D4A373]" />
            <span className="text-xs font-bold text-[#5D4037]">{coffeeShop.googleRating.toFixed(1)}</span>
            <span className="text-[10px] text-[#7A6860] font-medium">({coffeeShop.userRatingsTotal})</span>
            <span className="text-[9px] text-[#5D4037] border-l border-[#E8E2D9] pl-1 ml-0.5 font-semibold">Google</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4">
        {/* Title & Price */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-bold text-base text-[#5D4037] group-hover:text-[#D4A373] transition-colors line-clamp-1">
            {coffeeShop.name}
          </h3>
          {renderPrice(coffeeShop.priceLevel)}
        </div>

        {/* Address */}
        <p className="text-xs text-[#7A6860] flex items-center space-x-1 mb-3 line-clamp-1">
          <MapPin className="w-3.5 h-3.5 text-[#5D4037] shrink-0" />
          <span>{coffeeShop.address}</span>
        </p>

        {/* Community Work/Study Amenities Badge Bar */}
        <div className="mb-3 pt-2.5 border-t border-[#E8E2D9]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#5D4037] tracking-wider uppercase flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#D4A373]" />
              Community Study Ratings
            </span>
            {comm.totalCommunityReviews > 0 && (
              <span className="text-[10px] text-[#7A6860] font-medium">
                {comm.totalCommunityReviews} {comm.totalCommunityReviews === 1 ? 'review' : 'reviews'}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {getWifiBadge(comm.wifiText)}
            {getOutletBadge(comm.outletText)}
            {getNoiseBadge(comm.noiseText)}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-between border-t border-[#E8E2D9]">
          <span className="text-xs font-semibold text-[#5D4037]">
            {comm.workFriendlyPercent > 0 ? `${comm.workFriendlyPercent}% Work-Friendly` : 'Community Verified'}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(coffeeShop);
            }}
            className="px-3 py-1.5 rounded-md bg-[#5D4037] hover:bg-[#432C25] text-white font-semibold text-xs border border-[#5D4037] transition-all flex items-center gap-1 shadow-2xs"
          >
            <span>View Details</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
