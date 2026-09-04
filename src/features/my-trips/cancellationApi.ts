import { supabase } from '../../lib/supabase';

export interface CancelBookingResult {
  booking_id: string;
  refund_percentage: number;
  refund_amount: number;
}

export async function cancelBooking(bookingId: string): Promise<CancelBookingResult> {
  const { data, error } = await supabase.rpc('cancel_booking', { p_booking_id: bookingId });
  if (error) throw error;
  return data as CancelBookingResult;
}

export function estimateRefund(totalAmount: number, departureTime: string): { percentage: number; amount: number } {
  const hoursUntilDeparture = (new Date(departureTime).getTime() - Date.now()) / (1000 * 60 * 60);
  let percentage: number;
  if (hoursUntilDeparture > 6) percentage = 100;
  else if (hoursUntilDeparture > 2) percentage = 50;
  else percentage = 0;
  return { percentage, amount: Math.round((totalAmount * percentage) / 100) };
}