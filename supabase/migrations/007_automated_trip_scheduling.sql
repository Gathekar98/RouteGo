create extension if not exists pg_cron;

create or replace function public.roll_forward_trips()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  slot record;
  v_target_date date := current_date + 20;
  v_next_departure timestamptz;
  v_duration interval;
  v_new_trip_id uuid;
begin
  for slot in
    select distinct on (bt.route_id, bt.bus_id, (bt.departure_time::time))
      bt.id, bt.route_id, bt.bus_id, bt.departure_time, bt.arrival_time, bt.base_price
    from bus_trips bt
    order by bt.route_id, bt.bus_id, (bt.departure_time::time), bt.departure_time desc
  loop
    v_duration := slot.arrival_time - slot.departure_time;
    v_next_departure := slot.departure_time + interval '1 day';

    while v_next_departure::date <= v_target_date loop
      v_new_trip_id := gen_random_uuid();

      insert into bus_trips (id, route_id, bus_id, departure_time, arrival_time, base_price)
      values (
        v_new_trip_id, slot.route_id, slot.bus_id,
        v_next_departure, v_next_departure + v_duration, slot.base_price
      );

      insert into trip_seats (trip_id, seat_number, deck, is_berth, price)
      select v_new_trip_id, seat_number, deck, is_berth, price
      from trip_seats where trip_id = slot.id;

      insert into boarding_points (trip_id, location_name, address, scheduled_time)
      select v_new_trip_id, location_name, address, scheduled_time + (v_next_departure - slot.departure_time)
      from boarding_points where trip_id = slot.id;

      insert into dropping_points (trip_id, location_name, address, scheduled_time)
      select v_new_trip_id, location_name, address, scheduled_time + (v_next_departure - slot.departure_time)
      from dropping_points where trip_id = slot.id;

      v_next_departure := v_next_departure + interval '1 day';
    end loop;
  end loop;
end;
$$;

select cron.schedule(
  'roll-forward-trips',
  '*/15 * * * *',
  $$select public.roll_forward_trips();$$
);