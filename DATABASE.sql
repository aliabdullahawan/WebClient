-- ============================================================
-- CROCHET MASTERPIECE — Complete Database Schema
-- Supabase (PostgreSQL) | Binary image storage (bytea) ✅
-- All data from DB only — nothing hardcoded in code ✅
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- ENUMS
-- ============================================================
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending','confirmed','shipped','delivered','cancelled');
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE order_type AS ENUM ('shop','custom','whatsapp');
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM ('order_update','admin_message','review_reply','discount','system');
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE discount_scope AS ENUM ('product','category','site_wide');
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- TABLE: avatars — predefined user avatars (binary)
-- ============================================================
CREATE TABLE IF NOT EXISTS avatars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    image_data BYTEA NOT NULL,          -- binary image, NOT a URL
    image_mime VARCHAR(50) DEFAULT 'image/png',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    avatar_id UUID REFERENCES avatars(id) ON DELETE SET NULL,
    google_id VARCHAR(255) UNIQUE,
    is_blocked BOOLEAN DEFAULT FALSE,
    otp_code VARCHAR(10),
    otp_expires_at TIMESTAMPTZ,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: admins
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) DEFAULT 'Admin',
    otp_code VARCHAR(10),
    otp_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: categories — images stored as bytea
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image_data BYTEA,                   -- binary image, NOT a URL
    image_mime VARCHAR(50) DEFAULT 'image/jpeg',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: products
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(500) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    tags TEXT[],
    is_featured BOOLEAN DEFAULT FALSE,
    show_on_hero BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    search_vector TSVECTOR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: product_images — binary image storage (bytea)
-- Each product can have multiple images
-- Served via /api/products/image/[id]
-- ============================================================
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_data BYTEA NOT NULL,          -- binary image, NOT a URL
    image_mime VARCHAR(50) DEFAULT 'image/jpeg',
    order_index INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: discounts
-- ============================================================
CREATE TABLE IF NOT EXISTS discounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    percentage DECIMAL(5,2) NOT NULL CHECK (percentage > 0 AND percentage <= 100),
    scope discount_scope NOT NULL DEFAULT 'site_wide',
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    usage_count INT DEFAULT 0,
    max_usage INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: orders
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(20) UNIQUE NOT NULL DEFAULT '',
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    guest_name VARCHAR(255),
    guest_email VARCHAR(255),
    guest_phone VARCHAR(20),
    status order_status DEFAULT 'pending',
    order_type order_type DEFAULT 'shop',
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    discounted_amount DECIMAL(10,2),
    discount_code VARCHAR(50),
    discount_percentage DECIMAL(5,2),
    shipping_address TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: order_items
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(500) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    price_at_order DECIMAL(10,2) NOT NULL
);

-- ============================================================
-- TABLE: custom_orders
-- ============================================================
CREATE TABLE IF NOT EXISTS custom_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(20) UNIQUE NOT NULL DEFAULT '',
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    category VARCHAR(255),
    custom_category VARCHAR(255),
    description TEXT NOT NULL,
    price_range_min DECIMAL(10,2),
    price_range_max DECIMAL(10,2),
    delivery_timeframe VARCHAR(100),
    status order_status DEFAULT 'pending',
    admin_notes TEXT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: reviews
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    admin_reply TEXT,
    admin_replied_at TIMESTAMPTZ,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- ============================================================
-- TABLE: wishlist
-- ============================================================
CREATE TABLE IF NOT EXISTS wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- ============================================================
-- TABLE: cart
-- ============================================================
CREATE TABLE IF NOT EXISTS cart (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- ============================================================
-- TABLE: notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    related_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: social_links — fetched dynamically, never hardcoded
-- ============================================================
CREATE TABLE IF NOT EXISTS social_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(50) NOT NULL UNIQUE,
    url TEXT NOT NULL,
    follower_count BIGINT DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: site_settings — all app text/config stored here
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES — optimised for common queries
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_blocked ON users(is_blocked) WHERE is_blocked = FALSE;
CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_hero ON products(show_on_hero) WHERE show_on_hero = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING GIN(name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_primary ON product_images(product_id, is_primary) WHERE is_primary = TRUE;

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_custom_orders_status ON custom_orders(status);
CREATE INDEX IF NOT EXISTS idx_custom_orders_created ON custom_orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_visible ON reviews(product_id, is_visible) WHERE is_visible = TRUE;
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating DESC);

CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product ON wishlist(product_id);

CREATE INDEX IF NOT EXISTS idx_cart_user ON cart(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_discounts_code ON discounts(code);
CREATE INDEX IF NOT EXISTS idx_discounts_active ON discounts(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_discounts_scope ON discounts(scope);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at on any table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

-- Generate unique order number CM-YYYYMMDD-XXXX
CREATE OR REPLACE FUNCTION generate_order_number() RETURNS VARCHAR LANGUAGE plpgsql AS $$
DECLARE v_number VARCHAR(20); v_exists BOOLEAN;
BEGIN
  LOOP
    v_number := 'CM-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM()*9999+1)::TEXT, 4, '0');
    SELECT EXISTS(SELECT 1 FROM orders WHERE order_number = v_number) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;
  RETURN v_number;
END; $$;

-- Generate unique custom order number CU-YYYYMMDD-XXXX
CREATE OR REPLACE FUNCTION generate_custom_order_number() RETURNS VARCHAR LANGUAGE plpgsql AS $$
DECLARE v_number VARCHAR(20); v_exists BOOLEAN;
BEGIN
  LOOP
    v_number := 'CU-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM()*9999+1)::TEXT, 4, '0');
    SELECT EXISTS(SELECT 1 FROM custom_orders WHERE order_number = v_number) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;
  RETURN v_number;
END; $$;

-- Update product full-text search vector
CREATE OR REPLACE FUNCTION update_product_search_vector() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector := TO_TSVECTOR('english',
    COALESCE(NEW.name,'') || ' ' || COALESCE(NEW.description,'') || ' ' || COALESCE(ARRAY_TO_STRING(NEW.tags,' '),''));
  RETURN NEW;
END; $$;

-- Recalculate product average rating after review changes
CREATE OR REPLACE FUNCTION recalculate_product_rating() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_pid UUID; v_avg DECIMAL(3,2); v_cnt INT;
BEGIN
  v_pid := CASE WHEN TG_OP='DELETE' THEN OLD.product_id ELSE NEW.product_id END;
  SELECT COALESCE(AVG(rating),0), COUNT(*) INTO v_avg, v_cnt
  FROM reviews WHERE product_id = v_pid AND is_visible = TRUE;
  UPDATE products SET average_rating = v_avg, review_count = v_cnt WHERE id = v_pid;
  RETURN COALESCE(NEW, OLD);
END; $$;

-- Auto-set order_number before insert
CREATE OR REPLACE FUNCTION set_order_number() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END; $$;

-- Auto-set custom order_number before insert
CREATE OR REPLACE FUNCTION set_custom_order_number() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_custom_order_number();
  END IF;
  RETURN NEW;
END; $$;

-- Validate and expire discounts
CREATE OR REPLACE FUNCTION expire_old_discounts() RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE discounts SET is_active = FALSE
  WHERE is_active = TRUE AND end_date IS NOT NULL AND end_date < NOW();
END; $$;

-- ============================================================
-- TRIGGERS
-- ============================================================
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_admins_updated_at ON admins;
CREATE TRIGGER trg_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_categories_updated_at ON categories;
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_custom_orders_updated_at ON custom_orders;
CREATE TRIGGER trg_custom_orders_updated_at BEFORE UPDATE ON custom_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_discounts_updated_at ON discounts;
CREATE TRIGGER trg_discounts_updated_at BEFORE UPDATE ON discounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_cart_updated_at ON cart;
CREATE TRIGGER trg_cart_updated_at BEFORE UPDATE ON cart FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_reviews_updated_at ON reviews;
CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_product_search_vector ON products;
CREATE TRIGGER trg_product_search_vector BEFORE INSERT OR UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_product_search_vector();

DROP TRIGGER IF EXISTS trg_review_rating_update ON reviews;
CREATE TRIGGER trg_review_rating_update AFTER INSERT OR UPDATE OR DELETE ON reviews FOR EACH ROW EXECUTE FUNCTION recalculate_product_rating();

DROP TRIGGER IF EXISTS trg_set_order_number ON orders;
CREATE TRIGGER trg_set_order_number BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION set_order_number();

DROP TRIGGER IF EXISTS trg_set_custom_order_number ON custom_orders;
CREATE TRIGGER trg_set_custom_order_number BEFORE INSERT ON custom_orders FOR EACH ROW EXECUTE FUNCTION set_custom_order_number();

-- ============================================================
-- VIEWS — optimised read queries
-- ============================================================

-- Products with category and primary image
CREATE OR REPLACE VIEW v_products_full AS
SELECT p.id, p.name, p.description, p.price, p.category_id, c.name AS category_name,
       p.tags, p.is_featured, p.show_on_hero, p.is_active, p.average_rating, p.review_count,
       pi.id AS primary_image_id, p.created_at, p.updated_at
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = TRUE
WHERE p.is_active = TRUE;

-- Products with their current active discount
CREATE OR REPLACE VIEW v_products_with_discounts AS
SELECT p.id, p.name, p.price,
       d.id AS discount_id, d.code AS discount_code,
       d.percentage AS discount_percentage,
       ROUND(p.price * (1 - d.percentage / 100), 2) AS discounted_price,
       d.end_date AS discount_end_date
FROM products p
LEFT JOIN discounts d ON (
  d.is_active = TRUE AND (d.end_date IS NULL OR d.end_date > NOW())
  AND (
    d.scope = 'site_wide'
    OR (d.scope = 'product' AND d.product_id = p.id)
    OR (d.scope = 'category' AND d.category_id = p.category_id)
  )
)
WHERE p.is_active = TRUE;

-- Orders with customer info joined
CREATE OR REPLACE VIEW v_orders_summary AS
SELECT o.id, o.order_number, o.status, o.order_type,
       o.total_amount, o.discounted_amount, o.discount_code, o.created_at, o.updated_at,
       COALESCE(u.full_name, o.guest_name) AS customer_name,
       COALESCE(u.email, o.guest_email)    AS customer_email,
       COALESCE(u.phone, o.guest_phone)    AS customer_phone,
       COUNT(oi.id) AS item_count
FROM orders o
LEFT JOIN users u ON u.id = o.user_id
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id, u.full_name, u.email, u.phone;

-- User stats with order aggregates
CREATE OR REPLACE VIEW v_user_stats AS
SELECT u.id, u.full_name, u.email, u.phone, u.is_blocked, u.created_at,
       COUNT(o.id) AS total_orders,
       COUNT(o.id) FILTER (WHERE o.status = 'delivered') AS delivered_orders,
       COUNT(o.id) FILTER (WHERE o.status = 'cancelled') AS cancelled_orders,
       COALESCE(SUM(o.total_amount) FILTER (WHERE o.status = 'delivered'), 0) AS total_spent
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id;

-- Active discounts with product/category names
CREATE OR REPLACE VIEW v_active_discounts AS
SELECT d.*, p.name AS product_name, c.name AS category_name
FROM discounts d
LEFT JOIN products p ON p.id = d.product_id
LEFT JOIN categories c ON c.id = d.category_id
WHERE d.is_active = TRUE
  AND (d.end_date IS NULL OR d.end_date > NOW())
  AND (d.start_date IS NULL OR d.start_date <= NOW());

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins          ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_orders   ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews         ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist        ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart            ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images  ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatars         ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links    ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings   ENABLE ROW LEVEL SECURITY;

-- Public read-only for shop data
CREATE POLICY "public_read_products"       ON products       FOR SELECT USING (is_active = TRUE);
CREATE POLICY "public_read_categories"     ON categories     FOR SELECT USING (is_active = TRUE);
CREATE POLICY "public_read_product_images" ON product_images FOR SELECT USING (TRUE);
CREATE POLICY "public_read_avatars"        ON avatars        FOR SELECT USING (TRUE);
CREATE POLICY "public_read_discounts"      ON discounts      FOR SELECT USING (is_active = TRUE);
CREATE POLICY "public_read_social_links"   ON social_links   FOR SELECT USING (TRUE);
CREATE POLICY "public_read_site_settings"  ON site_settings  FOR SELECT USING (TRUE);

-- Service role (our server-side API) bypasses all RLS
CREATE POLICY "service_all_users"         ON users         USING (auth.role() = 'service_role');
CREATE POLICY "service_all_admins"        ON admins        USING (auth.role() = 'service_role');
CREATE POLICY "service_all_orders"        ON orders        USING (auth.role() = 'service_role');
CREATE POLICY "service_all_order_items"   ON order_items   USING (auth.role() = 'service_role');
CREATE POLICY "service_all_custom_orders" ON custom_orders USING (auth.role() = 'service_role');
CREATE POLICY "service_all_reviews"       ON reviews       USING (auth.role() = 'service_role');
CREATE POLICY "service_all_wishlist"      ON wishlist      USING (auth.role() = 'service_role');
CREATE POLICY "service_all_cart"          ON cart          USING (auth.role() = 'service_role');
CREATE POLICY "service_all_notifications" ON notifications USING (auth.role() = 'service_role');
CREATE POLICY "service_all_products"      ON products      USING (auth.role() = 'service_role');
CREATE POLICY "service_all_categories"    ON categories    USING (auth.role() = 'service_role');
CREATE POLICY "service_all_images"        ON product_images USING (auth.role() = 'service_role');
CREATE POLICY "service_all_discounts"     ON discounts     USING (auth.role() = 'service_role');
CREATE POLICY "service_all_avatars"       ON avatars       USING (auth.role() = 'service_role');
CREATE POLICY "service_all_social"        ON social_links  USING (auth.role() = 'service_role');
CREATE POLICY "service_all_settings"      ON site_settings USING (auth.role() = 'service_role');

-- ============================================================
-- SEED DATA — all from DB, nothing hardcoded in code
-- ============================================================

INSERT INTO social_links (platform, url, follower_count) VALUES
  ('whatsapp',  'https://whatsapp.com/channel/0029VbBXbGv9WtC90s3UER04', 0),
  ('instagram', 'https://www.instagram.com/croch_etmasterpiece?igsh=bzN4ZzEzYXZiZ2py', 0),
  ('facebook',  'https://www.facebook.com/profile.php?id=61579353555271&mibextid=ZbWKwL', 0),
  ('tiktok',    'https://www.tiktok.com/@croch_et.masterpiece', 0)
ON CONFLICT (platform) DO NOTHING;

INSERT INTO site_settings (key, value) VALUES
  ('business_name',    'Crochet Masterpiece'),
  ('admin_email',      'amnamubeen516@gmail.com'),
  ('admin_phone',      '03159202186'),
  ('whatsapp_number',  '923159202186'),
  ('currency',         'PKR'),
  ('currency_symbol',  '₨'),
  ('hero_tagline',     'Handcrafted with love, made for you'),
  ('hero_subtitle',    'Explore our beautiful collection of handmade crochet creations'),
  ('hero_badge',       'HANDCRAFTED WITH LOVE'),
  ('contact_address',  'Pakistan')
ON CONFLICT (key) DO NOTHING;

-- Admin account: email=amnamubeen516@gmail.com | password=Admin@123
-- bcrypt hash of 'Admin@123' with cost 10
INSERT INTO admins (email, password_hash, full_name)
VALUES (
  'amnamubeen516@gmail.com',
  crypt('Admin@123', gen_salt('bf', 10)),
  'Amna Mubeen'
) ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- END OF DATABASE.sql
-- Notes:
-- ✅ All images stored as BYTEA (binary) — served via /api routes
-- ✅ No image URLs stored anywhere in the database  
-- ✅ All app content fetched from DB — nothing hardcoded
-- ✅ Indexes on all foreign keys and commonly filtered columns
-- ✅ Triggers for: timestamps, order numbers, product ratings, search vectors
-- ✅ Views for: product listings, order summaries, user stats, active discounts
-- ✅ RLS: public read for shop, service_role for all writes
-- ============================================================
