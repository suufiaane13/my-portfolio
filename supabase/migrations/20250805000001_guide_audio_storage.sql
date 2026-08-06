-- ═══════════════════════════════════════════════════════════════════════════════
-- Supabase Storage — guide audio (lecture publique, écriture admin via edge fn)
-- ═══════════════════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'guide-audio',
  'guide-audio',
  true,
  5242880,
  array['audio/wav', 'audio/x-wav']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "guide_audio_public_read"
  on storage.objects
  for select
  to public
  using (bucket_id = 'guide-audio');

create policy "guide_audio_admin_insert"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'guide-audio' and public.is_admin());

create policy "guide_audio_admin_update"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'guide-audio' and public.is_admin())
  with check (bucket_id = 'guide-audio' and public.is_admin());

create policy "guide_audio_admin_delete"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'guide-audio' and public.is_admin());
