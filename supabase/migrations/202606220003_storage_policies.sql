insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('boxscores', 'boxscores', false, 8388608, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy boxscores_read on storage.objects
for select to authenticated
using (
  bucket_id = 'boxscores'
  and (storage.foldername(name))[1] = 'orgs'
  and public.is_org_member(((storage.foldername(name))[2])::uuid)
);

create policy boxscores_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'boxscores'
  and (storage.foldername(name))[1] = 'orgs'
  and public.is_org_member(((storage.foldername(name))[2])::uuid, array['owner','admin','coach'])
);

create policy boxscores_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'boxscores'
  and (storage.foldername(name))[1] = 'orgs'
  and public.is_org_member(((storage.foldername(name))[2])::uuid, array['owner','admin'])
);
