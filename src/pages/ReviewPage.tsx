import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../app/store/store';
import { setBoardingPoint, setDroppingPoint } from '../features/booking/bookingSlice';
import { useTripDetails } from '../features/buses/useTripDetails';
import { useTripSeats } from '../features/seat-selection/useTripSeats';
import { calculateBookingTotal, type Coupon } from '../features/pricing/calculateBookingTotal';
import { CouponInput } from '../features/coupons/CouponInput';
import { PointSelector } from '../features/boarding-points/PointSelector';
import { Card } from '../components/ui/Card/Card';
import { Button } from '../components/ui/Button/Button';
import styles from './ReviewPage.module.scss';

export function ReviewPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedSeatIds, passengers, boardingPointId, droppingPointId } = useSelector(
    (state: RootState) => state.booking
  );

  const { data: trip, isLoading: isTripLoading } = useTripDetails(tripId);
  const { data: seats, isLoading: isSeatsLoading } = useTripSeats(tripId);

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const selectedSeats = (seats ?? []).filter((seat) => selectedSeatIds.includes(seat.id));
  const seatPrices = selectedSeats.map((seat) => seat.price);
  const pricing = calculateBookingTotal(seatPrices, appliedCoupon);

  const canProceed =
    selectedSeats.length > 0 &&
    passengers.length === selectedSeats.length &&
    !!boardingPointId &&
    !!droppingPointId;

  if (isTripLoading || isSeatsLoading) {
    return (
      <div className={styles.layout}>
        <div className="skeleton-bar" style={{ height: 400 }} />
      </div>
    );
  }

  if (!trip || selectedSeats.length === 0 || passengers.length === 0) {
    return (
      <div className={styles.layout}>
        <p>Your booking session seems incomplete.</p>
        <Button onClick={() => navigate(`/trip/${tripId}/seats`)} style={{ marginTop: 12 }}>
          Start Over
        </Button>
      </div>
    );
  }

  function handleProceedToPayment() {
    navigate(`/trip/${tripId}/payment`);
  }

  return (
    <div className={styles.layout}>
      <h1 style={{ marginBottom: 24 }}>Review Your Booking</h1>

      <Card style={{ marginBottom: 24 }}>
        <p style={{ fontWeight: 700, fontSize: '1.125rem' }}>
          {trip.sourceCity} → {trip.destinationCity}
        </p>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}>
          {trip.operatorName} &middot; {trip.busType.replace(/_/g, ' ')} &middot; Seats:{' '}
          {selectedSeats.map((s) => s.seatNumber).join(', ')}
        </p>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <PointSelector
          label="Boarding Point"
          points={trip.boardingPoints}
          selectedId={boardingPointId}
          onChange={(id) => dispatch(setBoardingPoint(id))}
          name="boardingPoint"
        />
        <PointSelector
          label="Dropping Point"
          points={trip.droppingPoints}
          selectedId={droppingPointId}
          onChange={(id) => dispatch(setDroppingPoint(id))}
          name="droppingPoint"
        />
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 12 }}>Passengers</h3>
        {passengers.map((passenger) => {
          const seat = selectedSeats.find((s) => s.id === passenger.seatId);
          return (
            <div key={passenger.seatId} className={styles.summaryRow}>
              <span>{passenger.fullName} ({passenger.age}, {passenger.gender})</span>
              <span>Seat {seat?.seatNumber}</span>
            </div>
          );
        })}
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 12 }}>Have a coupon?</h3>
        <CouponInput bookingAmount={pricing.baseFare} onApplied={setAppliedCoupon} />
      </Card>

      <Card>
        <h3 style={{ marginBottom: 12 }}>Fare Summary</h3>
        <div className={styles.summaryRow}>
          <span>Base Fare ({selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''})</span>
          <span>₹{pricing.baseFare.toFixed(0)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Convenience Fee</span>
          <span>₹{pricing.convenienceFeeTotal.toFixed(0)}</span>
        </div>
        {pricing.discountAmount > 0 && (
          <div className={styles.summaryRow} style={{ color: 'var(--color-success)' }}>
            <span>Coupon Discount</span>
            <span>-₹{pricing.discountAmount.toFixed(0)}</span>
          </div>
        )}
        <div className={styles.totalRow}>
          <span>Total Amount</span>
          <span>₹{pricing.totalAmount.toFixed(0)}</span>
        </div>
      </Card>

      <div className={styles.footerBar}>
        {!canProceed && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-error)' }}>
            Please select both boarding and dropping points to continue.
          </p>
        )}
        <Button size="lg" disabled={!canProceed} onClick={handleProceedToPayment} style={{ marginLeft: 'auto' }}>
          Proceed to Pay ₹{pricing.totalAmount.toFixed(0)}
        </Button>
      </div>
    </div>
  );
}