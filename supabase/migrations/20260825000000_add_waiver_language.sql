alter table public.waiver_submissions
  add column if not exists language text;

alter table public.waiver_submissions
  alter column language set default 'ar';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'waiver_submissions_language_check'
  ) then
    alter table public.waiver_submissions
      add constraint waiver_submissions_language_check
      check (language is null or language in ('ar', 'en'));
  end if;
end $$;

drop policy if exists "Allow waiver submission inserts" on public.waiver_submissions;

create policy "Allow waiver submission inserts"
  on public.waiver_submissions
  for insert
  to anon
  with check (
    consent_accepted = true
    and length(full_name) >= 2
    and length(signature_url) > 0
    and event_name = 'L''Oréalistar Launch Event'
    and (language is null or language in ('ar', 'en'))
  );
