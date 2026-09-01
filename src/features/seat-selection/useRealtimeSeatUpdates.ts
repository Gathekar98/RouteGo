import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { Seat } from './types';

export function useRealtimeSeatUpdates(tripId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!tripId) return;

    const channel = supabase
      .channel(`trip-seats-${tripId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'trip_seats',
          filter: `trip_id=eq.${tripId}`,
        },
        (payload) => {
          const updatedSeat = payload.new as {
            id: string;
            status: Seat['status'];
          };

          queryClient.setQueryData<Seat[]>(['trip-seats', tripId], (currentSeats) => {
            if (!currentSeats) return currentSeats;
            return currentSeats.map((seat) =>
              seat.id === updatedSeat.id ? { ...seat, status: updatedSeat.status } : seat
            );
          });
        }
      )
      .subscribe();

    // Critical: always clean up the subscription when the component unmounts
    // or the tripId changes, or you'll leak an open WebSocket channel per visit.
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId, queryClient]);
}