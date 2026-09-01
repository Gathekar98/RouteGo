import { useQuery } from '@tanstack/react-query';
import { getTripSeats } from './api';

export function useTripSeats(tripId: string | undefined) {
  return useQuery({
    queryKey: ['trip-seats', tripId],
    queryFn: () => getTripSeats(tripId!),
    enabled: !!tripId,
  });
}