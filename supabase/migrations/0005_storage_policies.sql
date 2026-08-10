-- Llave — storage policies for direct browser uploads.
-- Tours and property images live in the public `properties` bucket.

insert into storage.buckets (id, name, public)
values ('properties', 'properties', true)
on conflict (id) do nothing;

drop policy if exists "properties_bucket_public_read" on storage.objects;
create policy "properties_bucket_public_read" on storage.objects
for select using (bucket_id = 'properties');

drop policy if exists "properties_bucket_authenticated_insert" on storage.objects;
create policy "properties_bucket_authenticated_insert" on storage.objects
for insert to authenticated
with check (bucket_id = 'properties');

drop policy if exists "properties_bucket_authenticated_update" on storage.objects;
create policy "properties_bucket_authenticated_update" on storage.objects
for update to authenticated
using (bucket_id = 'properties')
with check (bucket_id = 'properties');

drop policy if exists "properties_bucket_authenticated_delete" on storage.objects;
create policy "properties_bucket_authenticated_delete" on storage.objects
for delete to authenticated
using (bucket_id = 'properties');
