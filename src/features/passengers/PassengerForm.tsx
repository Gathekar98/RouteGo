import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '../../components/ui/Input/Input';
import type { PassengersFormInput } from './schemas';

interface PassengerFormProps {
  index: number;
  seatNumber: string;
  register: UseFormRegister<PassengersFormInput>;
  errors: FieldErrors<PassengersFormInput>;
}

export function PassengerForm({ index, seatNumber, register, errors }: PassengerFormProps) {
  const passengerErrors = errors.passengers?.[index];

  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
      <p style={{ fontWeight: 700, marginBottom: 12 }}>Seat {seatNumber}</p>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '2fr 1fr' }}>
        <Input
          label="Full Name"
          {...register(`passengers.${index}.fullName`)}
          error={passengerErrors?.fullName?.message}
        />
        <Input
          label="Age"
          type="number"
          {...register(`passengers.${index}.age`)}
          error={passengerErrors?.age?.message}
        />
      </div>

      <fieldset style={{ marginTop: 12, border: 'none', padding: 0 }}>
        <legend style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 6 }}>Gender</legend>
        <div style={{ display: 'flex', gap: 16 }}>
          {(['male', 'female', 'other'] as const).map((genderOption) => (
            <label key={genderOption} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="radio" value={genderOption} {...register(`passengers.${index}.gender`)} />
              {genderOption.charAt(0).toUpperCase() + genderOption.slice(1)}
            </label>
          ))}
        </div>
        {passengerErrors?.gender && (
          <p role="alert" style={{ color: 'var(--color-error)', fontSize: '0.8125rem', marginTop: 4 }}>
            {passengerErrors.gender.message}
          </p>
        )}
      </fieldset>
    </div>
  );
}