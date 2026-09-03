import { supabase } from '../../lib/supabase';

export interface BookingConfirmation {
  id: string;
  bookingReference: string;
  status: string;
  baseFare: number;
  discountAmount: number;
  convenienceFee: number;
  totalAmount: number;
  createdAt: string;
  sourceCity: string;
  destinationCity: string;
  departureTime: string;
  arrivalTime: string;
  operatorName: string;
  busType: string;
  boardingPoint: string;
  droppingPoint: string;
  seatNumbers: string[];
  passengers: { fullName: string; age: number; gender: string; seatNumber: string }[];
  paymentMethod: string;
  paymentStatus: string;
  paymentReference: string;
}

export async function getBookingConfirmation(bookingId: string): Promise<BookingConfirmation | null> {
  const { data: booking, error } = await supabase
    .from('bookings')
    .select(
      `
      id, booking_reference, status, base_fare, discount_amount,
      convenience_fee, total_amount, created_at,
      trip:bus_trips (
        departure_time, arrival_time,
        route:routes (
          source:cities!routes_source_city_id_fkey ( name ),
          destination:cities!routes_destination_city_id_fkey ( name )
        ),
        bus:buses ( bus_type, operator:bus_operators ( name ) )
      ),
      boarding:boarding_points ( location_name ),
      dropping:dropping_points ( location_name ),
      passengers:booking_passengers (
        full_name, age, gender,
        seat:trip_seats ( seat_number )
      ),
      payment:payments ( payment_method, status, payment_reference )
    `
    )
    .eq('id', bookingId)
    .maybeSingle();

  if (error) throw error;
  if (!booking) return null;

  const b: any = booking;

  return {
    id: b.id,
    bookingReference: b.booking_reference,
    status: b.status,
    baseFare: b.base_fare,
    discountAmount: b.discount_amount,
    convenienceFee: b.convenience_fee,
    totalAmount: b.total_amount,
    createdAt: b.created_at,
    sourceCity: b.trip.route.source.name,
    destinationCity: b.trip.route.destination.name,
    departureTime: b.trip.departure_time,
    arrivalTime: b.trip.arrival_time,
    operatorName: b.trip.bus.operator.name,
    busType: b.trip.bus.bus_type,
    boardingPoint: b.boarding.location_name,
    droppingPoint: b.dropping.location_name,
    seatNumbers: b.passengers.map((p: any) => p.seat.seat_number),
    passengers: b.passengers.map((p: any) => ({
      fullName: p.full_name,
      age: p.age,
      gender: p.gender,
      seatNumber: p.seat.seat_number,
    })),
    paymentMethod: b.payment[0]?.payment_method ?? 'unknown',
    paymentStatus: b.payment[0]?.status ?? 'unknown',
    paymentReference: b.payment[0]?.payment_reference ?? '',
  };
}