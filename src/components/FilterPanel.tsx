import React from 'react';
import { Filter, RotateCcw, Wifi, Zap, Volume2, Users, Search, SlidersHorizontal, Check } from 'lucide-react';
import { FilterOptions, WifiOption, OutletOption, NoiseOption, SeatingOption } from '../lib/types';

interface FilterPanelProps {
  filters: FilterOptions;
  onFilterChange: (newFilters: FilterOptions) => void;
  onResetFilters: () => void;
  totalResults: number;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults,
}) => {
  const updateFilter = <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const wifiOptions: WifiOption[] = ['All', 'Available', 'Unavailable', 'Unknown'];
  const outletOptions: OutletOption[] = ['All', 'Many', 'Some', 'Limited', 'Unknown'];
  const noiseOptions: NoiseOption[] = ['All', 'Quiet', 'Moderate', 'Loud', 'Unknown'];
  const seatingOptions: SeatingOption[] = ['All', 'Plenty', 'Moderate', 'Limited', 'Unknown'];

  return (
    <div className="bg-white border border-[#E8E2D9] rounded-2xl p-4 sm:p-5 shadow-sm text-[#2C1810] mb-6">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E8E2D9]">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-5 h-5 text-[#5D4037]" />
          <h2 className="font-bold text-base text-[#5D4037]">Work & Study Filters</h2>
          <span className="text-xs bg-[#FAF7F2] text-[#5D4037] font-semibold px-2 py-0.5 rounded-full border border-[#E8E2D9]">
            {totalResults} {totalResults === 1 ? 'Café' : 'Cafés'}
          </span>
        </div>
        <button
          onClick={onResetFilters}
          className="flex items-center space-x-1.5 text-xs font-medium text-[#7A6860] hover:text-[#5D4037] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Main Filter Rows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Search Query */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-1">
          <label className="text-[10px] font-bold text-[#7A6860] uppercase tracking-wider mb-1.5 block">
            Search Café Name
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-[#7A6860] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="e.g. Sightglass, Blue Bottle..."
              value={filters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#E8E2D9] rounded-md pl-9 pr-3 py-2 text-xs sm:text-sm text-[#2C1810] placeholder-[#7A6860]/60 focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
            />
          </div>
        </div>

        {/* Wi-Fi Filter */}
        <div>
          <label className="text-[10px] font-bold text-[#7A6860] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-[#5D4037]" />
            Wi-Fi Availability
          </label>
          <div className="flex rounded-md bg-[#FAF7F2] p-1 border border-[#E8E2D9]">
            {wifiOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => updateFilter('wifi', opt)}
                className={`flex-1 py-1 px-1.5 text-[11px] font-medium rounded transition-all ${
                  filters.wifi === opt
                    ? 'bg-[#5D4037] text-white font-bold shadow-xs'
                    : 'text-[#7A6860] hover:text-[#2C1810]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Power Outlets Filter */}
        <div>
          <label className="text-[10px] font-bold text-[#7A6860] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#5D4037]" />
            Power Outlets
          </label>
          <div className="flex rounded-md bg-[#FAF7F2] p-1 border border-[#E8E2D9]">
            {outletOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => updateFilter('outlets', opt)}
                className={`flex-1 py-1 px-1 text-[11px] font-medium rounded transition-all ${
                  filters.outlets === opt
                    ? 'bg-[#5D4037] text-white font-bold shadow-xs'
                    : 'text-[#7A6860] hover:text-[#2C1810]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Noise Level Filter */}
        <div>
          <label className="text-[10px] font-bold text-[#7A6860] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-[#5D4037]" />
            Noise Level
          </label>
          <div className="flex rounded-md bg-[#FAF7F2] p-1 border border-[#E8E2D9]">
            {noiseOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => updateFilter('noise', opt)}
                className={`flex-1 py-1 px-1 text-[11px] font-medium rounded transition-all ${
                  filters.noise === opt
                    ? 'bg-[#5D4037] text-white font-bold shadow-xs'
                    : 'text-[#7A6860] hover:text-[#2C1810]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end pt-3 border-t border-[#E8E2D9]">
        {/* Seating Filter */}
        <div>
          <label className="text-[10px] font-bold text-[#7A6860] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#5D4037]" />
            Seating Capacity
          </label>
          <div className="flex rounded-md bg-[#FAF7F2] p-1 border border-[#E8E2D9]">
            {seatingOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => updateFilter('seating', opt)}
                className={`flex-1 py-1 px-1 text-[11px] font-medium rounded transition-all ${
                  filters.seating === opt
                    ? 'bg-[#5D4037] text-white font-bold shadow-xs'
                    : 'text-[#7A6860] hover:text-[#2C1810]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Min Rating Filter */}
        <div>
          <label className="text-[10px] font-bold text-[#7A6860] uppercase tracking-wider mb-1.5 block">
            Min Rating: {filters.minRating > 0 ? `${filters.minRating}+ Stars` : 'Any'}
          </label>
          <div className="flex rounded-md bg-[#FAF7F2] p-1 border border-[#E8E2D9]">
            {[0, 3.5, 4.0, 4.5].map((r) => (
              <button
                key={r}
                onClick={() => updateFilter('minRating', r)}
                className={`flex-1 py-1 text-[11px] font-medium rounded transition-all ${
                  filters.minRating === r
                    ? 'bg-[#5D4037] text-white font-bold shadow-xs'
                    : 'text-[#7A6860] hover:text-[#2C1810]'
                }`}
              >
                {r === 0 ? 'All' : `${r}+★`}
              </button>
            ))}
          </div>
        </div>

        {/* Sort By Dropdown */}
        <div>
          <label className="text-[10px] font-bold text-[#7A6860] uppercase tracking-wider mb-1.5 block">
            Sort Results By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value as any)}
            className="w-full bg-[#FAF7F2] border border-[#E8E2D9] rounded-md px-3 py-1.5 text-xs font-semibold text-[#5D4037] focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
          >
            <option value="recommended">⭐ Recommended (Community & Google)</option>
            <option value="rating">🏆 Google Rating (High to Low)</option>
            <option value="reviews">💬 Most Total Reviews</option>
            <option value="wifi">📶 Best Wi-Fi Quality</option>
            <option value="outlets">🔌 Power Outlet Availability</option>
            <option value="quietest">🤫 Quietest Atmosphere</option>
            <option value="seating">🪑 Best Seating Capacity</option>
          </select>
        </div>

        {/* Work Friendly Checkbox Toggle */}
        <div className="flex items-center pt-2 sm:pt-0">
          <label className="flex items-center space-x-2.5 cursor-pointer bg-[#FAF7F2] hover:bg-[#F0ECE7] px-3 py-2 rounded-md border border-[#E8E2D9] w-full transition-colors">
            <input
              type="checkbox"
              checked={filters.workFriendlyOnly}
              onChange={(e) => updateFilter('workFriendlyOnly', e.target.checked)}
              className="w-4 h-4 rounded border-[#E8E2D9] text-[#5D4037] focus:ring-[#5D4037] accent-[#5D4037]"
            />
            <span className="text-xs font-semibold text-[#5D4037]">
              Remote Work Verified Only
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};
