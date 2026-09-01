import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../app/store/store';
import { setTrip } from '../features/booking/bookingSlice';
import { useTripSeats } from '../features/seat-selection/useTripSeats';
import { useRealtimeSeatUpdates } from '../features/seat-selection/useRealtimeSeatUpdates';
import { SeatMap } from '../features/seat-selection/SeatMap';
import { SeatLegend } from '../features/seat-selection/SeatLegend';
import { useAuth } from '../features/auth/useAuth';
import { Button } from '../components/ui/Button/Button';
import styles from './SeatSelectionPage.module.scss';

export function SeatSelectionPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { session } = useAuth();

  const { data: seats, isLoading, isError, refetch } = useTripSeats(tripId);
  useRealtimeSeatUpdates(tripId);

  const selectedSeatIds = useSelector((state: RootState) => state.booking.selectedSeatIds);

  // Register this trip as the "active" one in our booking draft the moment we land here.
  // If the user was previously mid-selection on a *different* trip, this resets that stale state.
  useEffect(() => {
    if (tripId) dispatch(setTrip(tripId));
  }, [tripId, dispatch]);

  const selectedSeats = (seats ?? []).filter((seat) => selectedSeatIds.includes(seat.id));
  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  function handleContinue() {
    if (!session) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    navigate(`/trip/${tripId}/passengers`);
  }

  if (isLoading) {
    return (
      <div className={styles.layout}>
        <div className="skeleton-bar" style={{ height: 400 }} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.layout}>
        <p>Something went wrong loading seats for this trip.</p>
        <Button onClick={() => refetch()} style={{ marginTop: 12 }}>Retry</Button>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <h1 style={{ marginBottom: 16 }}>Select Your Seats</h1>
      <SeatLegend />
      <SeatMap seats={seats ?? []} />

      <div className={styles.summaryBar}>
        <div className={styles.selectedInfo}>
          {selectedSeats.length === 0 ? (
            <span>No seats selected</span>
          ) : (
            <span>{selectedSeats.map((s) => s.seatNumber).join(', ')} selected</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className={styles.totalPrice}>₹{totalPrice.toFixed(0)}</span>
          <Button size="lg" disabled={selectedSeats.length === 0} onClick={handleContinue}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}