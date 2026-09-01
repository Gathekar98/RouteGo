import type { BusTripResult, TripFilters, SortOption } from './types';

export function applyFiltersAndSort(
  trips: BusTripResult[],
  filters: TripFilters,
  sort: SortOption
): BusTripResult[] {
  let result = trips.filter((trip) => {
    if (filters.busTypes.length > 0 && !filters.busTypes.includes(trip.busType)) {
      return false;
    }
    if (filters.maxPrice !== null && trip.basePrice > filters.maxPrice) {
      return false;
    }
    if (filters.minRating !== null && trip.operatorRating < filters.minRating) {
      return false;
    }
    return true;
  });

  result = [...result].sort((a, b) => {
    switch (sort) {
      case 'price_asc':
        return a.basePrice - b.basePrice;
      case 'price_desc':
        return b.basePrice - a.basePrice;
      case 'departure_asc':
        return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
      case 'departure_desc':
        return new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime();
      case 'duration_asc': {
        const durationA = new Date(a.arrivalTime).getTime() - new Date(a.departureTime).getTime();
        const durationB = new Date(b.arrivalTime).getTime() - new Date(b.departureTime).getTime();
        return durationA - durationB;
      }
      case 'rating_desc':
        return b.operatorRating - a.operatorRating;
      default:
        return 0;
    }
  });

  return result;
}

export function formatDuration(departureTime: string, arrivalTime: string): string {
  const minutes = Math.round(
    (new Date(arrivalTime).getTime() - new Date(departureTime).getTime()) / 60000
  );
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}