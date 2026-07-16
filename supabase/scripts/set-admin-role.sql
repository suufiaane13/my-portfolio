-- One-shot: grant admin role to portfolio owner
-- Usage: supabase db query --linked -f supabase/scripts/set-admin-role.sql

UPDATE auth.users
SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'hjisfn@gmail.com';

SELECT id, email, raw_app_meta_data
FROM auth.users
WHERE email = 'hjisfn@gmail.com';
