-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
alter table cities enable row level security;
alter table bus_operators enable row level security;
alter table buses enable row level security;
alter table routes enable row level security;
alter table bus_trips enable row level security;
alter table trip_seats enable row level security;
alter table boarding_points enable row level security;
alter table dropping_points enable row level security;
alter table profiles enable row level security;
alter table coupons enable row level security;
alter table bookings enable row level security;
alter table booking_passengers enable row level security;
alter table payments enable row level security;
alter table notifications enable row level security;
alter table favourite_routes enable row level security;

-- ============================================
-- PUBLIC CATALOG DATA: read-only for everyone
-- ============================================
create policy "Anyone can view cities"
  on cities for select using (true);

create policy "Anyone can view bus operators"
  on bus_operators for select using (true);

create policy "Anyone can view buses"
  on buses for select using (true);

create policy "Anyone can view routes"
  on routes for select using (true);

create policy "Anyone can view bus trips"
  on bus_trips for select using (true);

create policy "Anyone can view trip seats"
  on trip_seats for select using (true);

create policy "Anyone can view boarding points"
  on boarding_points for select using (true);

create policy "Anyone can view dropping points"
  on dropping_points for select using (true);

create policy "Anyone can view active coupons"
  on coupons for select
  using (is_active = true and valid_until > now());

-- ============================================
-- PROFILES: owner-only read/update
-- ============================================
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- ============================================
-- BOOKINGS: owner-only read (writes via secure function later)
-- ============================================
create policy "Users can view their own bookings"
  on bookings for select
  using (auth.uid() = user_id);

-- ============================================
-- BOOKING PASSENGERS: ownership via parent booking
-- ============================================
create policy "Users can view passengers on their own bookings"
  on booking_passengers for select
  using (
    exists (
      select 1 from bookings
      where bookings.id = booking_passengers.booking_id
      and bookings.user_id = auth.uid()
    )
  );

-- ============================================
-- PAYMENTS: ownership via parent booking
-- ============================================
create policy "Users can view payments on their own bookings"
  on payments for select
  using (
    exists (
      select 1 from bookings
      where bookings.id = payments.booking_id
      and bookings.user_id = auth.uid()
    )
  );

-- ============================================
-- NOTIFICATIONS: owner-only read + mark-as-read
-- ============================================
create policy "Users can view their own notifications"
  on notifications for select
  using (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on notifications for update
  using (auth.uid() = user_id);

-- ============================================
-- FAVOURITE ROUTES: full CRUD, owner-only
-- ============================================
create policy "Users can view their own favourite routes"
  on favourite_routes for select
  using (auth.uid() = user_id);

create policy "Users can add their own favourite routes"
  on favourite_routes for insert
  with check (auth.uid() = user_id);

create policy "Users can remove their own favourite routes"
  on favourite_routes for delete
  using (auth.uid() = user_id);