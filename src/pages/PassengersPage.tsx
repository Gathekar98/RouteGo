import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { RootState } from '../app/store/store';
import { setPassengers } from '../features/booking/bookingSlice';
import { useTripSeats } from '../features/seat-selection/useTripSeats';
import { PassengerForm } from '../features/passengers/PassengerForm';
import {
  passengersFormSchema,
  type PassengersFormInput,
  type PassengersFormValues,
} from '../features/passengers/schemas';
import { Button } from '../components/ui/Button/Button';
import styles from './PassengersPage.module.scss';

export function PassengersPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const selectedSeatIds = useSelector((state: RootState) => state.booking.selectedSeatIds);
  const { data: seats, isLoading } = useTripSeats(tripId);

  const selectedSeats = (seats ?? []).filter((seat) => selectedSeatIds.includes(seat.id));

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PassengersFormInput, unknown, PassengersFormValues>({
    resolver: zodResolver(passengersFormSchema),
    defaultValues: { passengers: [] },
  });

  const { fields, replace } = useFieldArray({ control, name: 'passengers' });

  useEffect(() => {
    if (selectedSeats.length > 0) {
      replace(
        selectedSeats.map((seat) => ({
          seatId: seat.id,
          seatNumber: seat.seatNumber,
          fullName: '',
          age: '' as unknown as number,
          gender: undefined as unknown as 'male',
        }))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeats.map((s) => s.id).join(',')]);

  useEffect(() => {
    if (!isLoading && selectedSeatIds.length === 0) {
      navigate(`/trip/${tripId}/seats`, { replace: true });
    }
  }, [isLoading, selectedSeatIds.length, tripId, navigate]);

  function onSubmit(values: PassengersFormValues) {
    dispatch(
      setPassengers(
        values.passengers.map((p) => ({
          seatId: p.seatId,
          fullName: p.fullName,
          age: p.age,
          gender: p.gender,
        }))
      )
    );
    navigate(`/trip/${tripId}/review`);
  }

  if (isLoading || selectedSeats.length === 0) {
    return (
      <div className={styles.layout}>
        <div className="skeleton-bar" style={{ height: 200 }} />
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <h1 style={{ marginBottom: 8 }}>Passenger Details</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>
        Please enter details for all {selectedSeats.length} passenger{selectedSeats.length > 1 ? 's' : ''}.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {fields.map((field, index) => (
          <PassengerForm
            key={field.id}
            index={index}
            seatNumber={selectedSeats[index]?.seatNumber ?? ''}
            register={register}
            errors={errors}
          />
        ))}

        <Button type="submit" size="lg" style={{ width: '100%' }}>
          Continue to Review
        </Button>
      </form>
    </div>
  );
}