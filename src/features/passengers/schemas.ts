import { z } from 'zod';

export const passengerSchema = z.object({
  seatId: z.string(),
  seatNumber: z.string(),
  fullName: z.string().min(2, "Enter the passenger's full name"),
  age: z.coerce
    .number({ message: 'Enter a valid age' })
    .int('Age must be a whole number')
    .min(1, 'Age must be at least 1')
    .max(119, 'Enter a valid age'),
  gender: z.enum(['male', 'female', 'other'], {
    message: 'Select a gender',
  }),
});

export const passengersFormSchema = z.object({
  passengers: z.array(passengerSchema).min(1, 'At least one passenger is required'),
});

// The shape of the form BEFORE Zod parses it (age can still be a raw string here)
export type PassengersFormInput = z.input<typeof passengersFormSchema>;

// The shape AFTER successful validation/coercion (age is guaranteed a number)
export type PassengersFormValues = z.output<typeof passengersFormSchema>;