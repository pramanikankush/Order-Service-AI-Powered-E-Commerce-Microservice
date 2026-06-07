-- Sample catalog so the UI is populated on first boot.
-- Embeddings will be populated asynchronously when products are edited; for seed we
-- leave them null — the frontend gracefully shows "not embedded yet".
INSERT INTO products (id, sku, title, description, category, price, image_url)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'KEY-001', 'Mechanical Keyboard 87-Key',
   'Compact hot-swappable mechanical keyboard with RGB and PBT keycaps.',
   'Keyboards', 149.00, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800'),
  ('22222222-2222-2222-2222-222222222222', 'MON-001', 'UltraWide 34" Curved Monitor',
   '34-inch UWQHD IPS panel with 144Hz refresh rate for productivity and gaming.',
   'Monitors', 599.00, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800'),
  ('33333333-3333-3333-3333-333333333333', 'MSE-001', 'Ergonomic Wireless Mouse',
   'Vertical ergonomic mouse with Bluetooth and quiet clicks.',
   'Mice', 69.00, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800'),
  ('44444444-4444-4444-4444-444444444444', 'HDN-001', 'Studio Headphones',
   'Closed-back studio monitor headphones with flat response.',
   'Audio', 229.00, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'),
  ('55555555-5555-5555-5555-555555555555', 'LPT-001', 'UltraBook 14"',
   'Lightweight ultrabook with 32GB RAM and 1TB SSD.',
   'Laptops', 1499.00, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800');

INSERT INTO inventory (product_id, quantity, reserved)
VALUES
  ('11111111-1111-1111-1111-111111111111', 50, 0),
  ('22222222-2222-2222-2222-222222222222', 20, 0),
  ('33333333-3333-3333-3333-333333333333', 100, 0),
  ('44444444-4444-4444-4444-444444444444', 30, 0),
  ('55555555-5555-5555-5555-555555555555', 10, 0);
