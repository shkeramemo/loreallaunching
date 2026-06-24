alter table public.waiver_submissions
  add column if not exists signed_document_url text;

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
