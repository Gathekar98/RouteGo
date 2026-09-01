export type SeatStatus = 'available' | 'booked' | 'ladies_only';
export type Deck = 'lower' | 'upper';

export interface Seat {
  id: string;
  tripId: string;
  seatNumber: string;
  deck: Deck;
  isBerth: boolean;
  price: number;
  status: SeatStatus;
}