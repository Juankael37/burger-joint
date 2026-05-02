# Supabase Setup for Big Buns Burger Order System

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
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant permissions
GRANT USAGE ON SCHEMA cron TO postgres;

-- Create the cleanup job (runs every hour)
SELECT cron.schedule(
  'cleanup-old-pending-orders',
  '0 * * * *', -- Every hour
  $$
  UPDATE orders 
  SET status = 'cancelled', deleted_at = NOW()
  WHERE status = 'pending' 
  AND created_at < NOW() - INTERVAL '12 hours'
  $$
);
```

### Option 2: Database Function (Alternative)

```sql
-- Create cleanup function
CREATE OR REPLACE FUNCTION cleanup_old_pending_orders()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE orders 
  SET status = 'cancelled', deleted_at = NOW()
  WHERE status = 'pending' 
  AND created_at < NOW() - INTERVAL '12 hours';
END;
$$;

-- Test it
SELECT cleanup_old_pending_orders();
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