-- HyoDream v3 DB Schema Script for Neon PostgreSQL

-- 1. Drop existing tables if they conflict (Safety First)
DROP TABLE IF EXISTS hd_inquiries CASCADE;
DROP TABLE IF EXISTS hd_custom_options CASCADE;
DROP TABLE IF EXISTS hd_catalog_items CASCADE;
DROP TABLE IF EXISTS hd_base_menus CASCADE;
DROP TABLE IF EXISTS hd_categories CASCADE;

-- 2. Create 1st level Category Table
CREATE TABLE hd_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    visible BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create 2nd level Base Menu Package Table (Cascade delete supported)
CREATE TABLE hd_base_menus (
    id VARCHAR(50) PRIMARY KEY,
    category_id VARCHAR(50) NOT NULL REFERENCES hd_categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    item_ids TEXT[] NOT NULL DEFAULT '{}',
    visible BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Catalog Items CMS Table (Individual Dishes)
CREATE TABLE hd_catalog_items (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- 'jeon' | 'jeok' | 'namul' | 'tang' | 'fruit'
    ingredients TEXT,
    points TEXT[] NOT NULL DEFAULT '{}',
    visible BOOLEAN DEFAULT TRUE NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create Extra Custom Options Table
CREATE TABLE hd_custom_options (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'addition' | 'subtraction'
    description TEXT
);

-- 6. Create Customer Inquiries/Orders Table
CREATE TABLE hd_inquiries (
    id VARCHAR(50) PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    ritual_type VARCHAR(100),
    date VARCHAR(50) NOT NULL,
    time_slot VARCHAR(100),
    address TEXT NOT NULL,
    address_detail TEXT,
    special_requests TEXT,
    customizations TEXT[] NOT NULL DEFAULT '{}',
    subtractions TEXT[] NOT NULL DEFAULT '{}',
    total_price INTEGER NOT NULL,
    created_at VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL, -- 'pending' | 'approved' | 'processing' | 'completed'
    admin_notes TEXT,
    payment_method VARCHAR(100),
    payment_status VARCHAR(50) DEFAULT 'pending' NOT NULL, -- 'paid' | 'pending' | 'cancelled'
    toss_transaction_id VARCHAR(150),
    db_created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
