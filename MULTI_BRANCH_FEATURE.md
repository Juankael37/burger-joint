# Multi-Branch Restaurant System - Future Feature Spec

## Overview

Convert the single-restaurant web app into a **multi-branch restaurant system** allowing customers to select which branch they want to order from, with orders routing to the appropriate branch's staff.

---

## Current Architecture

```
Big Buns Burger (Single Restaurant)
├── Public Site (index.html)
│   ├── Hero → About → Menu → Contact
│   └── Order Flow
│       ├── Menu Selection
│       ├── Cart
│       └── Checkout (Pickup Name)
├── Admin Panel (admin.html)
│   ├── Menu Management
│   └── Orders Management (orders-admin.html)
├── Supabase Backend
│   ├── menu_items table
│   └── orders table
└── Netlify Deployment
```

---

## Future Architecture

```
Big Buns Burger (Multi-Branch)
├── Landing Page
│   └── Branch Selection Page (NEW)
├── Branch Order Pages
│   ├── Main Branch (/order.html?branch=main)
│   ├── Branch 2 (/order.html?branch=branch2)
│   └── Branch 3 (/order.html?branch=branch3)
├── Admin Panel (Single with Branch Filter)
│   ├── Menu Management (global or per-branch)
│   └── Orders Management (filter by branch)
├── Supabase Backend
│   ├── branches table (NEW)
│   ├── menu_items (global or per-branch)
│   └── orders (with branch_id)
└── Netlify Deployment
```

---

## Database Schema

### SQL to Run in Supabase

```sql
-- ============================================
-- BRANCHES TABLE
-- ============================================
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,  -- e.g., "main", "branch2", "north-side"
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
CREATE POLICY "Public read branches" ON branches FOR SELECT USING (true);
CREATE POLICY "Public insert branches" ON branches FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update branches" ON branches FOR UPDATE USING (true);
CREATE POLICY "Public delete branches" ON branches FOR DELETE USING (true);

-- ============================================
-- UPDATE ORDERS TABLE
-- ============================================
ALTER TABLE orders ADD COLUMN branch_id UUID REFERENCES branches(id);

-- ============================================
-- UPDATE MENU ITEMS (Optional - if per-branch menus)
-- ============================================
ALTER TABLE menu_items ADD COLUMN branch_id UUID REFERENCES branches(id);
-- If NULL, menu item is available at all branches
```

---

## File Changes Required

### 1. Landing Page (index.html)
- Add "Select Your Branch" section
- Show list of active branches with locations
- Click branch → redirects to order page with branch parameter
- Alternative: Modal/popup for branch selection before ordering

### 2. Order Page (order.html)
- Read `?branch=slug` from URL
- If no branch selected, redirect to branch selection
- Add branch name to cart/checkout
- Filter menu items by branch (if per-branch menus)

### 3. Checkout Page (checkout.html)
- Include branch_id with order data
- Display selected branch on confirmation

### 4. Orders Admin (orders-admin.html)
- Add branch filter dropdown (All / Main / North / South)
- Orders list filters by selected branch
- Staff see only their branch's orders

### 5. Menu Admin (admin.html)
- Option A: Global menu (all branches same)
- Option B: Branch-specific menu (edit per branch)

### 6. Supabase Client (js/supabase.js)
```javascript
// Add to supabaseClient
async getBranches() {
  const response = await fetch(`${supabaseUrl}/rest/v1/branches?is_active=eq.true&order=name`, {
    headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
  });
  return response.json();
},

async getMenuByBranch(branchId) {
  // If branch_id is NULL in menu_items, it applies to all
  const response = await fetch(
    `${supabaseUrl}/rest/v1/menu_items?status=eq.published&(branch_id=eq.${branchId}|branch_id=is.null)&order=category`,
    { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
  );
  return response.json();
}
```

---

## URL Structure

| Page | URL |
|------|-----|
| Branch Selection | `/` (home page) |
| Main Branch Order | `/order.html?branch=main` |
| North Branch Order | `/order.html?branch=north` |
| Admin (All) | `/admin.html` |
| Admin (Branch Filter) | `/orders-admin.html?branch=main` |

---

## Implementation Priority

### Phase 1: Basic Multi-Branch (MVP)
- [ ] Add branches table
- [ ] Update orders with branch_id
- [ ] Branch selection on landing page
- [ ] Order page reads branch from URL
- [ ] Checkout saves branch with order
- [ ] Admin orders filter by branch

### Phase 2: Enhanced Features
- [ ] Per-branch menu items (different items per branch)
- [ ] Branch-specific pricing
- [ ] Location/map for each branch
- [ ] Estimated pickup time by branch

### Phase 3: Advanced
- [ ] Real-time order notifications per branch
- [ ] Branch performance analytics
- [ ] Inventory management per branch
- [ ] Staff accounts per branch

---

## Technical Considerations

### Handling Branch Selection

**Option A: Query Parameter**
```
order.html?branch=main
```
- Simple, no routing needed
- Users can share link with branch

**Option B: LocalStorage**
- Save selected branch to localStorage
- Auto-remember when returning

**Option C: Subdomain**
```
main.burgerjoint.com → order.html?branch=main
```
- Requires Netlify redirects configuration
- More professional but complex

---

## Testing Checklist

- [ ] Multiple branches display on landing
- [ ] Clicking branch goes to correct order page
- [ ] Orders save with correct branch_id
- [ ] Admin can filter orders by branch
- [ ] Each branch sees only their orders
- [ ] Menu items work for each branch

---

## Related Files

- `SUPABASE_SETUP.md` - Current database setup
- `project.md` - Original project documentation
- `js/supabase.js` - API client (update for branches)
- `index.html` - Landing page (add branch selection)
- `order.html` - Order page (read branch param)
- `checkout.html` - Checkout (save branch_id)
- `orders-admin.html` - Admin (add branch filter)
- `admin.html` - Menu admin (optional per-branch)

---

## Notes

- Keep menu global initially (same menu, prices, photos)
- Easy to add per-branch customization later
- Branch selection should be prominent but not intrusive
- Consider adding "Find Nearest Branch" using geolocation (future)