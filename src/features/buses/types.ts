export type BusType = 'AC_SLEEPER' | 'NON_AC_SLEEPER' | 'AC_SEATER' | 'NON_AC_SEATER';

export interface BusTripResult {
  id: string;
  departureTime: string;
  arrivalTime: string;
  basePrice: number;
  operatorName: string;
  operatorRating: number;
  busNumber: string;
  busType: BusType;
  amenities: string[];
  availableSeats: number;
}

export interface TripFilters {
  busTypes: BusType[];
  maxPrice: number | null;
  minRating: number | null;
}

export type SortOption =
  | 'price_asc'
  | 'price_desc'
  | 'departure_asc'
  | 'departure_desc'
  | 'duration_asc'
  | 'rating_desc';