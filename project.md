# The Burger Joint - Restaurant Website

## Project Overview
- **Project Name**: The Burger Joint
- **Type**: Portfolio demo restaurant website
- **Tech Stack**: HTML5, CSS3, Vanilla JavaScript, LocalStorage
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
9. **LocalStorage Persistence** - All data saved in browser

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
| Classic Burger | Lettuce, tomato, pickles, onions, mustard, ketchup | $9.49 |
| Bacon Burger | Classic + crispy bacon | $10.99 |
| Little Cheeseburger | Smaller patty with cheese | $7.99 |
| Bacon Cheeseburger | Bacon + cheese + all toppings | $11.99 |
| Veggie Burger | Grilled mushrooms, onions, peppers, lettuce, tomato | $10.49 |

### Hot Dogs
| Name | Description | Price |
|------|-------------|-------|
| Regular Hot Dog | All-beef hot dog in bun | $6.49 |
| Bacon Dog | Hot dog wrapped in bacon | $7.99 |
| Cheese Dog | Hot dog with melted cheese | $7.49 |

### Sides
| Name | Description | Price |
|------|-------------|-------|
| Little Fries | Hand-cut, fresh potatoes | $4.49 |
| Regular Fries | Large serving of fries | $5.99 |
| Cheese Fries | Fries topped with melted cheese | $7.49 |
| Onion Rings | Beer-battered crispy rings | $5.49 |

### Drinks
| Name | Description | Price |
|------|-------------|-------|
| Small Drink | Choice of soda | $2.99 |
| Large Drink | Large soda refillable | $3.49 |
| Milkshake | Chocolate, vanilla, or strawberry | $5.99 |

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
- [ ] Password protection works
- [ ] Can add new menu item with image
- [ ] Can edit existing items
- [ ] Can delete items with confirmation
- [ ] Drag-drop image upload works
- [ ] Preview shows draft changes
- [ ] Publish syncs to public menu
- [ ] Data persists after page refresh

---

## Notes
- Demo project for portfolio purposes
- Uses placeholder images from Unsplash
- LocalStorage for data persistence (no backend required)
- Simple client-side password (not secure for production)