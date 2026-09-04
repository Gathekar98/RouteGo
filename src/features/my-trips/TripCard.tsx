import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card/Card';
import { Badge } from '../../components/ui/Badge/Badge';
import { Button } from '../../components/ui/Button/Button';
import { formatTime } from '../buses/filterUtils';
import type { MyTripSummary } from './types';

function statusBadgeVariant(status: string): 'success' | 'error' | 'neutral' {
  if (status === 'confirmed') return 'success';
  if (status === 'cancelled') return 'error';
  return 'neutral';
}

export function TripCard({ trip }: { trip: MyTripSummary }) {
  const date = new Date(trip.departureTime).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: '1.0625rem' }}>
            {trip.sourceCity} → {trip.destinationCity}
          </p>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
            {date} &middot; {formatTime(trip.departureTime)} &middot; {trip.operatorName}
          </p>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Seats: {trip.seatNumbers.join(', ')} &middot; {trip.bookingReference}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Badge variant={statusBadgeVariant(trip.status)}>{trip.status}</Badge>
          <p style={{ fontWeight: 700, marginTop: 8 }}>₹{trip.totalAmount.toFixed(0)}</p>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <Link to={`/trip/booking/confirmation?bookingId=${trip.bookingId}`}>
          <Button variant="secondary" size="sm">View Details</Button>
        </Link>
      </div>
    </Card>
  );
}