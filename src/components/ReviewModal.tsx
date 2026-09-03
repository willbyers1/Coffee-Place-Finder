import React, { useState } from 'react';
import { X, Star, Wifi, Zap, Volume2, Users, CheckCircle } from 'lucide-react';
import { CoffeeShop } from '../lib/types';

interface ReviewModalProps {
  coffeeShop: CoffeeShop | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (data: {
    overallRating: number;
    wifiRating: number;
    outletRating: number;
    noiseLevel: 'Quiet' | 'Moderate' | 'Loud' | 'Unknown';
    seatingRating: number;
    workFriendly: boolean;
    comment: string;
  }) => Promise<void>;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  coffeeShop,
  isOpen,
  onClose,
  onSubmitReview,
}) => {
  const [overallRating, setOverallRating] = useState<number>(5);
  const [wifiRating, setWifiRating] = useState<number>(4);
  const [outletRating, setOutletRating] = useState<number>(4);
  const [noiseLevel, setNoiseLevel] = useState<'Quiet' | 'Moderate' | 'Loud' | 'Unknown'>('Moderate');
  const [seatingRating, setSeatingRating] = useState<number>(4);
  const [workFriendly, setWorkFriendly] = useState<boolean>(true);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen || !coffeeShop) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim().length < 5) {
      setErrorMsg('Please write a comment of at least 5 characters.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await onSubmitReview({
        overallRating,
        wifiRating,
        outletRating,
        noiseLevel,
        seatingRating,
        workFriendly,
        comment,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-[#E8E2D9] w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col text-[#2C1810]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E2D9] bg-[#FAF7F2]">
          <div>
            <h2 className="text-lg font-bold text-[#5D4037]">Leave a Review</h2>
            <p className="text-xs text-[#7A6860]">{coffeeShop.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#7A6860] hover:text-[#5D4037] hover:bg-white transition-colors border border-[#E8E2D9]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Overall Rating Star Selector */}
          <div>
            <label className="text-[10px] font-bold text-[#5D4037] uppercase tracking-wider mb-1.5 block">
              1. Overall Café Rating
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setOverallRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= overallRating
                        ? 'fill-[#D4A373] text-[#D4A373]'
                        : 'fill-[#E8E2D9] text-[#E8E2D9]'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Wi-Fi Rating */}
          <div>
            <label className="text-xs font-semibold text-[#5D4037] mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Wifi className="w-3.5 h-3.5 text-[#D4A373]"/> Wi-Fi Speed & Reliability</span>
              <span className="font-bold text-[#5D4037]">{wifiRating}/5</span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={wifiRating}
              onChange={(e) => setWifiRating(parseInt(e.target.value))}
              className="w-full accent-[#5D4037] bg-[#FAF7F2] rounded-lg cursor-pointer"
            />
          </div>

          {/* Outlets Rating */}
          <div>
            <label className="text-xs font-semibold text-[#5D4037] mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-[#D4A373]"/> Power Outlet Availability</span>
              <span className="font-bold text-[#5D4037]">{outletRating}/5</span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={outletRating}
              onChange={(e) => setOutletRating(parseInt(e.target.value))}
              className="w-full accent-[#5D4037] bg-[#FAF7F2] rounded-lg cursor-pointer"
            />
          </div>

          {/* Noise Level Option */}
          <div>
            <label className="text-xs font-semibold text-[#5D4037] mb-1.5 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-[#D4A373]"/> Atmosphere Noise Level
            </label>
            <div className="flex space-x-2">
              {(['Quiet', 'Moderate', 'Loud'] as const).map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setNoiseLevel(lvl)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md border transition-all ${
                    noiseLevel === lvl
                      ? 'bg-[#5D4037] text-white border-[#5D4037]'
                      : 'bg-[#FAF7F2] text-[#7A6860] border-[#E8E2D9] hover:bg-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Seating Rating */}
          <div>
            <label className="text-xs font-semibold text-[#5D4037] mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-[#D4A373]"/> Seating Availability</span>
              <span className="font-bold text-[#5D4037]">{seatingRating}/5</span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={seatingRating}
              onChange={(e) => setSeatingRating(parseInt(e.target.value))}
              className="w-full accent-[#5D4037] bg-[#FAF7F2] rounded-lg cursor-pointer"
            />
          </div>

          {/* Work Friendly Checkbox */}
          <div className="pt-1">
            <label className="flex items-center space-x-2 cursor-pointer bg-[#FAF7F2] px-3 py-2 rounded-lg border border-[#E8E2D9]">
              <input
                type="checkbox"
                checked={workFriendly}
                onChange={(e) => setWorkFriendly(e.target.checked)}
                className="w-4 h-4 rounded text-[#5D4037] accent-[#5D4037] focus:ring-[#5D4037]"
              />
              <span className="text-xs font-medium text-[#2C1810]">
                I recommend this café for laptop work and studying
              </span>
            </label>
          </div>

          {/* Comment Textarea */}
          <div>
            <label className="text-xs font-semibold text-[#5D4037] mb-1 block">
              Written Review & Tips
            </label>
            <textarea
              rows={3}
              placeholder="Mention Wi-Fi password, best study seats, quiet hours..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#E8E2D9] rounded-md p-3 text-xs text-[#2C1810] placeholder-[#7A6860]/60 focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#E8E2D9]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-[#FAF7F2] text-[#7A6860] text-xs font-semibold rounded-md border border-[#E8E2D9]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#5D4037] hover:bg-[#432C25] text-white font-bold text-xs rounded-md shadow-xs transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
