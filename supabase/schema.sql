create table if not exists public.waiver_submissions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  consent_accepted boolean not null default false,
  signature_url text not null,
  signed_document_url text,
  signed_at timestamptz not null default now(),
  event_name text not null default 'L''Oréalistar Launch Event',
  user_agent text,
  tablet_id text
);

create index if not exists waiver_submissions_event_name_signed_at_idx
  on public.waiver_submissions (event_name, signed_at desc);

alter table public.waiver_submissions enable row level security;

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
  );

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'signature-images',
  'signature-images',
  false,
  5242880,
  array['image/png']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Allow signature image uploads" on storage.objects;

create policy "Allow signature image uploads"
  on storage.objects
  for insert
  to anon
  with check (
    bucket_id = 'signature-images'
    and lower((storage.foldername(name))[1]) = 'signatures'
  );

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'signed-waivers',
  'signed-waivers',
  false,
  5242880,
  array['application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Allow signed waiver document uploads" on storage.objects;

create policy "Allow signed waiver document uploads"
  on storage.objects
  for insert
  to anon
  with check (
    bucket_id = 'signed-waivers'
    and lower((storage.foldername(name))[1]) = 'documents'
  );
