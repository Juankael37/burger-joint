# Big Buns Burger - Restaurant Website

## Project Overview
- **Project Name**: Big Buns Burger
- **Type**: Multi-branch restaurant web application
- **Tech Stack**: HTML5, CSS3, Vanilla JavaScript, Supabase (Database & Storage)
- **Core Functionality**: Branch selection, ordering system, admin dashboard with per-branch menu availability
- **Target Users**: Restaurant customers (public), Branch staff (admin)

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
```

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
- [x] Per-branch item availability toggle
- [x] Branch management page (add, edit, delete branches)
- [x] Branch availability filters items on order page

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
- Cart sidebar (sticky on desktop)
- Mobile sticky checkout button
- Disabled Add button for unavailable items

**Checkout (checkout.html)**
- Order summary
- Customer name input
- Success page with order number + branch info

**Admin Pages**
- admin.html: Menu management + branch availability toggle
- orders-admin.html: Orders list with branch filter
- branches.html: Dedicated branch settings page

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
- Hero Title: 72px (desktop), 48px (mobile)
- Section Titles: 48px (desktop), 32px (mobile)
- Body Text: 16px
- Small Text: 14px

### Components

**Navigation**
- Logo (left)
- Links: Home, About, Menu, Contact
- Order Now button (opens branch modal)
- Mobile: hamburger menu with slide-out drawer

**Branch Selection Modal**
- Modal with branch cards
- Each card shows name, location, address, phone
- Click navigates to order.html?branch={slug}

**Hero**
- Full-screen background image (burger/fries themed)
- Overlay gradient (dark to transparent)
- Centered content: logo, tagline, CTA buttons

**Menu Cards**
- Image (top, 200px height)
- Category tag
- Item name (bold)
- Description (muted, 2 lines max)
- Price (red, bold)
- Hover: subtle lift effect

**Order Page**
- Branch badge (shows current branch)
- Menu categories with Add buttons
- Cart sidebar with quantity controls
- Checkout button

**Admin Item Cards**
- Thumbnail (150x150)
- Name + category
- Branch availability toggle
- Edit/Delete buttons
- Status badge (Draft/Published)

**Forms**
- Input fields with red focus border
- Drag-drop image zone with dashed border
- Buttons: Primary (red), Secondary (outline)

---

## Functionality Specification

### Public Page Features
1. **Smooth Scroll Navigation** - Click nav links to scroll to sections
2. **Mobile Menu** - Hamburger toggle for mobile
3. **Branch Selection** - Modal to select ordering branch
4. **Menu Categories** - Filter menu by category (Burgers, Hot Dogs, Sides, Drinks)
5. **Menu Data Loading** - Load from Supabase with per-branch filtering

### Order Flow Features
1. **Branch Parameter** - Read from URL (?branch=main)
2. **Branch Badge** - Display current branch on order page
3. **Cart Management** - Add/remove items, adjust quantities
4. **Checkout** - Enter pickup name, place order
5. **Success** - Show order number + branch info
6. **Branches Data** - Save branch_id with each order

### Admin Dashboard Features
1. **Password Protection** - Simple password check ("admin")
2. **Dashboard View** - Grid of all menu items
3. **Branch Filter** - Dropdown to select branch for availability
4. **Branch Availability Toggle** - Mark items available/unavailable per branch
5. **Add New Item** - Modal form with:
   - Category dropdown
   - Item name input
   - Description textarea
   - Price input
   - Drag-drop image upload
   - Save as draft button
6. **Edit Item** - Click to edit existing item
7. **Delete Item** - Confirmation dialog before delete
8. **Image Upload** - Drag-drop or click to browse
9. **Preview Panel** - Live preview of menu changes
10. **Publish** - Sync draft changes to public menu
11. **Supabase Persistence** - Data and images saved in Supabase

### Branch Settings Features (branches.html)
1. **View All Branches** - Table showing name, slug, location, status
2. **Add New Branch** - Form with name + location
3. **Edit Branch** - Inline edit branch name, save to update
4. **Activate/Deactivate** - Toggle branch active status
5. **Delete Branch** - Remove branch with confirmation
6. **Auto-refresh** - Admin dropdown updates when branches change

### Orders Admin Features
1. **Branch Filter** - Filter orders by branch
2. **Status Updates** - Mark pending/claimed/completed
3. **Search** - Search by order number

### Data Structure
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
  unavailable_at_branches: ["north"] // Array of branch slugs where unavailable
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

## File Structure
```
restaurant-website/
├── project.md           (this file)
├── index.html          (public page)
├── order.html         (ordering page)
├── checkout.html     (checkout page)
├── admin.html        (menu admin)
├── orders-admin.html (orders admin)
├── branches.html     (branch settings)
├── css/
│   └── styles.css  (all styles)
├── js/
│   ├── supabase.js (API client)
│   ├── app.js    (public page logic)
│   ├── admin.js  (admin dashboard logic)
│   └── orders.js (orders admin logic)
└── supabase-mcp/    (helper scripts)
```

---

## Sample Menu Data

### Burgers
| Name | Description | Price |
|------|-------------|-------|
| Classic Burger | Lettuce, tomato, pickles, onions, mustard, ketchup | ₱569.40 |
| Bacon Burger | Classic + crispy bacon | ₱659.40 |
| Little Cheeseburger | Smaller patty with cheese | ₱479.40 |
| Bacon Cheeseburger | Bacon + cheese + all toppings | ₱719.40 |
| Veggie Burger | Grilled mushrooms, onions, peppers, lettuce, tomato | ₱629.40 |

### Hot Dogs
| Name | Description | Price |
|------|-------------|-------|
| Regular Hot Dog | All-beef hot dog in bun | ₱389.40 |
| Bacon Dog | Hot dog wrapped in bacon | ₱479.40 |
| Cheese Dog | Hot dog with melted cheese | ₱449.40 |

### Sides
| Name | Description | Price |
|------|-------------|-------|
| Little Fries | Hand-cut, fresh potatoes | ₱269.40 |
| Regular Fries | Large serving of fries | ₱359.40 |
| Cheese Fries | Fries topped with melted cheese | ₱449.40 |
| Onion Rings | Beer-battered crispy rings | ₱329.40 |

### Drinks
| Name | Description | Price |
|------|-------------|-------|
| Small Drink | Choice of soda | ₱179.40 |
| Large Drink | Large soda refillable | ₱209.40 |
| Milkshake | Chocolate, vanilla, or strawberry | ₱359.40 |

---

## Admin Credentials
- **Password**: admin
- **Access**: Navigate to admin.html

---

## Acceptance Criteria

### Public Page
- [x] Hero section displays with background image and CTA buttons
- [x] Navigation scrolls smoothly to sections
- [x] About section shows story and photos
- [x] Menu displays categorized items with images
- [x] Category filter works correctly
- [x] Contact section shows hours and info
- [x] Mobile responsive on all breakpoints

### Admin Page
- [x] Password protection works
- [x] Can add new menu item with image
- [x] Can edit existing items
- [x] Can delete items with confirmation
- [x] Drag-drop image upload works
- [x] Preview shows draft changes
- [x] Publish syncs to public menu
- [x] Data persists after page refresh
- [x] Branch availability toggle works
- [x] Branch settings page - add/edit/delete branches

### Order Page
- [x] Shows items for selected branch
- [x] Unavailable items have disabled Add button
- [x] Cart works with branch context

---

## Current Status & Pending Tasks

### Completed
- [x] Base restaurant website with hero, about, menu, contact
- [x] Admin dashboard with CRUD operations
- [x] Supabase integration for data persistence
- [x] Image upload to Supabase Storage
- [x] Multi-branch feature (branch selection, orders with branch_id)
- [x] Admin branch filter for orders
- [x] Per-branch item availability toggle
- [x] Order page filters unavailable items by branch
- [x] Add button disabled for unavailable items
- [x] Branch management page (add, edit, delete, activate/deactivate)
- [x] Admin dropdown refreshes when branches change
- [x] Stable sorting in admin to prevent reordering on toggle

### Pending
- [ ] Test complete branch availability flow end-to-end

### Known Issues
- Previously: Toggle switch error - FIXED (used UUID instead of slug)
- Previously: "No branches found" in modal - FIXED (created dedicated branches.html page)
- Previously: Items reordering on toggle - FIXED (added stable alphabetical sort)

---

## Notes
- Uses slugs (main, north, south) for branch identification in unavailable_at_branches
- Orders saved with branch_id (UUID from branches table)
- Branch dropdown values stored as branch slugs
- Branch settings page communicates with admin via postMessage
- Demo project for portfolio purposes
- Uses placeholder images from Unsplash
- Simple client-side password (not secure for production)

---

## Recent Updates (2025-05-02)
1. Fixed branch availability filter - use slugs instead of UUIDs
2. Added branch management page (branches.html) with full CRUD
3. Admin dropdown now refreshes when branches are modified
4. Order page shows disabled Add button for unavailable items
5. Added stable sorting to admin to prevent reordering on toggle
6. Removed leaf emoji from Branch Settings title for cleaner look