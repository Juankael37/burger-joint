# The Burger Joint - Restaurant Website

## Project Overview
- **Project Name**: The Burger Joint
- **Type**: Portfolio demo restaurant website
- **Tech Stack**: HTML5, CSS3, Vanilla JavaScript, Supabase (Database & Storage)
- **Core Functionality**: Public restaurant site with hero, about, menu, contact sections + secret admin dashboard for menu management
- **Target Users**: Restaurant customers (public), Business owner (admin)

---

## UI/UX Specification

### Layout Structure

**Public Page (index.html)**
- Fixed navigation bar (transparent on hero, solid on scroll)
- Hero section (100vh, full-width background)
- About section (two-column: story + photos grid)
- Menu section (categorized cards, filterable)
- Contact section (info + hours + map placeholder)
- Footer (copyright + social links)

**Admin Page (admin.html)**
- Login screen (password protected)
- Dashboard with sidebar (categories) + main area (items grid) + preview panel

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

**Spacing System**
- Section padding: 80px vertical (desktop), 40px (mobile)
- Card padding: 24px
- Grid gap: 24px
- Container max-width: 1200px

### Components

**Navigation**
- Logo (left)
- Links: Home, About, Menu, Contact
- Mobile: hamburger menu with slide-out drawer

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

**Admin Item Cards**
- Thumbnail (150x150)
- Name + category
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
3. **Menu Categories** - Filter menu by category (Burgers, Hot Dogs, Sides, Drinks)
4. **Menu Data Loading** - Load from localStorage, fallback to sample data

### Admin Dashboard Features
1. **Password Protection** - Simple password check ("admin")
2. **Dashboard View** - Grid of all menu items
3. **Add New Item** - Modal form with:
   - Category dropdown
   - Item name input
   - Description textarea
   - Price input
   - Drag-drop image upload
   - Save as draft button
4. **Edit Item** - Click to edit existing item
5. **Delete Item** - Confirmation dialog before delete
6. **Image Upload** - Drag-drop or click to browse
7. **Preview Panel** - Live preview of menu changes
8. **Publish** - Sync draft changes to public menu
9. **Supabase Persistence** - Data and images saved in Supabase (migrated from LocalStorage)

### Data Structure
```javascript
{
  items: [
    {
      id: "unique-id",
      category: "Burgers",
      name: "Classic Burger",
      description: "Lettuce, tomato, pickles...",
      price: 9.49,
      image: "base64-string-or-url",
      status: "published" | "draft"
    }
  ]
}
```

---

## File Structure
```
restaurant-website/
├── project.md           (this file)
├── index.html          (public page)
├── admin.html          (admin dashboard)
├── css/
│   └── styles.css      (all styles)
├── js/
│   ├── app.js          (public page logic)
│   └── admin.js        (admin dashboard logic)
└── assets/             (placeholder directory)
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
- [ ] Hero section displays with background image and CTA buttons
- [ ] Navigation scrolls smoothly to sections
- [ ] About section shows story and photos
- [ ] Menu displays categorized items with images
- [ ] Category filter works correctly
- [ ] Contact section shows hours and info
- [ ] Mobile responsive on all breakpoints

### Admin Page
- [x] Password protection works
- [x] Can add new menu item with image (Requires Supabase RLS policies to be set)
- [x] Can edit existing items
- [x] Can delete items with confirmation
- [x] Drag-drop image upload works
- [x] Preview shows draft changes
- [x] Publish syncs to public menu
- [x] Data persists after page refresh

---

## Notes
- Demo project for portfolio purposes
- Uses placeholder images from Unsplash
- Supabase used for database and image storage persistence
  - Note: Image uploads require RLS policies (`INSERT`, `SELECT`, `UPDATE`, `DELETE`) on the `menu-images` bucket to be set manually in the Supabase Dashboard.
- Simple client-side password (not secure for production)