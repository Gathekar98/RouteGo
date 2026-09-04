import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card/Card';
import { Badge } from '../../components/ui/Badge/Badge';
import { Button } from '../../components/ui/Button/Button';
import { useToast } from '../../components/ui/Toast/ToastContext';
import { formatTime } from '../buses/filterUtils';
import { getTripBucket } from './types';
import { cancelBooking } from './cancellationApi';
import { CancelBookingDialog } from './CancelBookingDialog';
import type { MyTripSummary } from './types';

function statusBadgeVariant(status: string): 'success' | 'error' | 'neutral' {
  if (status === 'confirmed') return 'success';
  if (status === 'cancelled') return 'error';
  return 'neutral';
}

export function TripCard({ trip }: { trip: MyTripSummary }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const toast = useToast();

  const date = new Date(trip.departureTime).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const bucket = getTripBucket(trip);
  const canCancel = bucket === 'upcoming' && trip.status === 'confirmed';

  async function handleConfirmCancel() {
    try {
      const result = await cancelBooking(trip.bookingId);
      toast.success(
        result.refund_amount > 0
          ? `Booking cancelled. ₹${result.refund_amount} refund initiated.`
          : 'Booking cancelled. No refund applicable per policy.'
      );
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['my-trips'] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not cancel this booking.');
    }
  }

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

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <Link to={`/trip/booking/confirmation?bookingId=${trip.bookingId}`}>
          <Button variant="secondary" size="sm">View Details</Button>
        </Link>
        {canCancel && (
          <Button variant="danger" size="sm" onClick={() => setIsDialogOpen(true)}>
            Cancel Booking
          </Button>
        )}
      </div>

      <CancelBookingDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleConfirmCancel}
        totalAmount={trip.totalAmount}
        departureTime={trip.departureTime}
      />
    </Card>
  );
}