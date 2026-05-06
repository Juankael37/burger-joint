# Big Buns Burger - Restaurant Website

## Project Overview
- **Project Name**: Big Buns Burger
- **Type**: Multi-branch restaurant web application
- **Tech Stack**: HTML5, CSS3, Vanilla JavaScript, Supabase (Database & Storage)
- **Core Functionality**: Branch selection, ordering system, admin dashboard with per-branch menu availability
- **Target Users**: Restaurant customers (public), Branch staff (admin)
- **Repository**: https://github.com/Juankael37/burger-joint
- **Hosting**: Netlify (auto-deploys from GitHub)
- **Active Branch**: `fix/code-quality-improvements`

---

## Multi-Branch Feature

### Database Schema
Run in Supabase SQL Editor:
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

-- Add branch_id to orders
ALTER TABLE orders ADD COLUMN branch_id UUID REFERENCES branches(id);

-- Add availability column (TEXT array for branch slugs)
ALTER TABLE menu_items ADD COLUMN unavailable_at_branches TEXT[];

-- RLS policies for branches table (REQUIRED)
CREATE POLICY "Public read branches" ON branches FOR SELECT TO public USING (true);
CREATE POLICY "Public insert branches" ON branches FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public update branches" ON branches FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public delete branches" ON branches FOR DELETE TO public USING (true);
```

### Availability Encoding
- Format: `"branchSlug:reason"` in `unavailable_at_branches` array
- Reasons: `temp_unavailable`, `sold_out`
- Legacy: plain slug `"main"` treated as `temp_unavailable`
- API: `supabaseClient.setItemAvailability(itemId, branchSlug, reason)`

### URL Structure
| Page | URL |
|------|-----|
| Branch Selection | `/` (home page) |
| Main Branch Order | `/order.html?branch=main` |
| North Branch Order | `/order.html?branch=north` |
| Admin (All) | `/admin.html` |
| Admin (Branch Filter) | `/orders-admin.html?branch=main` |
| Branch Settings | `/branches.html` |

### Features Implemented
- [x] Branch selection modal on landing page
- [x] Branch parameter in order page URL
- [x] Orders saved with branch_id
- [x] Admin branch filter dropdown
- [x] Per-branch item availability dropdown (3 states)
- [x] Branch management page (add, edit details, delete branches)
- [x] Unavailable items show grayed-out with stamp overlay on order page

---

## File Structure
```
restaurant-website/
├── project.md           (this file)
├── index.html          (public page)
├── order.html         (ordering page)
├── checkout.html     (checkout page)
├── admin.html        (menu admin)
├── orders-admin.html (orders admin)
├── branches.html     (branch settings — full CRUD)
├── css/
│   └── styles.css  (all styles)
├── js/
│   ├── supabase.js (API client — single source of truth for credentials)
│   ├── app.js    (public page logic)
│   └── admin.js  (admin dashboard logic)
└── assets/          (static assets)
```

---

## UI/UX Specification

### Layout Structure

**Public Page (index.html)**
- Fixed navigation bar (transparent on hero, solid on scroll)
- Hero section (100vh, full-width background)
- About section (two-column: story + photos grid)
- Menu section (categorized cards, filterable)
- Contact section (info + hours + map placeholder)
- Branch selection modal
- Footer (copyright + social links)

**Order Page (order.html)**
- Branch badge display
- Menu categories with Add buttons
- Cart sidebar (sticky on desktop, shows ₱ peso sign)
- Mobile sticky checkout button
- Unavailable items: grayed-out with diagonal stamp overlay
  - "TEMPORARILY UNAVAILABLE" stamp (amber border)
  - "SOLD OUT" stamp (red border)

**Checkout (checkout.html)**
- Order summary
- Customer name input
- Success page with order number + branch info

**Admin Pages**
- admin.html: Menu management + availability dropdown (3 states)
- orders-admin.html: Orders list with branch filter (uses supabaseClient)
- branches.html: Full branch CRUD (name, location, address, phone, status)

**Admin Header (Two-Row Layout)**
- Top row: Logo + nav tabs (Menu Items, Orders, Branches, Order Page, View Site)
- Bottom toolbar: Branch selector + Publish button + Logout

### Responsive Breakpoints
- Desktop: > 1024px
- Tablet: 768px - 1024px
- Mobile: < 768px

### Visual Design

**Color Palette**
| Color | Hex | Usage |
|-------|-----|-------|
| Primary Red | `#D32F2F` | Buttons, accents, highlights |
| Dark Red | `#B71C1C` | Hover states, headers |
| White | `#FFFFFF` | Backgrounds, text on red |
| Warm White | `#FFFEF8` | Page background |
| Dark Gray | `#212121` | Primary text |
| Medium Gray | `#757575` | Secondary text |
| Light Gray | `#F5F5F5` | Card backgrounds |

**Typography**
- Headings: Poppins (700 weight)
- Body: Open Sans (400 weight)

---

## Data Structures
```javascript
// Menu Item
{
  id: "unique-id",
  category: "Burgers",
  name: "Classic Burger",
  description: "Lettuce, tomato, pickles...",
  price: 9.49,
  image: "url",
  status: "published" | "draft",
  unavailable_at_branches: ["main:sold_out", "north:temp_unavailable"]
  // Format: "branchSlug:reason" — legacy plain slugs treated as temp_unavailable
}

// Order
{
  id: "unique-id",
  items: [{name: "Classic Burger", price: 9.49, qty: 1}],
  total: 9.49,
  pickup_name: "John",
  order_number: 1234,
  branch_id: "branch-uuid",
  status: "pending" | "claimed" | "completed"
}

// Branch
{
  id: "uuid",
  name: "Main Branch",
  slug: "main",
  location: "Downtown",
  address: "123 Burger Street",
  phone: "(555) 123-4567",
  is_active: true
}
```

---

## Admin Credentials
- **Password**: admin
- **Access**: Navigate to admin.html

---

## Current Status & Pending Tasks

### Completed
- [x] Base restaurant website with hero, about, menu, contact
- [x] Admin dashboard with CRUD operations
- [x] Supabase integration for data persistence
- [x] Image upload to Supabase Storage (with client-side compression)
- [x] Multi-branch feature (branch selection, orders with branch_id)
- [x] Admin branch filter for orders
- [x] Per-branch availability (3-state: available / temp unavailable / sold out)
- [x] Order page stamp overlays for unavailable items
- [x] Branch management page with full CRUD (name, location, address, phone)
- [x] Professional admin header (two-row layout)
- [x] All pages use supabaseClient (no hardcoded credentials)
- [x] API error handling on all Supabase calls (_handleResponse)
- [x] Menu filter caching (no re-fetch on category click)
- [x] SEO meta tags on all public pages
- [x] Admin pages excluded from search engines (noindex)
- [x] Code refactored: 190 lines of dead code removed (2026-05-05)

### Pending
- [ ] Add RLS policies for `branches` table (INSERT/UPDATE/DELETE) in Supabase Dashboard
- [ ] Seed 3 branches (Main, North, South) into Supabase after RLS fix
- [ ] Remove legacy `orders.js` file (not loaded by any page)

### Known Issues
- **Branches table empty in Supabase** — Admin dropdown uses fallback data. Need INSERT RLS policy + seed.

---

## Sample Menu Data

### Burgers
| Name | Price |
|------|-------|
| Classic Burger | ₱569.40 |
| Bacon Burger | ₱659.40 |
| Little Cheeseburger | ₱479.40 |
| Bacon Cheeseburger | ₱719.40 |
| Veggie Burger | ₱629.40 |

### Hot Dogs
| Name | Price |
|------|-------|
| Regular Hot Dog | ₱389.40 |
| Bacon Dog | ₱479.40 |
| Cheese Dog | ₱449.40 |

### Sides
| Name | Price |
|------|-------|
| Little Fries | ₱269.40 |
| Regular Fries | ₱359.40 |
| Cheese Fries | ₱449.40 |
| Onion Rings | ₱329.40 |

### Drinks
| Name | Price |
|------|-------|
| Small Drink | ₱179.40 |
| Large Drink | ₱209.40 |
| Milkshake | ₱359.40 |

---

## Notes
- Uses slugs (main, north, south) for branch identification
- Orders saved with branch_id (UUID from branches table)
- Demo project for portfolio purposes
- Simple client-side password (not secure for production)
- `supabase-mcp/` directory contains helper scripts (not part of main app)

---

## Change Log

### 2025-05-02
1. Fixed branch availability filter — use slugs instead of UUIDs
2. Added branch management page (branches.html) with CRUD
3. Admin dropdown refreshes when branches are modified
4. Added stable sorting to admin to prevent reordering on toggle

### 2026-05-04
1. Added `_handleResponse()` error checking to all Supabase API calls
2. Fixed `publishAll()` to only target draft items
3. Added menu filter caching
4. Centralized order CRUD in `supabaseClient`
5. Replaced hardcoded credentials in checkout.html
6. Removed duplicate `<script>` tags in index.html
7. Removed orphaned delete modal HTML in admin.html
8. Fixed mobile sidebar backdrop redirect
9. Added SEO meta tags to order.html and checkout.html
10. Added `noindex` meta to admin pages
11. Deleted dev test files (delete-test.html, test-order.html)

### 2026-05-05 — Feature Changes
1. **Admin header redesign** — Two-row layout: logo+nav on top, branch selector+actions on bottom
2. **Availability dropdown** — Replaced toggle with 3-option select (Available / Temporarily Unavailable / Sold Out Today)
3. **Encoded availability** — Entries stored as `"branchSlug:reason"` (backward-compatible with legacy plain slugs)
4. **Order page stamps** — Unavailable items show grayed-out with diagonal stamp overlay
5. **Branches page rebuilt** — Expandable cards with full detail editing (name, location, address, phone)

### 2026-05-05 — Refactoring (190 lines removed)
6. Removed redundant `getMenuItemsForBranch()` from supabase.js (identical to `getMenuItems()`)
7. Removed duplicate `branchesData` assignments in admin.js
8. Removed 7 dead branch management functions from admin.js (~100 lines)
9. Replaced 5 hardcoded Supabase fetch calls in orders-admin.html with `supabaseClient` methods
10. Fixed `$0.00` → `₱0.00` bug in order page cart total
11. Removed dead CSS and `updateMobileCartTotal()` function
12. Fixed CSS media query brace structure in order.html