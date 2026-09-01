import React, { useState, useEffect } from 'react';
import { X, Star, Wifi, Zap, Volume2, Users, Heart, Phone, Globe, MapPin, MessageSquare, ShieldCheck, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { CoffeeShop, Review, User } from '../lib/types';

interface CoffeeShopDetailModalProps {
  coffeeShop: CoffeeShop | null;
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onOpenWriteReview: () => void;
  onDeleteReview: (reviewId: string) => void;
}

export const CoffeeShopDetailModal: React.FC<CoffeeShopDetailModalProps> = ({
  coffeeShop,
  isOpen,
  onClose,
  user,
  onToggleFavorite,
  onOpenWriteReview,
  onDeleteReview,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  useEffect(() => {
    if (coffeeShop && isOpen) {
      setIsLoadingReviews(true);
      fetch(`/api/coffee-shops/${coffeeShop.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.reviews) {
            setReviews(data.reviews);
          }
        })
        .catch((err) => console.error('Failed to load shop details:', err))
        .finally(() => setIsLoadingReviews(false));
    }
  }, [coffeeShop, isOpen]);

  if (!isOpen || !coffeeShop) return null;

  const comm = coffeeShop.communityAmenities;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white border border-[#E8E2D9] w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden my-8 max-h-[90vh] flex flex-col text-[#2C1810]">
        {/* Modal Header Image Banner */}
        <div className="relative h-56 sm:h-72 w-full bg-[#FAF7F2] shrink-0">
          <img
            src={coffeeShop.photoUrl || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80'}
            alt={coffeeShop.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/90 text-[#5D4037] hover:bg-white transition-colors border border-[#E8E2D9]"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Favorite button */}
          <button
            onClick={(e) => onToggleFavorite(coffeeShop.id, e)}
            className={`absolute top-4 left-4 flex items-center space-x-2 px-3 py-1.5 rounded-md backdrop-blur-md transition-all ${
              coffeeShop.isFavorite
                ? 'bg-rose-100 text-rose-700 border border-rose-300'
                : 'bg-white/90 text-[#5D4037] border border-[#E8E2D9] hover:bg-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${coffeeShop.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span className="text-xs font-semibold">{coffeeShop.isFavorite ? 'Saved' : 'Save'}</span>
          </button>

          {/* Title Overlay */}
          <div className="absolute bottom-4 left-6 right-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">{coffeeShop.name}</h1>
            <p className="text-xs sm:text-sm text-stone-200 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#D4A373] shrink-0" />
              <span>{coffeeShop.address}</span>
            </p>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 scrollbar-thin">
          {/* Dual Data Grid: Google Info vs Community Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Box 1: Google Business Information */}
            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8E2D9]">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E8E2D9]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A6860]">
                  Google Business Info
                </h3>
                <span className="text-[10px] bg-white text-[#5D4037] border border-[#E8E2D9] px-2 py-0.5 rounded font-semibold">Official</span>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#7A6860] text-xs">Google Rating:</span>
                  {coffeeShop.googleRating ? (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-[#D4A373] text-[#D4A373]" />
                      <span className="font-bold text-[#5D4037]">{coffeeShop.googleRating.toFixed(1)}</span>
                      <span className="text-xs text-[#7A6860]">({coffeeShop.userRatingsTotal} reviews)</span>
                    </div>
                  ) : (
                    <span className="text-xs text-[#7A6860]">Not listed</span>
                  )}
                </div>

                {coffeeShop.priceLevel && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#7A6860] text-xs">Price Tier:</span>
                    <span className="text-[#5D4037] font-bold font-mono">{"$".repeat(coffeeShop.priceLevel)}</span>
                  </div>
                )}

                {coffeeShop.phoneNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#7A6860] text-xs">Phone:</span>
                    <a href={`tel:${coffeeShop.phoneNumber}`} className="text-[#5D4037] hover:underline flex items-center gap-1 text-xs font-semibold">
                      <Phone className="w-3 h-3" />
                      {coffeeShop.phoneNumber}
                    </a>
                  </div>
                )}

                {coffeeShop.website && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#7A6860] text-xs">Website:</span>
                    <a href={coffeeShop.website} target="_blank" rel="noopener noreferrer" className="text-[#5D4037] hover:underline flex items-center gap-1 text-xs font-semibold truncate max-w-[180px]">
                      <Globe className="w-3 h-3" />
                      Visit Site
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Box 2: Coffee Shop Finder Community Ratings */}
            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8E2D9]">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E8E2D9]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5D4037] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#D4A373]" />
                  Community Work & Study Index
                </h3>
                <span className="text-[10px] bg-white text-[#5D4037] border border-[#E8E2D9] px-2 py-0.5 rounded font-semibold">
                  {comm.totalCommunityReviews} Ratings
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2 rounded border border-[#E8E2D9] flex items-center justify-between">
                  <span className="text-[#7A6860] flex items-center gap-1">
                    <Wifi className="w-3.5 h-3.5 text-[#5D4037]" /> Wi-Fi
                  </span>
                  <span className="font-bold text-[#5D4037]">{comm.wifiText}</span>
                </div>

                <div className="bg-white p-2 rounded border border-[#E8E2D9] flex items-center justify-between">
                  <span className="text-[#7A6860] flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-[#5D4037]" /> Outlets
                  </span>
                  <span className="font-bold text-[#5D4037]">{comm.outletText}</span>
                </div>

                <div className="bg-white p-2 rounded border border-[#E8E2D9] flex items-center justify-between">
                  <span className="text-[#7A6860] flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 text-[#5D4037]" /> Noise
                  </span>
                  <span className="font-bold text-[#5D4037]">{comm.noiseText}</span>
                </div>

                <div className="bg-white p-2 rounded border border-[#E8E2D9] flex items-center justify-between">
                  <span className="text-[#7A6860] flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#5D4037]" /> Seating
                  </span>
                  <span className="font-bold text-[#5D4037]">{comm.seatingText}</span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-[#E8E2D9] flex items-center justify-between text-xs">
                <span className="text-[#7A6860]">Remote Work Friendly Score:</span>
                <span className="font-bold text-[#5D4037] bg-white px-2 py-0.5 rounded border border-[#E8E2D9]">
                  {comm.workFriendlyPercent}% Approval
                </span>
              </div>
            </div>
          </div>

          {/* Community Reviews Section */}
          <div className="pt-4 border-t border-[#E8E2D9]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-[#5D4037] flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#D4A373]" />
                  Community Reviews & Reports
                </h2>
                <p className="text-xs text-[#7A6860]">Real feedback on Wi-Fi speeds, power outlets, and study conditions</p>
              </div>

              <button
                onClick={onOpenWriteReview}
                className="px-4 py-2 bg-[#5D4037] hover:bg-[#432C25] text-white font-bold text-xs rounded-lg shadow-xs flex items-center space-x-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Write Review</span>
              </button>
            </div>

            {/* Review List */}
            {isLoadingReviews ? (
              <div className="space-y-3">
                {[1, 2].map((n) => (
                  <div key={n} className="bg-[#FAF7F2] p-4 rounded-xl animate-pulse h-24 border border-[#E8E2D9]" />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="bg-[#FAF7F2] p-6 rounded-xl text-center text-[#7A6860] text-sm border border-[#E8E2D9]">
                No community reviews written yet. Be the first to share Wi-Fi and outlet feedback for this coffee shop!
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8E2D9] text-[#2C1810] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        {r.userAvatar ? (
                          <img src={r.userAvatar} alt={r.userName} className="w-7 h-7 rounded-full object-cover" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[#5D4037] text-white font-bold text-xs flex items-center justify-center">
                            {r.userName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-xs text-[#5D4037] block">{r.userName}</span>
                          <span className="text-[10px] text-[#7A6860]">{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 bg-white border border-[#E8E2D9] px-2 py-0.5 rounded text-xs font-bold text-[#5D4037]">
                          <Star className="w-3.5 h-3.5 fill-[#D4A373] text-[#D4A373]" />
                          <span>{r.overallRating} / 5</span>
                        </div>

                        {user && user.id === r.userId && (
                          <button
                            onClick={() => onDeleteReview(r.id)}
                            className="p-1 text-[#7A6860] hover:text-rose-600 transition-colors"
                            title="Delete your review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-[#2C1810] leading-relaxed pt-1">{r.comment}</p>

                    {/* Amenity Breakdown */}
                    <div className="flex flex-wrap gap-2 pt-2 text-[11px] text-[#7A6860] border-t border-[#E8E2D9]">
                      {r.wifiRating > 0 && <span className="bg-white border border-[#E8E2D9] px-2 py-0.5 rounded">Wi-Fi: {r.wifiRating}/5</span>}
                      {r.outletRating > 0 && <span className="bg-white border border-[#E8E2D9] px-2 py-0.5 rounded">Outlets: {r.outletRating}/5</span>}
                      {r.noiseLevel !== 'Unknown' && <span className="bg-white border border-[#E8E2D9] px-2 py-0.5 rounded">Noise: {r.noiseLevel}</span>}
                      {r.workFriendly && <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600"/> Work-Friendly</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
