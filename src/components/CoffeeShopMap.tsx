import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, Pin, useAdvancedMarkerRef, useMap } from '@vis.gl/react-google-maps';
import { CoffeeShop, ByokStatus } from '../lib/types';
import { Coffee, Star, MapPin, ExternalLink, Key, AlertCircle } from 'lucide-react';

interface CoffeeShopMapProps {
  coffeeShops: CoffeeShop[];
  selectedShopId: string | null;
  onSelectShop: (shop: CoffeeShop) => void;
  onOpenDetails: (shop: CoffeeShop) => void;
  onOpenByok: () => void;
  byokStatus: ByokStatus;
  currentCity: string;
  currentState: string;
}

// Map Centering helper component
function MapRecenter({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    if (map && center) {
      map.panTo(center);
    }
  }, [map, center]);
  return null;
}

// Individual Marker with InfoWindow
function CoffeeShopMarker({
  shop,
  isSelected,
  onSelect,
  onOpenDetails,
}: {
  shop: CoffeeShop;
  isSelected: boolean;
  onSelect: (shop: CoffeeShop) => void;
  onOpenDetails: (shop: CoffeeShop) => void;
}) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [isOpen, setIsOpen] = useState(isSelected);

  useEffect(() => {
    setIsOpen(isSelected);
  }, [isSelected]);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: shop.latitude, lng: shop.longitude }}
        onClick={() => {
          onSelect(shop);
          setIsOpen(true);
        }}
        title={shop.name}
      >
        <div
          className={`p-2 rounded-full border-2 shadow-md transition-all ${
            isSelected
              ? 'bg-[#5D4037] border-white text-white scale-125 z-30'
              : 'bg-white border-[#5D4037] text-[#5D4037] hover:scale-110'
          }`}
        >
          <Coffee className="w-5 h-5 stroke-[2.5]" />
        </div>
      </AdvancedMarker>

      {isOpen && (
        <InfoWindow
          anchor={marker}
          onCloseClick={() => setIsOpen(false)}
          className="p-0 border-0 rounded-xl overflow-hidden shadow-lg"
        >
          <div className="bg-white text-[#2C1810] p-3 max-w-xs rounded-lg font-sans border border-[#E8E2D9]">
            <h4 className="font-bold text-sm text-[#5D4037] mb-1">{shop.name}</h4>
            <p className="text-xs text-[#7A6860] flex items-center gap-1 mb-2">
              <MapPin className="w-3 h-3 text-[#5D4037] shrink-0" />
              <span className="truncate">{shop.address}</span>
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-[#E8E2D9]">
              {shop.googleRating ? (
                <div className="flex items-center space-x-1 text-xs">
                  <Star className="w-3.5 h-3.5 fill-[#D4A373] text-[#D4A373]" />
                  <span className="font-bold text-[#5D4037]">{shop.googleRating.toFixed(1)}</span>
                </div>
              ) : (
                <span className="text-xs text-[#7A6860]">Community Rated</span>
              )}

              <button
                onClick={() => onOpenDetails(shop)}
                className="px-2.5 py-1 bg-[#5D4037] hover:bg-[#432C25] text-white font-bold text-xs rounded-md flex items-center gap-1"
              >
                <span>Details</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export const CoffeeShopMap: React.FC<CoffeeShopMapProps> = ({
  coffeeShops,
  selectedShopId,
  onSelectShop,
  onOpenDetails,
  onOpenByok,
  byokStatus,
  currentCity,
  currentState,
}) => {
  const apiKey =
    process.env.GOOGLE_MAPS_PLATFORM_KEY ||
    (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
    '';

  const hasValidKey = Boolean(apiKey) && apiKey !== 'YOUR_API_KEY';

  // Calculate default map center
  const selectedShop = coffeeShops.find((s) => s.id === selectedShopId);
  const defaultCenter = selectedShop
    ? { lat: selectedShop.latitude, lng: selectedShop.longitude }
    : coffeeShops.length > 0
    ? { lat: coffeeShops[0].latitude, lng: coffeeShops[0].longitude }
    : { lat: 37.7749, lng: -122.4194 }; // San Francisco fallback

  if (!hasValidKey) {
    return (
      <div className="w-full h-full min-h-[400px] bg-white border border-[#E8E2D9] rounded-2xl flex flex-col items-center justify-center p-6 text-center text-[#2C1810]">
        <div className="w-14 h-14 bg-[#FAF7F2] rounded-2xl flex items-center justify-center text-[#5D4037] mb-4 border border-[#E8E2D9]">
          <Key className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-[#5D4037] mb-2">Google Maps API Key Required</h3>
        <p className="text-xs text-[#7A6860] max-w-sm mb-6 leading-relaxed">
          To view interactive maps, enter your Google Maps API key using our Bring Your Own Key (BYOK) settings or set <code className="bg-[#FAF7F2] text-[#5D4037] px-1.5 py-0.5 rounded font-mono border border-[#E8E2D9]">GOOGLE_MAPS_PLATFORM_KEY</code> in secrets.
        </p>
        <button
          onClick={onOpenByok}
          className="px-5 py-2.5 bg-[#5D4037] hover:bg-[#432C25] text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center space-x-2"
        >
          <Key className="w-4 h-4" />
          <span>Configure BYOK Google Maps Key</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden border border-[#E8E2D9] relative shadow-sm">
      <APIProvider apiKey={apiKey} version="weekly">
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={13}
          mapId="COFFEE_SHOP_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
          gestureHandling="greedy"
          disableDefaultUI={false}
        >
          {selectedShop && (
            <MapRecenter center={{ lat: selectedShop.latitude, lng: selectedShop.longitude }} />
          )}

          {coffeeShops.map((shop) => (
            <CoffeeShopMarker
              key={shop.id}
              shop={shop}
              isSelected={selectedShopId === shop.id}
              onSelect={onSelectShop}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </Map>
      </APIProvider>
    </div>
  );
};
