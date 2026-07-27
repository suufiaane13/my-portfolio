-- Admin — suppression des messages de contact

create policy "contact_messages_admin_delete"
  on public.contact_messages
  for delete
  to authenticated
  using (public.is_admin());
