import React from 'react';
import { Coffee, Key, Heart, User as UserIcon, LogOut, MapPin, Sparkles } from 'lucide-react';
import { User, ByokStatus } from '../lib/types';

interface NavbarProps {
  user: User | null;
  byokStatus: ByokStatus;
  favoriteCount: number;
  currentState: string;
  currentCity: string;
  onOpenLocationSelector: () => void;
  onOpenByok: () => void;
  onOpenAuth: () => void;
  onOpenFavorites: () => void;
  onLogout: () => void;
  activeView: 'explore' | 'favorites';
  setActiveView: (view: 'explore' | 'favorites') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  byokStatus,
  favoriteCount,
  currentState,
  currentCity,
  onOpenLocationSelector,
  onOpenByok,
  onOpenAuth,
  onOpenFavorites,
  onLogout,
  activeView,
  setActiveView,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E2D9] text-[#2C1810] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveView('explore')}
          >
            <div className="w-9 h-9 rounded-lg bg-[#5D4037] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Coffee className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-[#5D4037] flex items-center gap-1.5">
                Coffee Shop Finder
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#FAF7F2] text-[#5D4037] border border-[#E8E2D9]">
                  US
                </span>
              </span>
              <p className="text-xs text-[#7A6860] font-medium">Work & Study Cafés</p>
            </div>
          </div>

          {/* Location Indicator & Quick Switch */}
          <button
            onClick={onOpenLocationSelector}
            className="hidden sm:flex items-center space-x-2 px-3.5 py-1.5 rounded-md bg-[#FAF7F2] hover:bg-[#F0ECE7] border border-[#E8E2D9] text-[#2C1810] text-sm font-medium transition-colors"
          >
            <MapPin className="w-4 h-4 text-[#5D4037] shrink-0" />
            <span>
              <span className="text-[#7A6860]">City: </span>
              <strong className="text-[#5D4037] font-semibold">{currentCity}, {currentState}</strong>
            </span>
            <span className="text-xs text-[#5D4037] bg-white border border-[#E8E2D9] px-1.5 py-0.5 rounded ml-1 font-semibold">
              Change
            </span>
          </button>

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Location Switcher Mobile Button */}
            <button
              onClick={onOpenLocationSelector}
              className="sm:hidden p-2 rounded-lg bg-[#FAF7F2] text-[#5D4037] border border-[#E8E2D9]"
              title="Change City"
            >
              <MapPin className="w-5 h-5 text-[#5D4037]" />
            </button>

            {/* BYOK Settings Badge Button */}
            <button
              onClick={onOpenByok}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                byokStatus.configured
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-[#FAF7F2] text-[#5D4037] border-[#E8E2D9] hover:bg-[#F0ECE7]'
              }`}
              title="Google Maps BYOK Key Settings"
            >
              <Key className="w-3.5 h-3.5 text-[#5D4037]" />
              <span className="hidden md:inline">BYOK Key:</span>
              <span className="font-mono">{byokStatus.configured ? 'Active' : 'Set Key'}</span>
            </button>

            {/* Favorites Button */}
            <button
              onClick={onOpenFavorites}
              className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                activeView === 'favorites'
                  ? 'bg-[#5D4037] text-white border-[#5D4037] font-semibold'
                  : 'bg-[#FAF7F2] text-[#5D4037] border-[#E8E2D9] hover:bg-[#F0ECE7]'
              }`}
            >
              <Heart className={`w-4 h-4 ${favoriteCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span className="hidden sm:inline">Saved</span>
              {favoriteCount > 0 && (
                <span className="ml-1 bg-rose-500 text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full">
                  {favoriteCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth */}
            {user ? (
              <div className="flex items-center space-x-2 pl-1 border-l border-[#E8E2D9]">
                <div className="flex items-center space-x-2 bg-[#FAF7F2] px-2.5 py-1.5 rounded-md border border-[#E8E2D9]">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#5D4037] text-white font-bold flex items-center justify-center text-xs">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-[#5D4037] hidden lg:inline max-w-[100px] truncate">
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 text-[#7A6860] hover:text-rose-600 transition-colors"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md bg-[#5D4037] hover:bg-[#432C25] text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
              >
                <UserIcon className="w-4 h-4" />
                <span>Log In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
