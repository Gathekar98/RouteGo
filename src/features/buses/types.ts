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

export interface BoardingPoint {
  id: string;
  locationName: string;
  address: string | null;
  scheduledTime: string;
}

export interface TripDetails extends BusTripResult {
  sourceCity: string;
  destinationCity: string;
  distanceKm: number | null;
  totalSeats: number;
  boardingPoints: BoardingPoint[];
  droppingPoints: BoardingPoint[];
}