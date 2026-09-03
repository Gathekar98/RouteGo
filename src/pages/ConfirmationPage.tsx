import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useBookingConfirmation } from '../features/booking/useBookingConfirmation';
import { formatTime, formatDuration } from '../features/buses/filterUtils';
import { Card } from '../components/ui/Card/Card';
import { Badge } from '../components/ui/Badge/Badge';
import { Button } from '../components/ui/Button/Button';
import styles from './ConfirmationPage.module.scss';

export function ConfirmationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('bookingId');

  const { data: booking, isLoading, isError } = useBookingConfirmation(bookingId);

  if (isLoading) {
    return (
      <div className={styles.layout}>
        <div className="skeleton-bar" style={{ height: 300 }} />
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className={styles.layout}>
        <h1>Booking Not Found</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>
          We couldn't find this booking, or you may not have permission to view it.
        </p>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <div className={styles.successIcon}>✅</div>
      <h1>Booking Confirmed!</h1>
      <p className={styles.reference}>{booking.bookingReference}</p>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <QRCodeSVG value={booking.bookingReference} size={140} />
      </div>

      <Card className={styles.detailsCard}>
        <div className={styles.row}>
          <strong>Route</strong>
          <span>{booking.sourceCity} → {booking.destinationCity}</span>
        </div>
        <div className={styles.row}>
          <strong>Departure</strong>
          <span>{formatTime(booking.departureTime)}</span>
        </div>
        <div className={styles.row}>
          <strong>Arrival</strong>
          <span>{formatTime(booking.arrivalTime)} ({formatDuration(booking.departureTime, booking.arrivalTime)})</span>
        </div>
        <div className={styles.row}>
          <strong>Operator</strong>
          <span>{booking.operatorName} &middot; {booking.busType.replace(/_/g, ' ')}</span>
        </div>
        <div className={styles.row}>
          <strong>Boarding Point</strong>
          <span>{booking.boardingPoint}</span>
        </div>
        <div className={styles.row}>
          <strong>Dropping Point</strong>
          <span>{booking.droppingPoint}</span>
        </div>
        <div className={styles.row}>
          <strong>Seats</strong>
          <span>{booking.seatNumbers.join(', ')}</span>
        </div>
      </Card>

      <Card className={styles.detailsCard}>
        <h3 style={{ marginBottom: 12 }}>Passengers</h3>
        {booking.passengers.map((p) => (
          <div key={p.seatNumber} className={styles.row}>
            <span>{p.fullName} ({p.age}, {p.gender})</span>
            <span>Seat {p.seatNumber}</span>
          </div>
        ))}
      </Card>

      <Card className={styles.detailsCard}>
        <div className={styles.row}>
          <strong>Amount Paid</strong>
          <span>₹{booking.totalAmount.toFixed(0)}</span>
        </div>
        <div className={styles.row}>
          <strong>Payment Method</strong>
          <span style={{ textTransform: 'uppercase' }}>{booking.paymentMethod}</span>
        </div>
        <div className={styles.row}>
          <strong>Payment Status</strong>
          <Badge variant={booking.paymentStatus === 'success' ? 'success' : 'error'}>
            {booking.paymentStatus}
          </Badge>
        </div>
      </Card>

      <div className={styles.actions}>
        <Button onClick={() => window.print()}>Print Ticket</Button>
        <Link to="/my-trips">
          <Button variant="secondary">View My Trips</Button>
        </Link>
        <Link to="/">
          <Button variant="ghost">Return Home</Button>
        </Link>
      </div>
    </div>
  );
}