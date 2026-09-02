import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../app/store/store';
import { toggleSeat, MAX_SEATS_PER_BOOKING } from '../booking/bookingSlice';
import { useToast } from '../../components/ui/Toast/ToastContext';
import type { Seat, Deck } from './types';
import styles from './SeatMap.module.scss';

interface SeatMapProps {
  seats: Seat[];
}

export function SeatMap({ seats }: SeatMapProps) {
  const dispatch = useDispatch();
  const toast = useToast();
  const selectedSeatIds = useSelector((state: RootState) => state.booking.selectedSeatIds);

  const hasUpperDeck = seats.some((seat) => seat.deck === 'upper');
  const [activeDeck, setActiveDeck] = useState<Deck>('lower');

  const visibleSeats = seats.filter((seat) => seat.deck === activeDeck);

  function handleSeatClick(seat: Seat) {
    if (seat.status === 'booked') return;

    const isCurrentlySelected = selectedSeatIds.includes(seat.id);
    if (!isCurrentlySelected && selectedSeatIds.length >= MAX_SEATS_PER_BOOKING) {
      toast.info(`You can select up to ${MAX_SEATS_PER_BOOKING} seats per booking.`);
      return;
    }

    dispatch(toggleSeat(seat.id));
  }

  function getSeatClassName(seat: Seat): string {
    if (selectedSeatIds.includes(seat.id)) return styles.selected;
    if (seat.status === 'booked') return styles.booked;
    if (seat.status === 'ladies_only') return styles.ladiesOnly;
    return styles.available;
  }

  return (
    <div>
      {hasUpperDeck && (
        <div className={styles.deckTabs}>
          <button
            className={[styles.deckTab, activeDeck === 'lower' && 'active'].filter(Boolean).join(' ')}
            onClick={() => setActiveDeck('lower')}
          >
            Lower Deck
          </button>
          <button
            className={[styles.deckTab, activeDeck === 'upper' && 'active'].filter(Boolean).join(' ')}
            onClick={() => setActiveDeck('upper')}
          >
            Upper Deck
          </button>
        </div>
      )}

      <div className={styles.grid} role="group" aria-label={`${activeDeck} deck seats`}>
        {visibleSeats.map((seat) => (
          <button
            key={seat.id}
            className={`${styles.seat} ${getSeatClassName(seat)}`}
            disabled={seat.status === 'booked'}
            aria-pressed={selectedSeatIds.includes(seat.id)}
            aria-label={`Seat ${seat.seatNumber}, ${seat.status === 'booked' ? 'booked' : `₹${seat.price}`}`}
            onClick={() => handleSeatClick(seat)}
          >
            {seat.seatNumber}
          </button>
        ))}
      </div>
    </div>
  );
}