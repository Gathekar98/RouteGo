-- ============================================
-- EXTENSIONS
-- ============================================
create extension if not exists "pgcrypto";

-- ============================================
-- REFERENCE / CATALOG TABLES
-- ============================================
create table cities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  state text not null,
  created_at timestamptz not null default now()
);

create table bus_operators (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  rating numeric(2,1) check (rating between 0 and 5),
  created_at timestamptz not null default now()
);

create table buses (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid not null references bus_operators(id) on delete cascade,
  bus_number text not null,
  bus_type text not null check (bus_type in ('AC_SLEEPER', 'NON_AC_SLEEPER', 'AC_SEATER', 'NON_AC_SEATER')),
  total_seats integer not null check (total_seats > 0),
  amenities text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table routes (
  id uuid primary key default gen_random_uuid(),
  source_city_id uuid not null references cities(id) on delete restrict,
  destination_city_id uuid not null references cities(id) on delete restrict,
  distance_km integer,
  created_at timestamptz not null default now(),
  constraint different_cities check (source_city_id <> destination_city_id)
);

create index idx_routes_source_dest on routes(source_city_id, destination_city_id);

-- ============================================
-- TRIP-RELATED TABLES
-- ============================================
create table bus_trips (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references routes(id) on delete restrict,
  bus_id uuid not null references buses(id) on delete restrict,
  departure_time timestamptz not null,
  arrival_time timestamptz not null,
  base_price numeric(10,2) not null check (base_price > 0),
  created_at timestamptz not null default now(),
  constraint valid_journey_times check (arrival_time > departure_time)
);

create index idx_bus_trips_route_departure on bus_trips(route_id, departure_time);

create table trip_seats (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references bus_trips(id) on delete cascade,
  seat_number text not null,
  deck text not null check (deck in ('lower', 'upper')),
  is_berth boolean not null default false,
  price numeric(10,2) not null check (price > 0),
  status text not null default 'available'
    check (status in ('available', 'booked', 'ladies_only')),
  created_at timestamptz not null default now(),
  unique (trip_id, seat_number)
);

create index idx_trip_seats_trip_id on trip_seats(trip_id);
create index idx_trip_seats_trip_status on trip_seats(trip_id, status);

create table boarding_points (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references bus_trips(id) on delete cascade,
  location_name text not null,
  address text,
  scheduled_time timestamptz not null
);

create table dropping_points (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references bus_trips(id) on delete cascade,
  location_name text not null,
  address text,
  scheduled_time timestamptz not null
);

create index idx_boarding_points_trip on boarding_points(trip_id);
create index idx_dropping_points_trip on dropping_points(trip_id);

-- ============================================
-- PROFILE, BOOKING & RELATED TABLES
-- ============================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(10,2) not null check (discount_value > 0),
  min_booking_amount numeric(10,2) not null default 0,
  max_discount_amount numeric(10,2),
  valid_from timestamptz not null default now(),
  valid_until timestamptz not null,
  is_active boolean not null default true
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  trip_id uuid not null references bus_trips(id) on delete restrict,
  boarding_point_id uuid not null references boarding_points(id),
  dropping_point_id uuid not null references dropping_points(id),
  booking_reference text not null unique,
  status text not null default 'confirmed'
    check (status in ('confirmed', 'cancelled', 'completed')),
  base_fare numeric(10,2) not null,
  discount_amount numeric(10,2) not null default 0,
  convenience_fee numeric(10,2) not null default 0,
  total_amount numeric(10,2) not null,
  coupon_id uuid references coupons(id),
  created_at timestamptz not null default now()
);

create index idx_bookings_user_id on bookings(user_id);
create index idx_bookings_trip_id on bookings(trip_id);

create table booking_passengers (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  seat_id uuid not null references trip_seats(id),
  full_name text not null,
  age integer not null check (age > 0 and age < 120),
  gender text not null check (gender in ('male', 'female', 'other'))
);

create index idx_booking_passengers_booking on booking_passengers(booking_id);

create table payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references bookings(id) on delete cascade,
  payment_reference text not null unique,
  payment_method text not null check (payment_method in ('upi', 'card', 'netbanking', 'wallet')),
  amount numeric(10,2) not null,
  status text not null check (status in ('success', 'failed', 'refunded')),
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('booking_confirmed', 'booking_cancelled', 'refund_initiated', 'payment_failed', 'trip_reminder')),
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_user_unread on notifications(user_id, is_read);

create table favourite_routes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  route_id uuid not null references routes(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, route_id)
);

-- ============================================
-- AUTH TRIGGER: auto-create profile on signup
-- ============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================
-- SEED DATA
-- ============================================
insert into cities (name, state) values
  ('Mumbai', 'Maharashtra'),
  ('Pune', 'Maharashtra'),
  ('Nashik', 'Maharashtra'),
  ('Goa', 'Goa'),
  ('Bengaluru', 'Karnataka'),
  ('Hyderabad', 'Telangana'),
  ('Delhi', 'Delhi'),
  ('Jaipur', 'Rajasthan'),
  ('Ahmedabad', 'Gujarat'),
  ('Surat', 'Gujarat');

insert into bus_operators (name, rating) values
  ('Skyline Travels', 4.3),
  ('Horizon Roadways', 4.1),
  ('Comet Express', 3.9),
  ('Nova Coaches', 4.5),
  ('Pioneer Bus Lines', 4.0);

insert into buses (operator_id, bus_number, bus_type, total_seats, amenities)
select id, 'MH-12-AB-' || (1000 + row_number() over ()), 'AC_SLEEPER', 30, array['WiFi','Charging Point','Blanket']
from bus_operators
union all
select id, 'MH-14-CD-' || (2000 + row_number() over ()), 'NON_AC_SEATER', 45, array['Charging Point']
from bus_operators;

insert into routes (source_city_id, destination_city_id, distance_km)
select
  (select id from cities where name = 'Mumbai'),
  (select id from cities where name = 'Pune'),
  150;

insert into bus_trips (route_id, bus_id, departure_time, arrival_time, base_price)
select
  (select id from routes limit 1),
  (select id from buses where bus_type = 'AC_SLEEPER' limit 1),
  now() + interval '1 day' + interval '20 hours',
  now() + interval '1 day' + interval '23 hours 30 minutes',
  899.00;

insert into trip_seats (trip_id, seat_number, deck, is_berth, price)
select (select id from bus_trips limit 1), 'L' || s, 'lower', true, 899.00
from generate_series(1, 15) as s
union all
select (select id from bus_trips limit 1), 'U' || s, 'upper', true, 899.00
from generate_series(1, 15) as s;

insert into boarding_points (trip_id, location_name, address, scheduled_time)
select id, 'Dadar Bus Stand', 'Dadar East, Mumbai', departure_time
from bus_trips;

insert into dropping_points (trip_id, location_name, address, scheduled_time)
select id, 'Shivajinagar Bus Stand', 'Shivajinagar, Pune', arrival_time
from bus_trips;

insert into coupons (code, discount_type, discount_value, min_booking_amount, max_discount_amount, valid_until) values
  ('FIRST100', 'fixed', 100, 500, null, now() + interval '90 days'),
  ('WEEKEND10', 'percentage', 10, 300, 200, now() + interval '90 days');