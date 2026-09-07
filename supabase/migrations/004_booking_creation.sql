-- Final, corrected version (fixes FOR UPDATE + aggregate restriction,
-- and unassigned v_coupon record error hit during testing)
create or replace function public.create_booking(
  p_trip_id uuid,
  p_passengers jsonb,
  p_boarding_point_id uuid,
  p_dropping_point_id uuid,
  p_payment_method text,
  p_coupon_code text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_seat_ids uuid[];
  v_seat_count int;
  v_locked_count int;
  v_base_fare numeric(10,2);
  v_convenience_fee numeric(10,2);
  v_discount numeric(10,2) := 0;
  v_total numeric(10,2);
  v_coupon record;
  v_coupon_id uuid := null;
  v_booking_id uuid;
  v_booking_reference text;
  v_payment_reference text;
  v_passenger jsonb;
begin
  if v_user_id is null then
    raise exception 'You must be logged in to create a booking';
  end if;

  select array_agg((p->>'seat_id')::uuid) into v_seat_ids
  from jsonb_array_elements(p_passengers) as p;

  v_seat_count := array_length(v_seat_ids, 1);
  if v_seat_count is null or v_seat_count = 0 then
    raise exception 'No seats provided for this booking';
  end if;

  create temporary table locked_seats on commit drop as
  select id, price
  from trip_seats
  where id = any(v_seat_ids)
    and trip_id = p_trip_id
    and status = 'available'
  for update;

  select count(*), coalesce(sum(price), 0)
  into v_locked_count, v_base_fare
  from locked_seats;

  if v_locked_count <> v_seat_count then
    raise exception 'One or more selected seats are no longer available. Please go back and reselect your seats.';
  end if;

  v_convenience_fee := v_seat_count * 20;

  if p_coupon_code is not null then
    select * into v_coupon
    from coupons
    where code ilike p_coupon_code
      and is_active = true
      and valid_until > now();

    if v_coupon is null then
      raise exception 'This coupon is invalid or has expired';
    end if;

    if v_base_fare < v_coupon.min_booking_amount then
      raise exception 'This coupon requires a minimum booking amount of %', v_coupon.min_booking_amount;
    end if;

    if v_coupon.discount_type = 'percentage' then
      v_discount := v_base_fare * v_coupon.discount_value / 100;
    else
      v_discount := v_coupon.discount_value;
    end if;

    if v_coupon.max_discount_amount is not null then
      v_discount := least(v_discount, v_coupon.max_discount_amount);
    end if;
    v_discount := least(v_discount, v_base_fare);

    v_coupon_id := v_coupon.id;
  end if;

  v_total := v_base_fare + v_convenience_fee - v_discount;

  v_booking_reference := 'RG' || to_char(now(), 'YYYYMMDD') ||
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into bookings (
    user_id, trip_id, boarding_point_id, dropping_point_id,
    booking_reference, status, base_fare, discount_amount,
    convenience_fee, total_amount, coupon_id
  ) values (
    v_user_id, p_trip_id, p_boarding_point_id, p_dropping_point_id,
    v_booking_reference, 'confirmed', v_base_fare, v_discount,
    v_convenience_fee, v_total, v_coupon_id
  )
  returning id into v_booking_id;

  for v_passenger in select * from jsonb_array_elements(p_passengers)
  loop
    insert into booking_passengers (booking_id, seat_id, full_name, age, gender)
    values (
      v_booking_id,
      (v_passenger->>'seat_id')::uuid,
      v_passenger->>'full_name',
      (v_passenger->>'age')::int,
      v_passenger->>'gender'
    );
  end loop;

  update trip_seats
  set status = 'booked'
  where id = any(v_seat_ids);

  v_payment_reference := 'PAY' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));

  insert into payments (booking_id, payment_reference, payment_method, amount, status)
  values (v_booking_id, v_payment_reference, p_payment_method, v_total, 'success');

  insert into notifications (user_id, type, title, message)
  values (
    v_user_id,
    'booking_confirmed',
    'Booking Confirmed',
    'Your booking ' || v_booking_reference || ' has been confirmed.'
  );

  return jsonb_build_object(
    'booking_id', v_booking_id,
    'booking_reference', v_booking_reference,
    'total_amount', v_total,
    'status', 'confirmed'
  );
end;
$$;

revoke all on function public.create_booking(uuid, jsonb, uuid, uuid, text, text) from public;
grant execute on function public.create_booking(uuid, jsonb, uuid, uuid, text, text) to authenticated;