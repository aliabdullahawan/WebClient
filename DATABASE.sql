-- ============================================================
-- CROCHET MASTERPIECE - Complete Database Schema
-- Supabase (PostgreSQL) | Created: 2025
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ENUMS
CREATE TYPE order_status AS ENUM ('pending','confirmed','shipped','delivered','cancelled');
CREATE TYPE order_type AS ENUM ('shop','custom','whatsapp');
CREATE TYPE notification_type AS ENUM ('order_update','admin_message','review_reply','discount','system');
CREATE TYPE discount_scope AS ENUM ('product','category','site_wide');

-- avatars
CREATE TABLE avatars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    image_data BYTEA NOT NULL,
    image_mime VARCHAR(50) DEFAULT 'image/png',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- users
CREATE TABLE users (
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

-- admins
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) DEFAULT 'Admin',
    otp_code VARCHAR(10),
    otp_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image_data BYTEA,
    image_mime VARCHAR(50) DEFAULT 'image/jpeg',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- products
CREATE TABLE products (
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

-- product_images
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_data BYTEA NOT NULL,
    image_mime VARCHAR(50) DEFAULT 'image/jpeg',
    order_index INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- discounts
CREATE TABLE discounts (
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

-- orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(20) UNIQUE NOT NULL,
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

-- order_items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(500) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    price_at_order DECIMAL(10,2) NOT NULL
);

-- custom_orders
CREATE TABLE custom_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(20) UNIQUE NOT NULL,
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

-- reviews
CREATE TABLE reviews (
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

-- wishlist
CREATE TABLE wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- cart
CREATE TABLE cart (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- notifications
CREATE TABLE notifications (
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

-- social_links
CREATE TABLE social_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(50) NOT NULL UNIQUE,
    url TEXT NOT NULL,
    follower_count BIGINT DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- site_settings
CREATE TABLE site_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_hero ON products(show_on_hero) WHERE show_on_hero = TRUE;
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_rating ON products(average_rating DESC);
CREATE INDEX idx_products_search ON products USING GIN(search_vector);
CREATE INDEX idx_products_tags ON products USING GIN(tags);
CREATE INDEX idx_products_name_trgm ON products USING GIN(name gin_trgm_ops);
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_images_primary ON product_images(product_id, is_primary) WHERE is_primary = TRUE;
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_custom_orders_status ON custom_orders(status);
CREATE INDEX idx_custom_orders_created ON custom_orders(created_at DESC);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_rating ON reviews(rating DESC);
CREATE INDEX idx_wishlist_user ON wishlist(user_id);
CREATE INDEX idx_cart_user ON cart(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_discounts_code ON discounts(code);
CREATE INDEX idx_discounts_active ON discounts(is_active) WHERE is_active = TRUE;

-- FUNCTIONS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_order_number() RETURNS VARCHAR AS $$
DECLARE v_number VARCHAR(20); v_exists BOOLEAN;
BEGIN
    LOOP
        v_number := 'CM-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        SELECT EXISTS(SELECT 1 FROM orders WHERE order_number = v_number) INTO v_exists;
        EXIT WHEN NOT v_exists;
    END LOOP;
    RETURN v_number;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_custom_order_number() RETURNS VARCHAR AS $$
DECLARE v_number VARCHAR(20); v_exists BOOLEAN;
BEGIN
    LOOP
        v_number := 'CU-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        SELECT EXISTS(SELECT 1 FROM custom_orders WHERE order_number = v_number) INTO v_exists;
        EXIT WHEN NOT v_exists;
    END LOOP;
    RETURN v_number;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_product_search_vector() RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := TO_TSVECTOR('english',
        COALESCE(NEW.name, '') || ' ' || COALESCE(NEW.description, '') || ' ' || COALESCE(ARRAY_TO_STRING(NEW.tags, ' '), ''));
    RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION recalculate_product_rating() RETURNS TRIGGER AS $$
DECLARE v_product_id UUID; v_avg DECIMAL(3,2); v_count INT;
BEGIN
    IF TG_OP = 'DELETE' THEN v_product_id := OLD.product_id;
    ELSE v_product_id := NEW.product_id; END IF;
    SELECT COALESCE(AVG(rating), 0), COUNT(*) INTO v_avg, v_count
    FROM reviews WHERE product_id = v_product_id AND is_visible = TRUE;
    UPDATE products SET average_rating = v_avg, review_count = v_count WHERE id = v_product_id;
    RETURN COALESCE(NEW, OLD);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_order_number() RETURNS TRIGGER AS $$
BEGIN IF NEW.order_number IS NULL OR NEW.order_number = '' THEN NEW.order_number := generate_order_number(); END IF; RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_custom_order_number() RETURNS TRIGGER AS $$
BEGIN IF NEW.order_number IS NULL OR NEW.order_number = '' THEN NEW.order_number := generate_custom_order_number(); END IF; RETURN NEW; END; $$ LANGUAGE plpgsql;

-- TRIGGERS
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_custom_orders_updated_at BEFORE UPDATE ON custom_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_discounts_updated_at BEFORE UPDATE ON discounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_cart_updated_at BEFORE UPDATE ON cart FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_product_search_vector BEFORE INSERT OR UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_product_search_vector();
CREATE TRIGGER trg_review_rating_update AFTER INSERT OR UPDATE OR DELETE ON reviews FOR EACH ROW EXECUTE FUNCTION recalculate_product_rating();
CREATE TRIGGER trg_set_order_number BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION set_order_number();
CREATE TRIGGER trg_set_custom_order_number BEFORE INSERT ON custom_orders FOR EACH ROW EXECUTE FUNCTION set_custom_order_number();

-- VIEWS
CREATE VIEW v_products_full AS
SELECT p.id, p.name, p.description, p.price, p.category_id, c.name AS category_name, p.tags,
       p.is_featured, p.show_on_hero, p.is_active, p.average_rating, p.review_count,
       pi.id AS primary_image_id, p.created_at, p.updated_at
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = TRUE
WHERE p.is_active = TRUE;

CREATE VIEW v_orders_summary AS
SELECT o.id, o.order_number, o.status, o.order_type, o.total_amount, o.discounted_amount,
       o.discount_code, o.created_at, o.updated_at,
       COALESCE(u.full_name, o.guest_name) AS customer_name,
       COALESCE(u.email, o.guest_email) AS customer_email,
       COALESCE(u.phone, o.guest_phone) AS customer_phone,
       COUNT(oi.id) AS item_count
FROM orders o
LEFT JOIN users u ON u.id = o.user_id
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id, u.full_name, u.email, u.phone;

CREATE VIEW v_user_stats AS
SELECT u.id, u.full_name, u.email, u.phone, u.is_blocked, u.created_at,
       COUNT(o.id) AS total_orders,
       COUNT(o.id) FILTER (WHERE o.status = 'delivered') AS delivered_orders,
       COUNT(o.id) FILTER (WHERE o.status = 'cancelled') AS cancelled_orders,
       COALESCE(SUM(o.total_amount) FILTER (WHERE o.status = 'delivered'), 0) AS total_spent
FROM users u LEFT JOIN orders o ON o.user_id = u.id GROUP BY u.id;

CREATE VIEW v_active_discounts AS
SELECT d.*, p.name AS product_name, c.name AS category_name
FROM discounts d
LEFT JOIN products p ON p.id = d.product_id
LEFT JOIN categories c ON c.id = d.category_id
WHERE d.is_active = TRUE AND (d.end_date IS NULL OR d.end_date > NOW())
  AND (d.start_date IS NULL OR d.start_date <= NOW());

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read products" ON products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read product_images" ON product_images FOR SELECT USING (TRUE);
CREATE POLICY "Public read avatars" ON avatars FOR SELECT USING (TRUE);
CREATE POLICY "Public read discounts" ON discounts FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read social_links" ON social_links FOR SELECT USING (TRUE);
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (TRUE);

-- SEED DATA
INSERT INTO social_links (platform, url, follower_count) VALUES
('whatsapp','https://whatsapp.com/channel/0029VbBXbGv9WtC90s3UER04',0),
('instagram','https://www.instagram.com/croch_etmasterpiece?igsh=bzN4ZzEzYXZiZ2py',0),
('facebook','https://www.facebook.com/profile.php?id=61579353555271&mibextid=ZbWKwL',0),
('tiktok','https://www.tiktok.com/@croch_et.masterpiece',0)
ON CONFLICT (platform) DO NOTHING;

INSERT INTO site_settings (key, value) VALUES
('business_name','Crochet Masterpiece'),
('admin_email','amnamubeen516@gmail.com'),
('admin_phone','03159202186'),
('whatsapp_number','923159202186'),
('currency','PKR'),
('currency_symbol','₨'),
('hero_tagline','Handcrafted with love, made for you'),
('hero_subtitle','Explore our beautiful collection of handmade crochet creations')
ON CONFLICT (key) DO NOTHING;

INSERT INTO admins (email, password_hash, full_name) VALUES
('amnamubeen516@gmail.com', crypt('Admin@123', gen_salt('bf', 10)), 'Amna Mubeen')
ON CONFLICT (email) DO NOTHING;
