import { supabase } from '../../lib/supabase';
import type { Passenger } from './bookingSlice';

export interface CreateBookingResult {
  booking_id: string;
  booking_reference: string;
  total_amount: number;
  status: string;
}

export async function createBooking(params: {
  tripId: string;
  passengers: Passenger[];
  boardingPointId: string;
  droppingPointId: string;
  paymentMethod: string;
  couponCode: string | null;
}): Promise<CreateBookingResult> {
  const { data, error } = await supabase.rpc('create_booking', {
    p_trip_id: params.tripId,
    p_passengers: params.passengers.map((p) => ({
      seat_id: p.seatId,
      full_name: p.fullName,
      age: p.age,
      gender: p.gender,
    })),
    p_boarding_point_id: params.boardingPointId,
    p_dropping_point_id: params.droppingPointId,
    p_payment_method: params.paymentMethod,
    p_coupon_code: params.couponCode,
  });

  if (error) throw error;
  return data as CreateBookingResult;
}