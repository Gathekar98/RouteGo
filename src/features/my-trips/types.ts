export interface MyTripSummary {
  bookingId: string;
  bookingReference: string;
  status: string;
  sourceCity: string;
  destinationCity: string;
  departureTime: string;
  operatorName: string;
  busType: string;
  seatNumbers: string[];
  totalAmount: number;
  paymentStatus: string;
}

export type TripBucket = 'upcoming' | 'completed' | 'cancelled';

export function getTripBucket(trip: MyTripSummary): TripBucket {
  if (trip.status === 'cancelled') return 'cancelled';
  const isPast = new Date(trip.departureTime).getTime() < Date.now();
  return isPast ? 'completed' : 'upcoming';
}