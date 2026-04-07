-- SQL template for the restaurant course project
-- Replace placeholders and adapt data types to your chosen SQL dialect.

CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  role VARCHAR(20) NOT NULL DEFAULT 'customer',
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE menu_days (
  id INTEGER PRIMARY KEY,
  day_key VARCHAR(20) NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL
);

CREATE TABLE menu_items (
  id INTEGER PRIMARY KEY,
  menu_day_id INTEGER NOT NULL,
  name_fi VARCHAR(160) NOT NULL,
  name_en VARCHAR(160) NOT NULL,
  description_fi TEXT,
  description_en TEXT,
  price DECIMAL(8,2) NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  FOREIGN KEY (menu_day_id) REFERENCES menu_days(id)
);

CREATE TABLE dietary_tags (
  id INTEGER PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  label_fi VARCHAR(80) NOT NULL,
  label_en VARCHAR(80) NOT NULL
);

CREATE TABLE menu_item_dietary_tags (
  menu_item_id INTEGER NOT NULL,
  dietary_tag_id INTEGER NOT NULL,
  PRIMARY KEY (menu_item_id, dietary_tag_id),
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id),
  FOREIGN KEY (dietary_tag_id) REFERENCES dietary_tags(id)
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  pickup_time TIMESTAMP NOT NULL,
  total_price DECIMAL(8,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  menu_item_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(8,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

-- Suggested seed data to add next:
-- 1) admin user
-- 2) weekdays
-- 3) dietary tags (L, G, M, VE, VL)
-- 4) initial lunch menu rows

