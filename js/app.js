/**
 * Big Buns Burger - Public Page JavaScript
 * Loads menu from Supabase
 */

document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    loadMenu();
    initMenuFilter();
});

function initNavigation() {
    const navbar = document.getElementById('navbar');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        document.querySelector('.sidebar-backdrop')?.classList.toggle('active');
    });

    // Backdrop click closes sidebar and redirects to home
    let backdrop = document.querySelector('.sidebar-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'sidebar-backdrop';
        document.body.appendChild(backdrop);
    }
    backdrop.addEventListener('click', () => {
        navLinks.classList.remove('open');
        backdrop.classList.remove('active');
        window.location.href = 'index.html';
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            backdrop.classList.remove('active');
        });
    });
}

async function loadMenu() {
    const menuGrid = document.getElementById('menuGrid');

    try {
        menuGrid.innerHTML = Array(6).fill(`
            <div class="menu-card skeleton-card">
                <div class="skeleton-img"></div>
                <div class="menu-card-content">
                    <div class="skeleton-text skeleton-category"></div>
                    <div class="skeleton-text skeleton-title"></div>
                    <div class="skeleton-text skeleton-desc"></div>
                    <div class="skeleton-text skeleton-price"></div>
                </div>
            </div>
        `).join('');

        const items = await supabaseClient.getMenuItems();

        if (!items || items.length === 0) {
            menuGrid.innerHTML = '<p class="no-items">No menu items available. Check back soon!</p>';
            return;
        }

        renderMenuItems(items);
    } catch (error) {
        console.error('Error loading menu:', error);
        menuGrid.innerHTML = '<p class="no-items">Unable to load menu. Please try again later.</p>';
    }
}

function renderMenuItems(items) {
    const menuGrid = document.getElementById('menuGrid');

    menuGrid.innerHTML = items.map(item => `
        <div class="menu-card" data-category="${item.category}">
            <img src="${item.image}" alt="${item.name}" class="menu-card-image" loading="lazy">
            <div class="menu-card-content">
                <span class="menu-card-category">${item.category}</span>
                <h3 class="menu-card-name">${item.name}</h3>
                <p class="menu-card-description">${item.description}</p>
                <p class="menu-card-price">₱${parseFloat(item.price).toFixed(2)}</p>
            </div>
        </div>
    `).join('');
}

function initMenuFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.dataset.category;
            const menuGrid = document.getElementById('menuGrid');

            try {
                menuGrid.innerHTML = Array(6).fill(`
                    <div class="menu-card skeleton-card">
                        <div class="skeleton-img"></div>
                        <div class="menu-card-content">
                            <div class="skeleton-text skeleton-category"></div>
                            <div class="skeleton-text skeleton-title"></div>
                            <div class="skeleton-text skeleton-desc"></div>
                            <div class="skeleton-text skeleton-price"></div>
                        </div>
                    </div>
                `).join('');

                let items;
                if (category === 'all') {
                    items = await supabaseClient.getMenuItems();
                } else {
                    items = await supabaseClient.getMenuItems();
                    items = items.filter(item => item.category === category);
                }

                renderMenuItems(items);
            } catch (error) {
                console.error('Error filtering menu:', error);
            }
        });
    });
}