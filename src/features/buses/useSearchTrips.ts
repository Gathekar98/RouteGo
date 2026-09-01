import { useQuery } from '@tanstack/react-query';
import { searchTrips } from './api';

export function useSearchTrips(fromCity: string | null, toCity: string | null, date: string | null) {
  return useQuery({
    queryKey: ['trips-search', fromCity, toCity, date],
    queryFn: () => searchTrips(fromCity!, toCity!, date!),
    enabled: !!fromCity && !!toCity && !!date,
  });
}