import { supabase } from '../../lib/supabase';
import type { Seat, Deck } from './types';

export async function getTripSeats(tripId: string): Promise<Seat[]> {
  const { data, error } = await supabase
    .from('trip_seats')
    .select('id, trip_id, seat_number, deck, is_berth, price, status')
    .eq('trip_id', tripId)
    .order('seat_number');

  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    tripId: row.trip_id,
    seatNumber: row.seat_number,
    deck: row.deck as Deck,
    isBerth: row.is_berth,
    price: row.price,
    status: row.status as Seat['status'],
  }));
}