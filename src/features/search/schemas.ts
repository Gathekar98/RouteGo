import { z } from 'zod';

export const searchSchema = z
  .object({
    fromCity: z.string().min(1, 'Please select a departure city'),
    toCity: z.string().min(1, 'Please select a destination city'),
    travelDate: z.string().min(1, 'Please select a travel date'),
  })
  .refine((data) => data.fromCity !== data.toCity, {
    message: 'Source and destination cannot be the same',
    path: ['toCity'],
  })
  .refine(
    (data) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(data.travelDate) >= today;
    },
    { message: 'Travel date cannot be in the past', path: ['travelDate'] }
  );

export type SearchFormValues = z.infer<typeof searchSchema>;