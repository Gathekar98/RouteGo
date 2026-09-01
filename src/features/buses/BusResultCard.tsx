import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card/Card';
import { Badge } from '../../components/ui/Badge/Badge';
import { Button } from '../../components/ui/Button/Button';
import { formatDuration, formatTime } from './filterUtils';
import type { BusTripResult } from './types';
import styles from './BusResultCard.module.scss';

export function BusResultCard({ trip }: { trip: BusTripResult }) {
  return (
    <Card>
      <div className={styles.card}>
        <div>
          <p className={styles.operatorName}>{trip.operatorName}</p>
          <p className={styles.busMeta}>
            {trip.busNumber} &middot; {trip.busType.replace('_', ' ')} &middot; ★ {trip.operatorRating.toFixed(1)}
          </p>

          <div className={styles.timing} style={{ marginTop: 8 }}>
            <span className={styles.time}>{formatTime(trip.departureTime)}</span>
            <span className={styles.duration}>{formatDuration(trip.departureTime, trip.arrivalTime)}</span>
            <span className={styles.time}>{formatTime(trip.arrivalTime)}</span>
          </div>

          <div className={styles.amenities} style={{ marginTop: 8 }}>
            {trip.amenities.map((amenity) => (
              <Badge key={amenity} variant="neutral">{amenity}</Badge>
            ))}
          </div>
        </div>

        <div className={styles.priceBlock}>
          <p className={styles.price}>₹{trip.basePrice.toFixed(0)}</p>
          {trip.availableSeats <= 5 && trip.availableSeats > 0 && (
            <p className={styles.seatsLeft}>Only {trip.availableSeats} seats left</p>
          )}
          {trip.availableSeats === 0 ? (
            <Badge variant="error">Sold Out</Badge>
          ) : (
            <Link to={`/bus/${trip.id}`}>
              <Button size="sm">Select Seats</Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}