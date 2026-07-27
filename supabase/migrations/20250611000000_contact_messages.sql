-- Portfolio contact messages (private — no public RLS policies)
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  email text not null,
  message text not null check (char_length(message) between 10 and 2000),
  locale text not null default 'fr' check (locale in ('fr', 'en')),
  ip_hash text,
  user_agent text,
  status text not null default 'new'
    check (status in ('new', 'read', 'replied', 'spam')),
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create index if not exists contact_messages_ip_hash_created_at_idx
  on public.contact_messages (ip_hash, created_at desc);

create index if not exists contact_messages_status_created_at_idx
  on public.contact_messages (status, created_at desc);
