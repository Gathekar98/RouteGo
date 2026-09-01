import { useQuery } from '@tanstack/react-query';
import { getTripDetails } from './detailsApi';

export function useTripDetails(tripId: string | undefined) {
  return useQuery({
    queryKey: ['trip-details', tripId],
    queryFn: () => getTripDetails(tripId!),
    enabled: !!tripId,
  });
}