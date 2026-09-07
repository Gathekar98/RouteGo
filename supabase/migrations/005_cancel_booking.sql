create or replace function public.cancel_booking(p_booking_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_booking record;
  v_hours_until_departure numeric;
  v_refund_percentage numeric;
  v_refund_amount numeric(10,2);
  v_seat_ids uuid[];
begin
  if v_user_id is null then
    raise exception 'You must be logged in to cancel a booking';
  end if;

  select b.*, bt.departure_time
  into v_booking
  from bookings b
  join bus_trips bt on bt.id = b.trip_id
  where b.id = p_booking_id
  for update;

  if v_booking is null then
    raise exception 'Booking not found';
  end if;

  if v_booking.user_id <> v_user_id then
    raise exception 'You do not have permission to cancel this booking';
  end if;

  if v_booking.status = 'cancelled' then
    raise exception 'This booking is already cancelled';
  end if;

  if v_booking.departure_time < now() then
    raise exception 'This trip has already departed and cannot be cancelled';
  end if;

  v_hours_until_departure := extract(epoch from (v_booking.departure_time - now())) / 3600;

  if v_hours_until_departure > 6 then
    v_refund_percentage := 100;
  elsif v_hours_until_departure > 2 then
    v_refund_percentage := 50;
  else
    v_refund_percentage := 0;
  end if;

  v_refund_amount := round(v_booking.total_amount * v_refund_percentage / 100, 2);

  select array_agg(seat_id) into v_seat_ids
  from booking_passengers
  where booking_id = p_booking_id;

  update bookings set status = 'cancelled' where id = p_booking_id;
  update trip_seats set status = 'available' where id = any(v_seat_ids);
  update payments set status = 'refunded' where booking_id = p_booking_id;

  insert into notifications (user_id, type, title, message)
  values (
    v_user_id,
    'refund_initiated',
    'Booking Cancelled',
    'Your booking ' || v_booking.booking_reference || ' has been cancelled. ' ||
      case
        when v_refund_amount > 0 then 'A refund of ₹' || v_refund_amount || ' has been initiated.'
        else 'No refund is applicable as per the cancellation policy.'
      end
  );

  return jsonb_build_object(
    'booking_id', p_booking_id,
    'refund_percentage', v_refund_percentage,
    'refund_amount', v_refund_amount
  );
end;
$$;

revoke all on function public.cancel_booking(uuid) from public;
grant execute on function public.cancel_booking(uuid) to authenticated;