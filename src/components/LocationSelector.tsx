import React, { useState } from 'react';
import { X, Search, MapPin, ChevronRight, Check } from 'lucide-react';
import { US_STATES } from '../lib/usData';

interface LocationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: string;
  currentCity: string;
  onSelectLocation: (state: string, city: string) => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  isOpen,
  onClose,
  currentState,
  currentCity,
  onSelectLocation,
}) => {
  const [selectedState, setSelectedState] = useState<string>(currentState);
  const [selectedCity, setSelectedCity] = useState<string>(currentCity);
  const [stateSearch, setStateSearch] = useState<string>('');
  const [customCity, setCustomCity] = useState<string>('');

  if (!isOpen) return null;

  const currentStateObj = US_STATES.find(
    s => s.name.toLowerCase() === selectedState.toLowerCase()
  ) || US_STATES[4]; // Default to California if match fails

  const filteredStates = US_STATES.filter(s =>
    s.name.toLowerCase().includes(stateSearch.toLowerCase()) ||
    s.code.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const handleApply = (stateName: string, cityName: string) => {
    onSelectLocation(stateName, cityName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-[#E8E2D9] w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] text-[#2C1810]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E2D9] bg-[#FAF7F2]">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-[#5D4037] text-white">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#5D4037]">Select Location</h2>
              <p className="text-xs text-[#7A6860]">Choose a U.S. State and City to discover local coffee shops</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7A6860] hover:text-[#5D4037] hover:bg-white transition-colors border border-[#E8E2D9]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#E8E2D9] flex-1 overflow-hidden">
          {/* Column 1: State Selection */}
          <div className="flex flex-col p-4 overflow-hidden h-64 md:h-auto">
            <label className="text-[10px] font-bold text-[#5D4037] uppercase tracking-wider mb-2">
              1. Choose U.S. State
            </label>
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-[#7A6860] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search state..."
                value={stateSearch}
                onChange={(e) => setStateSearch(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8E2D9] rounded-md pl-9 pr-3 py-2 text-sm text-[#2C1810] placeholder-[#7A6860]/60 focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
              />
            </div>
            <div className="flex-1 overflow-y-auto pr-1 space-y-1 scrollbar-thin">
              {filteredStates.map((s) => {
                const isSelected = s.name.toLowerCase() === selectedState.toLowerCase();
                return (
                  <button
                    key={s.code}
                    onClick={() => {
                      setSelectedState(s.name);
                      if (s.popularCities.length > 0) {
                        setSelectedCity(s.popularCities[0]);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-left font-medium transition-colors ${
                      isSelected
                        ? 'bg-[#5D4037] text-white font-bold'
                        : 'text-[#2C1810] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <span>{s.name} ({s.code})</span>
                    {isSelected ? <Check className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 opacity-40" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column 2: City Selection */}
          <div className="flex flex-col p-4 overflow-hidden h-72 md:h-auto bg-[#FAF7F2]/50">
            <label className="text-[10px] font-bold text-[#5D4037] uppercase tracking-wider mb-2">
              2. Choose City in {currentStateObj.name}
            </label>

            <p className="text-xs text-[#7A6860] mb-3">Popular Cities:</p>
            <div className="space-y-1 overflow-y-auto mb-4 pr-1 scrollbar-thin max-h-48">
              {currentStateObj.popularCities.map((city) => {
                const isSelected = city.toLowerCase() === selectedCity.toLowerCase();
                return (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-left font-medium transition-colors ${
                      isSelected
                        ? 'bg-white text-[#5D4037] border border-[#5D4037] font-bold shadow-2xs'
                        : 'text-[#2C1810] hover:bg-white'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#5D4037]" />
                      {city}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-[#5D4037]" />}
                  </button>
                );
              })}
            </div>

            {/* Custom City Input */}
            <div className="mt-auto pt-3 border-t border-[#E8E2D9]">
              <p className="text-xs font-semibold text-[#7A6860] mb-1.5">Or enter custom city:</p>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="e.g. Palo Alto, Santa Monica..."
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  className="flex-1 bg-white border border-[#E8E2D9] rounded-md px-3 py-2 text-sm text-[#2C1810] placeholder-[#7A6860]/60 focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
                />
                <button
                  onClick={() => {
                    if (customCity.trim()) {
                      setSelectedCity(customCity.trim());
                      setCustomCity('');
                    }
                  }}
                  className="px-3 py-2 bg-[#FAF7F2] hover:bg-[#F0ECE7] text-[#5D4037] text-xs font-bold rounded-md border border-[#E8E2D9]"
                >
                  Select
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E8E2D9] bg-[#FAF7F2]">
          <div className="text-xs text-[#7A6860]">
            Selected: <strong className="text-[#5D4037]">{selectedCity}, {selectedState}</strong>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-[#F0ECE7] text-[#7A6860] text-sm font-semibold rounded-md border border-[#E8E2D9]"
            >
              Cancel
            </button>
            <button
              onClick={() => handleApply(selectedState, selectedCity)}
              className="px-5 py-2 bg-[#5D4037] hover:bg-[#432C25] text-white font-bold text-sm rounded-md transition-all shadow-xs"
            >
              Apply Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
