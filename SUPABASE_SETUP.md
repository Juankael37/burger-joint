# Supabase Setup for Big Buns Burger Order System

## Branches Table (Multi-Branch Feature)

Run this in Supabase SQL Editor:

```sql
-- Create branches table
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  location TEXT,
  address TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample branches
INSERT INTO branches (name, slug, location, address, phone) VALUES
('Main Branch', 'main', 'Downtown', '123 Burger Street, Foodville, CA', '(555) 123-4567'),
('North Branch', 'north', 'North District', '456 North Ave, Foodville, CA', '(555) 234-5678'),
('South Branch', 'south', 'South District', '789 South Blvd, Foodville, CA', '(555) 345-6789');

-- Enable RLS
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public read branches" ON branches;
DROP POLICY IF EXISTS "Public insert branches" ON branches;
DROP POLICY IF EXISTS "Public update branches" ON branches;
DROP POLICY IF EXISTS "Public delete branches" ON branches;

CREATE POLICY "Public read branches" ON branches FOR SELECT USING (true);
CREATE POLICY "Public insert branches" ON branches FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update branches" ON branches FOR UPDATE USING (true);
CREATE POLICY "Public delete branches" ON branches FOR DELETE USING (true);
```

---

## Add branch_id to Orders Table

```sql
-- Add branch_id column to orders table
ALTER TABLE orders ADD COLUMN branch_id UUID REFERENCES branches(id);
```

---

## Orders Table SQL

Run this in Supabase SQL Editor:

```sql
-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  pickup_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'completed', 'rejected', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public read orders" ON orders;
DROP POLICY IF EXISTS "Public insert orders" ON orders;
DROP POLICY IF EXISTS "Public update orders" ON orders;

CREATE POLICY "Public read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update orders" ON orders FOR UPDATE USING (true);
```

---

## Auto-Delete Cron Job

This will automatically cancel/soft-delete pending orders after 12 hours.

### Option 1: pg_cron (Recommended)

```sql
-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant permissions
GRANT USAGE ON SCHEMA cron TO postgres;

-- Create the cleanup job for pending orders (runs every hour)
SELECT cron.schedule(
  'delete-old-pending-orders',
  '0 * * * *', -- Every hour
  $$
  DELETE FROM orders 
  WHERE status = 'pending' 
  AND created_at < NOW() - INTERVAL '12 hours'
  $$
);

-- Create the cleanup job for completed orders (runs every hour)
SELECT cron.schedule(
  'delete-old-completed-orders',
  '0 * * * *', -- Every hour
  $$
  DELETE FROM orders 
  WHERE status = 'completed' 
  AND created_at < NOW() - INTERVAL '24 hours'
  $$
);
```

### Option 2: Database Function (Alternative)

```sql
-- Create cleanup function
CREATE OR REPLACE FUNCTION cleanup_old_orders()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete pending orders older than 12 hours
  DELETE FROM orders 
  WHERE status = 'pending' 
  AND created_at < NOW() - INTERVAL '12 hours';

  -- Delete completed orders older than 24 hours
  DELETE FROM orders 
  WHERE status = 'completed' 
  AND created_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- Test it manually
SELECT cleanup_old_orders();
```

---

## Files Created

| File | Purpose |
|------|---------|
| `js/orders.js` | Order & cart management |
| `order.html` | Customer ordering page |
| `checkout.html` | Checkout with pickup name |
| `orders-admin.html` | Staff order management |

---

## Page URLs

| Page | URL |
|------|-----|
| Order | `/order.html` |
| Checkout | `/checkout.html` |
| Orders Admin | `/orders-admin.html` |

---

## How It Works

1. **Customer** goes to `/order.html`, adds items to cart
2. **Checkout** - enters name/table number, submits order
3. **Order** saved to Supabase with status = "pending"
4. **Staff** sees pending orders at `/orders-admin.html`
5. **Staff** marks as "claimed" (paid) or "completed" (picked up)
6. **Cron** auto-cancels orders pending > 12 hours