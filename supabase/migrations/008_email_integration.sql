-- (keep the existing notes/comments block from before, then add:)

alter table bookings
  add column if not exists email_status text not null default 'pending'
    check (email_status in ('pending', 'sent', 'failed')),
  add column if not exists email_request_id bigint;

create or replace function public.reconcile_email_statuses()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update bookings b
  set email_status = 'sent'
  from net._http_response r
  where b.email_request_id = r.id
    and b.email_status = 'pending'
    and r.status_code = 200;

  update bookings b
  set email_status = 'failed'
  from net._http_response r
  where b.email_request_id = r.id
    and b.email_status = 'pending'
    and r.status_code is distinct from 200;

  update bookings b
  set email_status = 'failed'
  where b.email_status = 'pending'
    and b.created_at < now() - interval '5 minutes';
end;
$$;

select cron.schedule(
  'reconcile-email-statuses',
  '* * * * *',
  $$select public.reconcile_email_statuses();$$
);