/**
 * Big Buns Burger - Order System
 * Supabase-powered ordering for restaurant
 */

const supabaseUrl = 'https://epbzzntbppyyxeisuvtr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwYnp6bnRicHB5eXhlaXN1dnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjY2MzIsImV4cCI6MjA5MzI0MjYzMn0.w8GcCOAOIhi7Yx7Rhc8i8qszemDI6i0An9qSlTUye2Y';

const supabaseClient = {
    async createOrder(orderData) {
        const response = await fetch(`${supabaseUrl}/rest/v1/orders`, {
            method: 'POST',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                items: orderData.items,
                total: orderData.total,
                pickup_name: orderData.pickup_name,
                status: 'pending'
            })
        });
        return response.json();
    },

    async getPendingOrders() {
        const response = await fetch(`${supabaseUrl}/rest/v1/orders?status=eq.pending&order=created_at.desc&select=*`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });
        return response.json();
    },

    async getAllOrders() {
        const response = await fetch(`${supabaseUrl}/rest/v1/orders?order=created_at.desc&select=*`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });
        return response.json();
    },

    async updateOrderStatus(orderId, newStatus) {
        const response = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${orderId}`, {
            method: 'PATCH',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({ status: newStatus })
        });
        return response.json();
    },

    async deleteOldPendingOrders(hours = 12) {
        const response = await fetch(`${supabaseUrl}/rest/v1/orders?status=eq.pending&created_at=lt.${hours} hours ago`, {
            method: 'PATCH',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({ 
                deleted_at: new Date().toISOString(),
                status: 'cancelled'
            })
        });
        return response.json();
    }
};

// Cart management
let cart = JSON.parse(localStorage.getItem('bigBunsCart')) || [];

function addToCart(item) {
    const existingItem = cart.find(i => i.name === item.name);
    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ ...item, qty: 1 });
    }
    saveCart();
    updateCartUI();
}

function removeFromCart(itemName) {
    cart = cart.filter(i => i.name !== itemName);
    saveCart();
    updateCartUI();
}

function updateQuantity(itemName, delta) {
    const item = cart.find(i => i.name === itemName);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
            removeFromCart(itemName);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

function saveCart() {
    localStorage.setItem('bigBunsCart', JSON.stringify(cart));
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function getCartCount() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cartCount) cartCount.textContent = getCartCount();
    if (cartItems) cartItems.innerHTML = renderCartItems();
    if (cartTotal) cartTotal.textContent = '₱' + getCartTotal().toFixed(2);
}

function renderCartItems() {
    return cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <span class="cart-item-name">${item.name}</span>
                <span class="cart-item-price">₱${item.price.toFixed(2)}</span>
            </div>
            <div class="cart-item-controls">
                <button onclick="updateQuantity('${item.name}', -1)">-</button>
                <span>${item.qty}</span>
                <button onclick="updateQuantity('${item.name}', 1)">+</button>
                <button class="remove-btn" onclick="removeFromCart('${item.name}')">×</button>
            </div>
        </div>
    `).join('');
}

function clearCart() {
    cart = [];
    saveCart();
    updateCartUI();
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => updateCartUI());
} else {
    updateCartUI();
}

// Add item by ID (for order page)
async function addItemById(itemId) {
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/menu_items?id=eq.${itemId}&select=*`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });
        const items = await response.json();
        if (items && items.length > 0) {
            addToCart(items[0]);
            showToast('Added to cart!');
        }
    } catch (error) {
        console.error('Error adding item:', error);
    }
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#2E7D32;color:white;padding:12px 24px;border-radius:8px;z-index:9999;';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// Direct add function for onclick
window.addItemDirect = function(name, price) {
    addToCart({name: name, price: price});
    showToast('Added to cart!');
};