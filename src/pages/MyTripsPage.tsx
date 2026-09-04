import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyTrips } from '../features/my-trips/api';
import { getTripBucket, type TripBucket } from '../features/my-trips/types';
import { TripCard } from '../features/my-trips/TripCard';
import { Tabs } from '../components/ui/Tabs/Tabs';
import { Button } from '../components/ui/Button/Button';
import styles from './MyTripsPage.module.scss';

export function MyTripsPage() {
  const { data: trips, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-trips'],
    queryFn: getMyTrips,
  });

  const [searchTerm, setSearchTerm] = useState('');

  function renderTripList(bucket: TripBucket) {
    const filtered = (trips ?? [])
      .filter((trip) => getTripBucket(trip) === bucket)
      .filter((trip) => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return true;
        return (
          trip.sourceCity.toLowerCase().includes(term) ||
          trip.destinationCity.toLowerCase().includes(term) ||
          trip.bookingReference.toLowerCase().includes(term) ||
          trip.operatorName.toLowerCase().includes(term)
        );
      });

    if (filtered.length === 0) {
      return (
        <div className={styles.emptyState}>
          <p>No {bucket} trips found.</p>
        </div>
      );
    }

    return (
      <div className={styles.list}>
        {filtered.map((trip) => (
          <TripCard key={trip.bookingId} trip={trip} />
        ))}
      </div>
    );
  }

  const tabs = useMemo(
    () => [
      { id: 'upcoming', label: 'Upcoming', content: renderTripList('upcoming') },
      { id: 'completed', label: 'Completed', content: renderTripList('completed') },
      { id: 'cancelled', label: 'Cancelled', content: renderTripList('cancelled') },
    ],
    [trips, searchTerm]
  );

  if (isLoading) {
    return (
      <div className={styles.layout}>
        <div className="skeleton-bar" style={{ height: 300 }} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.layout}>
        <p>Something went wrong loading your trips.</p>
        <Button onClick={() => refetch()} style={{ marginTop: 12 }}>Retry</Button>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <h1 style={{ marginBottom: 20 }}>My Trips</h1>

      <div className={styles.controls}>
        <input
          className={styles.searchInput}
          placeholder="Search by city, operator, or booking reference"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search trips"
        />
      </div>

      <Tabs tabs={tabs} defaultTabId="upcoming" />
    </div>
  );
}