import React from 'react';
import { Wifi, Zap, Volume2, Users, MapPin, Key, Search, Sparkles } from 'lucide-react';

interface HeroProps {
  currentState: string;
  currentCity: string;
  onOpenLocationSelector: () => void;
  onOpenByok: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  currentState,
  currentCity,
  onOpenLocationSelector,
  onOpenByok,
}) => {
  return (
    <section className="relative overflow-hidden bg-white text-[#2C1810] py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-[#E8E2D9]">
      {/* Subtle Background Geometric Pattern */}
      <div className="absolute inset-0 bg-geometric-dots opacity-30 pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#E8E2D9] text-[#5D4037] text-xs font-semibold mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
          <span>Community-Verified Remote Work & Study Cafés</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#5D4037] mb-4 leading-tight">
          Find your perfect <span className="text-[#D4A373] underline decoration-[#D4A373]/50 underline-offset-8">coffee shop</span>.
        </h1>

        {/* Supporting Text */}
        <p className="text-[#7A6860] text-base sm:text-lg max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
          Discover cafés tailored for remote work, studying, or quiet relaxation. Filter by high-speed Wi-Fi, power outlet availability, noise levels, seating capacity, and community ratings across the United States.
        </p>

        {/* Location Search Bar CTA */}
        <div className="max-w-2xl mx-auto bg-[#FAF7F2] p-2.5 sm:p-3 rounded-xl border border-[#E8E2D9] shadow-sm flex flex-col sm:flex-row items-center gap-2 mb-10">
          <div className="flex-1 flex items-center space-x-3 px-3 py-2 w-full text-left">
            <MapPin className="w-5 h-5 text-[#5D4037] shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-[#7A6860] uppercase tracking-wider">Current Location</p>
              <p className="text-[#5D4037] font-bold text-sm sm:text-base">{currentCity}, {currentState}</p>
            </div>
          </div>
          <button
            onClick={onOpenLocationSelector}
            className="w-full sm:w-auto px-6 py-3 bg-[#5D4037] hover:bg-[#432C25] text-white font-bold text-sm rounded-lg transition-all shadow-sm flex items-center justify-center space-x-2 shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>Select State & City</span>
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-4xl mx-auto text-left">
          <div className="bg-white p-3.5 rounded-lg border border-[#E8E2D9] hover:border-[#D4A373] transition-all shadow-2xs">
            <div className="w-8 h-8 rounded-md bg-[#FAF7F2] flex items-center justify-center mb-2 text-[#5D4037] border border-[#E8E2D9]">
              <Wifi className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-[#5D4037]">Verified Wi-Fi</h3>
            <p className="text-[11px] text-[#7A6860]">Speed & reliability</p>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-[#E8E2D9] hover:border-[#D4A373] transition-all shadow-2xs">
            <div className="w-8 h-8 rounded-md bg-[#FAF7F2] flex items-center justify-center mb-2 text-[#5D4037] border border-[#E8E2D9]">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-[#5D4037]">Power Outlets</h3>
            <p className="text-[11px] text-[#7A6860]">Abundant desk plugs</p>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-[#E8E2D9] hover:border-[#D4A373] transition-all shadow-2xs">
            <div className="w-8 h-8 rounded-md bg-[#FAF7F2] flex items-center justify-center mb-2 text-[#5D4037] border border-[#E8E2D9]">
              <Volume2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-[#5D4037]">Noise Level</h3>
            <p className="text-[11px] text-[#7A6860]">Quiet to lively vibes</p>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-[#E8E2D9] hover:border-[#D4A373] transition-all shadow-2xs">
            <div className="w-8 h-8 rounded-md bg-[#FAF7F2] flex items-center justify-center mb-2 text-[#5D4037] border border-[#E8E2D9]">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-[#5D4037]">Seating</h3>
            <p className="text-[11px] text-[#7A6860]">Tables, booths & desks</p>
          </div>

          <div 
            onClick={onOpenByok}
            className="col-span-2 sm:col-span-1 bg-[#FAF7F2] p-3.5 rounded-lg border border-[#E8E2D9] hover:border-[#D4A373] cursor-pointer transition-all group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-md bg-[#5D4037] flex items-center justify-center mb-2 text-white group-hover:scale-105 transition-transform">
              <Key className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-[#5D4037]">BYOK Support</h3>
            <p className="text-[11px] text-[#7A6860]">Use your own API Key</p>
          </div>
        </div>
      </div>
    </section>
  );
};
