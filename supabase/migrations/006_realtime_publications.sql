-- Enables Realtime broadcast for tables the frontend subscribes to.
-- (trip_seats: live seat map updates, Phase 11. notifications: live bell badge, Phase 20.)
alter publication supabase_realtime add table trip_seats;
alter publication supabase_realtime add table notifications;