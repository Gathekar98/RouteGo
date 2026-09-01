import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearchTrips } from '../features/buses/useSearchTrips';
import { applyFiltersAndSort } from '../features/buses/filterUtils';
import { BusResultCard } from '../features/buses/BusResultCard';
import { BusCardSkeleton } from '../features/buses/BusCardSkeleton';
import { FiltersPanel } from '../features/buses/FiltersPanel';
import { FiltersDrawer } from '../features/buses/FiltersDrawer';
import { SortBar } from '../features/buses/SortBar';
import { Button } from '../components/ui/Button/Button';
import type { TripFilters, SortOption } from '../features/buses/types';
import styles from './SearchResultsPage.module.scss';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { BREAKPOINTS } from '../constants/breakpoints';

const initialFilters: TripFilters = { busTypes: [], maxPrice: null, minRating: null };

export function SearchResultsPage() {
    const isDesktop = useMediaQuery(BREAKPOINTS.desktop);
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const date = searchParams.get('date');

  const [filters, setFilters] = useState<TripFilters>(initialFilters);
  const [sort, setSort] = useState<SortOption>('departure_asc');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data: trips, isLoading, isError, refetch } = useSearchTrips(from, to, date);

  const visibleTrips = trips ? applyFiltersAndSort(trips, filters, sort) : [];

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <FiltersPanel filters={filters} onChange={setFilters} />
      </aside>

      <div>
        <h1 style={{ marginBottom: 4 }}>{from} → {to}</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}>
          {date && new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>

        <div className={styles.mobileFilterBar} style={{ marginBottom: 16 }}>
          <Button variant="secondary" size="sm" onClick={() => setIsDrawerOpen(true)}>
            Filters {filters.busTypes.length + (filters.maxPrice ? 1 : 0) + (filters.minRating ? 1 : 0) > 0 &&
              `(${filters.busTypes.length + (filters.maxPrice ? 1 : 0) + (filters.minRating ? 1 : 0)})`}
          </Button>
          <SortBar sort={sort} onChange={setSort} />
        </div>

        <div className={styles.resultsHeader}>
          <p>{isLoading ? 'Searching…' : `${visibleTrips.length} buses found`}</p>
          {isDesktop && <SortBar sort={sort} onChange={setSort} />}
        </div>

        {isLoading && (
          <div className={styles.resultsList}>
            <BusCardSkeleton />
            <BusCardSkeleton />
            <BusCardSkeleton />
          </div>
        )}

        {isError && (
          <div className={styles.errorState}>
            <p>Something went wrong while searching for buses.</p>
            <Button onClick={() => refetch()} style={{ marginTop: 12 }}>Retry</Button>
          </div>
        )}

        {!isLoading && !isError && visibleTrips.length === 0 && (
          <div className={styles.emptyState}>
            <p>No buses found for {from} → {to} on this date.</p>
            <p style={{ fontSize: '0.875rem', marginTop: 8 }}>
              Try a different date, or check the route is correct.
            </p>
          </div>
        )}

        {!isLoading && !isError && visibleTrips.length > 0 && (
          <div className={styles.resultsList}>
            {visibleTrips.map((trip) => (
              <BusResultCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>

      <FiltersDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        filters={filters}
        onChange={setFilters}
        resultCount={visibleTrips.length}
      />
    </div>
  );
}