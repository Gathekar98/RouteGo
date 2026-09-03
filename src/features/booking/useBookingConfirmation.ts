import { useQuery } from '@tanstack/react-query';
import { getBookingConfirmation } from './confirmationApi';

export function useBookingConfirmation(bookingId: string | null) {
  return useQuery({
    queryKey: ['booking-confirmation', bookingId],
    queryFn: () => getBookingConfirmation(bookingId!),
    enabled: !!bookingId,
  });
}