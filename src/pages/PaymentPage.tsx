import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store/store';
import { useTripSeats } from '../features/seat-selection/useTripSeats';
import { calculateBookingTotal } from '../features/pricing/calculateBookingTotal';
import { PaymentMethodSelector } from '../features/payment/PaymentMethodSelector';
import type { PaymentMethod, PaymentStatus } from '../features/payment/types';
import { useToast } from '../components/ui/Toast/ToastContext';
import { Card } from '../components/ui/Card/Card';
import { Button } from '../components/ui/Button/Button';
import styles from './PaymentPage.module.scss';

// Simulated failure rate — deliberately not 0%, so the failure/retry path
// gets real exercise rather than being dead code no one ever sees run.
const SIMULATED_FAILURE_RATE = 0.15;
const SIMULATED_PROCESSING_MS = 1800;

export function PaymentPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const { selectedSeatIds } = useSelector((state: RootState) => state.booking);
  const { data: seats } = useTripSeats(tripId);

  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [status, setStatus] = useState<PaymentStatus>('idle');

  const selectedSeats = (seats ?? []).filter((seat) => selectedSeatIds.includes(seat.id));
  const seatPrices = selectedSeats.map((seat) => seat.price);
  // Note: coupon isn't re-applied here since it lives only in component state on
  // the Review page in our current implementation — Phase 16 will need to persist
  // the applied coupon into Redux too, so the final charge reflects it. Flagging
  // this as a real gap to close before wiring up actual booking creation.
  const pricing = calculateBookingTotal(seatPrices, null);

  function handlePay() {
    if (!method) return;
    setStatus('processing');

    setTimeout(() => {
      const didSucceed = Math.random() > SIMULATED_FAILURE_RATE;

      if (didSucceed) {
        setStatus('success');
        toast.success('Payment successful!');
        // Phase 16 will replace this with real, secure booking creation.
        // For now we just simulate arriving at a confirmation step.
        navigate(`/trip/${tripId}/confirmation`);
      } else {
        setStatus('failed');
        toast.error('Payment failed. Please try again.');
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

      {status === 'failed' && (
        <Card style={{ marginBottom: 24, borderColor: 'var(--color-error)' }}>
          <p style={{ color: 'var(--color-error)', fontWeight: 600 }}>
            Your payment could not be processed. No amount has been deducted.
          </p>
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