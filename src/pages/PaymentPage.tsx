import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import type { RootState } from '../app/store/store';
import { clearBookingDraft } from '../features/booking/bookingSlice';
import { useTripSeats } from '../features/seat-selection/useTripSeats';
import { calculateBookingTotal } from '../features/pricing/calculateBookingTotal';
import { validateCoupon } from '../features/coupons/api';
import { createBooking } from '../features/booking/api';
import { PaymentMethodSelector } from '../features/payment/PaymentMethodSelector';
import type { PaymentMethod, PaymentStatus } from '../features/payment/types';
import { useToast } from '../components/ui/Toast/ToastContext';
import { Card } from '../components/ui/Card/Card';
import { Button } from '../components/ui/Button/Button';
import styles from './PaymentPage.module.scss';

const SIMULATED_FAILURE_RATE = 0.15;
const SIMULATED_PROCESSING_MS = 1800;

export function PaymentPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();

  const { selectedSeatIds, passengers, boardingPointId, droppingPointId, couponCode } = useSelector(
    (state: RootState) => state.booking
  );
  const { data: seats } = useTripSeats(tripId);

  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedSeats = (seats ?? []).filter((seat) => selectedSeatIds.includes(seat.id));
  const seatPrices = selectedSeats.map((seat) => seat.price);
  const baseFare = seatPrices.reduce((sum, price) => sum + price, 0);

  // Re-validate the stored coupon here purely for an accurate DISPLAY total.
  // The actual charge is always authoritatively recalculated server-side
  // inside create_booking — this query never affects what gets recorded.
  const { data: couponResult } = useQuery({
    queryKey: ['coupon-display', couponCode, baseFare],
    queryFn: () => validateCoupon(couponCode!, baseFare),
    enabled: !!couponCode,
  });

  const displayCoupon = couponResult?.isValid ? couponResult.coupon : null;
  const pricing = calculateBookingTotal(seatPrices, displayCoupon);

  async function handlePay() {
    if (!method) return;
    setStatus('processing');
    setErrorMessage(null);

    setTimeout(async () => {
      const paymentSimulationSucceeded = Math.random() > SIMULATED_FAILURE_RATE;

      if (!paymentSimulationSucceeded) {
        setStatus('failed');
        setErrorMessage('Your payment could not be processed. No amount has been deducted.');
        toast.error('Payment failed. Please try again.');
        return;
      }

      // Payment "succeeded" — now perform the real, secure booking creation.
      try {
        const result = await createBooking({
          tripId: tripId!,
          passengers,
          boardingPointId: boardingPointId!,
          droppingPointId: droppingPointId!,
          paymentMethod: method,
          couponCode,
        });

        toast.success('Booking confirmed!');
        dispatch(clearBookingDraft());
        navigate(`/trip/${tripId}/confirmation?bookingId=${result.booking_id}`);
      } catch (err) {
        setStatus('failed');
        const message =
          err instanceof Error ? err.message : 'Could not complete your booking. Please try again.';
        setErrorMessage(message);
        toast.error(message);
      }
    }, SIMULATED_PROCESSING_MS);
  }

  function handleCancel() {
    navigate(`/trip/${tripId}/review`);
  }

  if (selectedSeats.length === 0) {
    return (
      <div className={styles.layout}>
        <p>Nothing to pay for — your booking session may have expired.</p>
        <Button onClick={() => navigate('/')} style={{ marginTop: 12 }}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <Card className={styles.amountCard}>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 8 }}>Amount to Pay</p>
        <p className={styles.amount}>₹{pricing.totalAmount.toFixed(0)}</p>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Select Payment Method</h3>
        <PaymentMethodSelector
          selected={method}
          onChange={setMethod}
          disabled={status === 'processing'}
        />
      </Card>

      {status === 'failed' && errorMessage && (
        <Card style={{ marginBottom: 24, borderColor: 'var(--color-error)' }}>
          <p style={{ color: 'var(--color-error)', fontWeight: 600 }}>{errorMessage}</p>
        </Card>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        <Button variant="secondary" onClick={handleCancel} disabled={status === 'processing'} style={{ flex: 1 }}>
          Cancel
        </Button>
        <Button
          onClick={handlePay}
          disabled={!method || status === 'processing'}
          isLoading={status === 'processing'}
          style={{ flex: 2 }}
        >
          {status === 'failed' ? 'Retry Payment' : `Pay ₹${pricing.totalAmount.toFixed(0)}`}
        </Button>
      </div>
    </div>
  );
}