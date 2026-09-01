import { supabase } from '../../lib/supabase';
import type { TripDetails } from './types';

export async function getTripDetails(tripId: string): Promise<TripDetails | null> {
  const { data: trip, error } = await supabase
    .from('bus_trips')
    .select(
      `
      id,
      departure_time,
      arrival_time,
      base_price,
      route:routes (
        distance_km,
        source:cities!routes_source_city_id_fkey ( name ),
        destination:cities!routes_destination_city_id_fkey ( name )
      ),
      bus:buses (
        bus_number,
        bus_type,
        amenities,
        total_seats,
        operator:bus_operators ( name, rating )
      ),
      trip_seats ( status ),
      boarding_points ( id, location_name, address, scheduled_time ),
      dropping_points ( id, location_name, address, scheduled_time )
    `
    )
    .eq('id', tripId)
    .maybeSingle();

  if (error) throw error;
  if (!trip) return null;

  const t: any = trip;

  return {
    id: t.id,
    departureTime: t.departure_time,
    arrivalTime: t.arrival_time,
    basePrice: t.base_price,
    operatorName: t.bus.operator.name,
    operatorRating: t.bus.operator.rating ?? 0,
    busNumber: t.bus.bus_number,
    busType: t.bus.bus_type,
    amenities: t.bus.amenities ?? [],
    availableSeats: t.trip_seats.filter((s: { status: string }) => s.status === 'available').length,
    sourceCity: t.route.source.name,
    destinationCity: t.route.destination.name,
    distanceKm: t.route.distance_km,
    totalSeats: t.bus.total_seats,
    boardingPoints: t.boarding_points.map((bp: any) => ({
      id: bp.id,
      locationName: bp.location_name,
      address: bp.address,
      scheduledTime: bp.scheduled_time,
    })),
    droppingPoints: t.dropping_points.map((dp: any) => ({
      id: dp.id,
      locationName: dp.location_name,
      address: dp.address,
      scheduledTime: dp.scheduled_time,
    })),
  };
}