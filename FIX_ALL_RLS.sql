-- ============================================================
-- RUN THIS IN SUPABASE SQL EDITOR — Fixes all permissions
-- ============================================================

-- 1. Grant schema permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

-- 2. Disable RLS on ALL tables (service_role handles security via JWT)
ALTER TABLE admins          DISABLE ROW LEVEL SECURITY;
ALTER TABLE users           DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories      DISABLE ROW LEVEL SECURITY;
ALTER TABLE products        DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_images  DISABLE ROW LEVEL SECURITY;
ALTER TABLE discounts       DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders          DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items     DISABLE ROW LEVEL SECURITY;
ALTER TABLE custom_orders   DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews         DISABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist        DISABLE ROW LEVEL SECURITY;
ALTER TABLE cart            DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications   DISABLE ROW LEVEL SECURITY;
ALTER TABLE social_links    DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings   DISABLE ROW LEVEL SECURITY;
ALTER TABLE avatars         DISABLE ROW LEVEL SECURITY;

-- 3. Re-insert admin with correct password hash (Admin@123)
DELETE FROM admins WHERE email = 'amnamubeen516@gmail.com';
INSERT INTO admins (email, password_hash, full_name)
VALUES (
  'amnamubeen516@gmail.com',
  'aabbccdd11223344aabbccdd11223344$3f463d837f2043ca85bc89ce49d7ea0e75d01f226bc3263db5075876866d25f3',
  'Amna Mubeen'
);

-- 4. Seed social links (won't duplicate)
INSERT INTO social_links (platform, url, follower_count) VALUES
  ('whatsapp',  'https://whatsapp.com/channel/0029VbBXbGv9WtC90s3UER04', 0),
  ('instagram', 'https://www.instagram.com/croch_etmasterpiece?igsh=bzN4ZzEzYXZiZ2py', 0),
  ('facebook',  'https://www.facebook.com/profile.php?id=61579353555271', 0),
  ('tiktok',    'https://www.tiktok.com/@croch_et.masterpiece', 0)
ON CONFLICT (platform) DO NOTHING;

-- 5. Seed site settings
INSERT INTO site_settings (key, value) VALUES
  ('business_name',   'Crochet Masterpiece'),
  ('admin_email',     'amnamubeen516@gmail.com'),
  ('admin_phone',     '03159202186'),
  ('whatsapp_number', '923159202186'),
  ('currency_symbol', '₨'),
  ('hero_tagline',    'Handcrafted with love, made for you'),
  ('hero_subtitle',   'Explore our beautiful collection of handmade crochet creations')
ON CONFLICT (key) DO NOTHING;

-- 6. Verify
SELECT 'admins' as tbl, count(*) FROM admins
UNION ALL SELECT 'social_links', count(*) FROM social_links
UNION ALL SELECT 'site_settings', count(*) FROM site_settings;
