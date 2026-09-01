import { useParams, useNavigate } from 'react-router-dom';
import { useTripDetails } from '../features/buses/useTripDetails';
import { formatDuration, formatTime } from '../features/buses/filterUtils';
import { Card } from '../components/ui/Card/Card';
import { Badge } from '../components/ui/Badge/Badge';
import { Button } from '../components/ui/Button/Button';
import { Tabs } from '../components/ui/Tabs/Tabs';
import styles from './BusDetailsPage.module.scss';

export function BusDetailsPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { data: trip, isLoading, isError, refetch } = useTripDetails(tripId);

  if (isLoading) {
    return (
      <div className={styles.layout}>
        <div className="skeleton-bar" style={{ height: 120, marginBottom: 24 }} />
        <div className="skeleton-bar" style={{ height: 300 }} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.layout}>
        <p>Something went wrong loading this trip.</p>
        <Button onClick={() => refetch()} style={{ marginTop: 12 }}>Retry</Button>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className={styles.layout}>
        <p>This trip could not be found. It may no longer be available.</p>
        <Button onClick={() => navigate('/')} style={{ marginTop: 12 }}>Back to Home</Button>
      </div>
    );
  }

  const tabs = [
    {
      id: 'amenities',
      label: 'Amenities',
      content: (
        <div className={styles.amenitiesGrid}>
          {trip.amenities.length > 0 ? (
            trip.amenities.map((amenity) => <Badge key={amenity} variant="neutral">{amenity}</Badge>)
          ) : (
            <p>No amenities listed for this bus.</p>
          )}
        </div>
      ),
    },
    {
      id: 'points',
      label: 'Boarding & Dropping',
      content: (
        <div>
          <h3 style={{ marginBottom: 8 }}>Boarding Points</h3>
          {trip.boardingPoints.map((bp) => (
            <div key={bp.id} className={styles.pointRow}>
              <div>
                <p>{bp.locationName}</p>
                {bp.address && <p className={styles.pointAddress}>{bp.address}</p>}
              </div>
              <p className={styles.pointTime}>{formatTime(bp.scheduledTime)}</p>
            </div>
          ))}

          <h3 style={{ margin: '16px 0 8px' }}>Dropping Points</h3>
          {trip.droppingPoints.map((dp) => (
            <div key={dp.id} className={styles.pointRow}>
              <div>
                <p>{dp.locationName}</p>
                {dp.address && <p className={styles.pointAddress}>{dp.address}</p>}
              </div>
              <p className={styles.pointTime}>{formatTime(dp.scheduledTime)}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'policy',
      label: 'Policies',
      content: (
        <div className={styles.policyList}>
          <p><strong>Cancellation:</strong> Free cancellation up to 6 hours before departure. 50% refund between 6 and 2 hours before departure. No refund within 2 hours of departure.</p>
          <p><strong>Luggage:</strong> One bag up to 15kg included per passenger. Additional or oversized luggage may incur charges payable directly to the operator.</p>
          <p><strong>Boarding:</strong> Please arrive at your boarding point at least 15 minutes before the scheduled time. The bus will not wait for late passengers.</p>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.layout}>
      <Card>
        <div className={styles.summaryCard}>
          <div>
            <p className={styles.route}>{trip.sourceCity} → {trip.destinationCity}</p>
            <p className={styles.meta}>
              {trip.operatorName} &middot; {trip.busNumber} &middot; {trip.busType.replace(/_/g, ' ')}
            </p>
            <p className={styles.meta}>
              {formatTime(trip.departureTime)} — {formatTime(trip.arrivalTime)} &middot; {formatDuration(trip.departureTime, trip.arrivalTime)}
              {trip.distanceKm && ` \u00b7 ${trip.distanceKm} km`}
            </p>
            <p className={styles.meta}>★ {trip.operatorRating.toFixed(1)} rating</p>
          </div>
          <div className={styles.priceBlock}>
            <p className={styles.price}>₹{trip.basePrice.toFixed(0)}</p>
            <p className={styles.meta}>{trip.availableSeats} / {trip.totalSeats} seats available</p>
            {trip.availableSeats === 0 ? (
              <Badge variant="error">Sold Out</Badge>
            ) : (
              <Button size="lg" onClick={() => navigate(`/trip/${trip.id}/seats`)} style={{ marginTop: 8 }}>
                Select Seats
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <Tabs tabs={tabs} defaultTabId="amenities" />
      </Card>
    </div>
  );
}