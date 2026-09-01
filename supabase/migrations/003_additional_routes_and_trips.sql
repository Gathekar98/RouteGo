-- ============================================
-- SAFETY CONSTRAINT: prevent duplicate routes
-- ============================================
-- Note: if you're running this fresh, this will succeed immediately.
-- We hit a pre-existing duplicate route in development and had to
-- merge/clean it up manually before this constraint could be added —
-- see project notes / commit history for that one-time fix.
alter table routes add constraint unique_route unique (source_city_id, destination_city_id);

-- ============================================
-- NEW CITIES
-- ============================================
insert into cities (name, state) values
  ('Amravati', 'Maharashtra'),
  ('Nagpur', 'Maharashtra'),
  ('Solapur', 'Maharashtra')
on conflict (name) do nothing;

-- ============================================
-- NEW ROUTES
-- ============================================
insert into routes (source_city_id, destination_city_id, distance_km)
values
  ((select id from cities where name = 'Pune'), (select id from cities where name = 'Amravati'), 480),
  ((select id from cities where name = 'Amravati'), (select id from cities where name = 'Pune'), 480),
  ((select id from cities where name = 'Amravati'), (select id from cities where name = 'Nagpur'), 160),
  ((select id from cities where name = 'Nagpur'), (select id from cities where name = 'Amravati'), 160),
  ((select id from cities where name = 'Nagpur'), (select id from cities where name = 'Pune'), 720),
  ((select id from cities where name = 'Pune'), (select id from cities where name = 'Nagpur'), 720),
  ((select id from cities where name = 'Solapur'), (select id from cities where name = 'Pune'), 250)
on conflict (source_city_id, destination_city_id) do nothing;

-- ============================================
-- GENERATE TRIPS for any route with fewer than 2
-- ============================================
do $$
declare
  r record;
  ac_bus uuid;
  nonac_bus uuid;
  base_date date := current_date + 1;
begin
  for r in select id from routes loop
    select id into ac_bus from buses where bus_type = 'AC_SLEEPER' order by random() limit 1;
    select id into nonac_bus from buses where bus_type = 'NON_AC_SEATER' order by random() limit 1;

    if (select count(*) from bus_trips where route_id = r.id) < 2 then
      insert into bus_trips (route_id, bus_id, departure_time, arrival_time, base_price)
      values
        (r.id, ac_bus, base_date + interval '20 hours', base_date + interval '23 hours 30 minutes', 899 + (random() * 400)::int),
        (r.id, nonac_bus, base_date + interval '9 hours', base_date + interval '13 hours', 399 + (random() * 200)::int);
    end if;
  end loop;
end $$;

-- ============================================
-- SEATS for any trip missing them
-- ============================================
insert into trip_seats (trip_id, seat_number, deck, is_berth, price)
select bt.id, 'L' || s, 'lower', true, bt.base_price
from bus_trips bt
cross join generate_series(1, 15) as s
where not exists (select 1 from trip_seats ts where ts.trip_id = bt.id)
union all
select bt.id, 'U' || s, 'upper', true, bt.base_price
from bus_trips bt
cross join generate_series(1, 15) as s
where not exists (select 1 from trip_seats ts where ts.trip_id = bt.id);

-- ============================================
-- BOARDING/DROPPING POINTS for any trip missing them
-- ============================================
insert into boarding_points (trip_id, location_name, address, scheduled_time)
select bt.id, 'Main Bus Stand', 'Central Bus Stand', bt.departure_time
from bus_trips bt
where not exists (select 1 from boarding_points bp where bp.trip_id = bt.id);

insert into dropping_points (trip_id, location_name, address, scheduled_time)
select bt.id, 'Main Bus Stand', 'Central Bus Stand', bt.arrival_time
from bus_trips bt
where not exists (select 1 from dropping_points dp where dp.trip_id = bt.id);