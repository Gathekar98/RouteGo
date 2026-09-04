import { supabase } from '../../lib/supabase';
import type { MyTripSummary } from './types';

export async function getMyTrips(): Promise<MyTripSummary[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(
      `
      id, booking_reference, status, total_amount,
      trip:bus_trips (
        departure_time,
        route:routes (
          source:cities!routes_source_city_id_fkey ( name ),
          destination:cities!routes_destination_city_id_fkey ( name )
        ),
        bus:buses ( bus_type, operator:bus_operators ( name ) )
      ),
      passengers:booking_passengers ( seat:trip_seats ( seat_number ) ),
      payment:payments ( status )
    `
    )
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((b: any) => ({
    bookingId: b.id,
    bookingReference: b.booking_reference,
    status: b.status,
    sourceCity: b.trip.route.source.name,
    destinationCity: b.trip.route.destination.name,
    departureTime: b.trip.departure_time,
    operatorName: b.trip.bus.operator.name,
    busType: b.trip.bus.bus_type,
    seatNumbers: b.passengers.map((p: any) => p.seat.seat_number),
    totalAmount: b.total_amount,
    paymentStatus: b.payment[0]?.status ?? 'unknown',
  }));
}