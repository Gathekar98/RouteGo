import { supabase } from '../../lib/supabase';
import type { BusTripResult } from './types';

export async function searchTrips(
  fromCity: string,
  toCity: string,
  date: string
): Promise<BusTripResult[]> {
  // Step 1: resolve city names to IDs
  const { data: source, error: sourceError } = await supabase
    .from('cities')
    .select('id')
    .ilike('name', fromCity)
    .maybeSingle();
  if (sourceError) throw sourceError;
  if (!source) return [];

  const { data: destination, error: destError } = await supabase
    .from('cities')
    .select('id')
    .ilike('name', toCity)
    .maybeSingle();
  if (destError) throw destError;
  if (!destination) return [];

  // Step 2: resolve the route connecting those two cities
  const { data: route, error: routeError } = await supabase
    .from('routes')
    .select('id')
    .eq('source_city_id', source.id)
    .eq('destination_city_id', destination.id)
    .maybeSingle();
  if (routeError) throw routeError;
  if (!route) return [];

  // Step 3: fetch trips on that route, on that date, with bus/operator/seat info joined
  const dayStart = `${date}T00:00:00`;
  const dayEnd = `${date}T23:59:59`;

  const { data: trips, error: tripsError } = await supabase
    .from('bus_trips')
    .select(
      `
      id,
      departure_time,
      arrival_time,
      base_price,
      bus:buses (
        bus_number,
        bus_type,
        amenities,
        operator:bus_operators ( name, rating )
      ),
      trip_seats ( status )
    `
    )
    .eq('route_id', route.id)
    .gte('departure_time', dayStart)
    .lte('departure_time', dayEnd)
    .order('departure_time');

  if (tripsError) throw tripsError;

  return (trips ?? []).map((trip: any) => ({
    id: trip.id,
    departureTime: trip.departure_time,
    arrivalTime: trip.arrival_time,
    basePrice: trip.base_price,
    operatorName: trip.bus.operator.name,
    operatorRating: trip.bus.operator.rating ?? 0,
    busNumber: trip.bus.bus_number,
    busType: trip.bus.bus_type,
    amenities: trip.bus.amenities ?? [],
    availableSeats: trip.trip_seats.filter((s: { status: string }) => s.status === 'available').length,
  }));
}