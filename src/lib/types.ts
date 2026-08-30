export type WifiOption = 'All' | 'Available' | 'Unavailable' | 'Unknown';
export type OutletOption = 'All' | 'Many' | 'Some' | 'Limited' | 'Unknown';
export type NoiseOption = 'All' | 'Quiet' | 'Moderate' | 'Loud' | 'Unknown';
export type SeatingOption = 'All' | 'Plenty' | 'Moderate' | 'Limited' | 'Unknown';

export interface FilterOptions {
  wifi: WifiOption;
  outlets: OutletOption;
  noise: NoiseOption;
  seating: SeatingOption;
  workFriendlyOnly: boolean;
  minRating: number; // 0 to 5
  priceLevel: number | null; // 1, 2, 3, 4 or null for any
  openNow: boolean;
  searchQuery: string;
  sortBy: 'recommended' | 'rating' | 'reviews' | 'wifi' | 'outlets' | 'quietest' | 'seating';
}

export interface CommunityAmenities {
  wifiRating: number; // 1-5 scale (avg)
  wifiText: 'Excellent' | 'Good' | 'Poor' | 'None' | 'Unknown';
  outletRating: number; // 1-5 scale (avg)
  outletText: 'Many' | 'Some' | 'Limited' | 'Unknown';
  noiseRating: number; // 1-5 scale (1=quiet, 5=loud)
  noiseText: 'Quiet' | 'Moderate' | 'Loud' | 'Unknown';
  seatingRating: number; // 1-5 scale (avg)
  seatingText: 'Plenty' | 'Moderate' | 'Limited' | 'Unknown';
  workFriendlyPercent: number; // percentage of reviewers saying work friendly
  totalCommunityReviews: number;
  overallCommunityRating: number;
}

export interface CoffeeShop {
  id: string;
  googlePlaceId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  googleRating: number | null;
  userRatingsTotal: number;
  priceLevel: number | null;
  phoneNumber: string | null;
  website: string | null;
  photoUrl: string | null;
  isFavorite?: boolean;
  communityAmenities: CommunityAmenities;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  userId: string;
  coffeeShopId: string;
  userName: string;
  userAvatar?: string | null;
  overallRating: number;
  wifiRating: number;
  outletRating: number;
  noiseLevel: 'Quiet' | 'Moderate' | 'Loud' | 'Unknown';
  seatingRating: number;
  workFriendly: boolean;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
}

export interface ByokStatus {
  configured: boolean;
  maskedKey: string | null;
  source: 'user' | 'system' | 'none';
}

export interface USState {
  name: string;
  code: string;
  popularCities: string[];
}
