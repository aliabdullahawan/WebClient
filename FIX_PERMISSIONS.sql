-- Run this ENTIRE script in Supabase SQL Editor
-- Fixes: "permission denied for schema public"

-- Grant full permissions to service role
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

-- Disable RLS on critical tables
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop old broken policies
DROP POLICY IF EXISTS "service_all_admins" ON admins;
DROP POLICY IF EXISTS "service_all_users" ON users;

-- Delete old admin record
DELETE FROM admins WHERE email = 'amnamubeen516@gmail.com';

-- Insert admin with correct password hash (password = Admin@123)
INSERT INTO admins (email, password_hash, full_name)
VALUES (
  'amnamubeen516@gmail.com',
  'aabbccdd11223344aabbccdd11223344$3f463d837f2043ca85bc89ce49d7ea0e75d01f226bc3263db5075876866d25f3',
  'Amna Mubeen'
);

-- Confirm
SELECT id, email, full_name FROM admins;
