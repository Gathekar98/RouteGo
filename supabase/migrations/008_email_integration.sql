-- Email integration setup notes (some steps done via dashboard, not pure SQL):
--
-- 1. Created Edge Function "send-booking-email" via Supabase dashboard
--    (CLI was unusable due to a Bun/AVX crash on this machine's CPU).
-- 2. Disabled "Verify JWT with legacy secret" in that function's Settings tab,
--    since it's only ever invoked server-side from create_booking, not
--    directly from the browser.
-- 3. Added two Edge Function secrets via dashboard:
--    - RESEND_API_KEY (from resend.com)
--    - INTERNAL_FUNCTION_SECRET (a random string, shared with create_booking
--      below, since JWT verification is off and we needed our own check)
--
-- The function code itself lives in supabase/functions/send-booking-email/index.ts

create extension if not exists pg_net;

-- create_booking is updated (not recreated from scratch here) to add
-- email-triggering logic as its final step. See the full current definition
-- via: select prosrc from pg_proc where proname = 'create_booking';