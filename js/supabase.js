const supabaseUrl = 'https://epbzzntbppyyxeisuvtr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwYnp6bnRicHB5eXhlaXN1dnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjY2MzIsImV4cCI6MjA5MzI0MjYzMn0.w8GcCOAOIhi7Yx7Rhc8i8qszemDI6i0An9qSlTUye2Y';

/**
 * Helper: validates fetch response and throws a descriptive error on failure.
 * Prevents silent failures where error JSON was mistakenly used as valid data.
 */
async function _handleResponse(response) {
    if (!response.ok) {
        const err = await response.text();
        console.error('Supabase API error:', response.status, err);
        throw new Error(`API error ${response.status}: ${err}`);
    }
    return response;
}

const supabaseClient = {
    async getBranches() {
        const response = await fetch(`${supabaseUrl}/rest/v1/branches?is_active=eq.true&order=name`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });
        await _handleResponse(response);
        return response.json();
    },

    async getAllBranches() {
        const response = await fetch(`${supabaseUrl}/rest/v1/branches?order=name`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });
        await _handleResponse(response);
        return response.json();
    },

    async getMenuItems() {
        const response = await fetch(`${supabaseUrl}/rest/v1/menu_items?status=eq.published&order=category,created_at`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });
        await _handleResponse(response);
        return response.json();
    },

    // Returns ALL published items — unavailable ones are kept so the order page
    // can show them grayed-out with a stamp instead of hiding them.
    async getMenuItemsForBranch(branchSlug) {
        const response = await fetch(
            `${supabaseUrl}/rest/v1/menu_items?status=eq.published&order=category,created_at`, 
            {
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`
                }
            }
        );
        await _handleResponse(response);
        return response.json();
    },

    async getAllMenuItems() {
        const response = await fetch(`${supabaseUrl}/rest/v1/menu_items?order=category,created_at`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });
        await _handleResponse(response);
        return response.json();
    },

    async addMenuItem(item) {
        const response = await fetch(`${supabaseUrl}/rest/v1/menu_items`, {
            method: 'POST',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(item)
        });
        await _handleResponse(response);
        return response.json();
    },

    async updateMenuItem(id, updates) {
        const response = await fetch(`${supabaseUrl}/rest/v1/menu_items?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(updates)
        });
        await _handleResponse(response);
        return response.json();
    },

    /**
     * Set item availability at a branch.
     * reason: 'available' | 'temp_unavailable' | 'sold_out'
     * Entries stored as "branchSlug:reason" in the unavailable_at_branches array.
     * Legacy plain slugs ("main") are treated as temp_unavailable.
     */
    async setItemAvailability(itemId, branchSlug, reason) {
        const item = await this.getMenuItemById(itemId);
        if (!item) return null;
        
        let unavailable = item.unavailable_at_branches || [];
        
        // Remove any existing entry for this branch (plain or encoded)
        unavailable = unavailable.filter(entry => {
            const entrySlug = entry.split(':')[0];
            return entrySlug !== branchSlug;
        });
        
        // Add encoded entry if not "available"
        if (reason && reason !== 'available') {
            unavailable.push(`${branchSlug}:${reason}`);
        }
        
        const response = await fetch(`${supabaseUrl}/rest/v1/menu_items?id=eq.${itemId}`, {
            method: 'PATCH',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({ unavailable_at_branches: unavailable })
        });
        
        await _handleResponse(response);
        return response.json();
    },

    async getMenuItemById(id) {
        const response = await fetch(`${supabaseUrl}/rest/v1/menu_items?id=eq.${id}`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });
        await _handleResponse(response);
        const items = await response.json();
        return items[0] || null;
    },

    async deleteMenuItem(id) {
        const response = await fetch(`${supabaseUrl}/rest/v1/menu_items?id=eq.${id}`, {
            method: 'DELETE',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });
        await _handleResponse(response);
        return response;
    },

    // Fixed: only publishes draft items instead of updating every row
    async publishAll() {
        const response = await fetch(`${supabaseUrl}/rest/v1/menu_items?status=eq.draft`, {
            method: 'PATCH',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({ status: 'published' })
        });
        await _handleResponse(response);
        return response.json();
    },

    async uploadImage(file) {
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `menu/${fileName}`;

        const response = await fetch(`${supabaseUrl}/storage/v1/object/menu-images/${filePath}`, {
            method: 'POST',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': file.type
            },
            body: file
        });

        await _handleResponse(response);
        return `${supabaseUrl}/storage/v1/object/public/menu-images/${filePath}`;
    },

    async addBranch(branch) {
        const response = await fetch(`${supabaseUrl}/rest/v1/branches`, {
            method: 'POST',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(branch)
        });
        await _handleResponse(response);
        return response.json();
    },

    async updateBranch(id, updates) {
        const response = await fetch(`${supabaseUrl}/rest/v1/branches?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(updates)
        });
        await _handleResponse(response);
        return response.json();
    },

    async deleteBranch(id) {
        const response = await fetch(`${supabaseUrl}/rest/v1/branches?id=eq.${id}`, {
            method: 'DELETE',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });
        await _handleResponse(response);
        return response;
    },

    // Order operations (used by checkout.html)
    async createOrder(orderData) {
        const response = await fetch(`${supabaseUrl}/rest/v1/orders`, {
            method: 'POST',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(orderData)
        });
        await _handleResponse(response);
        return response.json();
    },

    async getOrders() {
        const response = await fetch(`${supabaseUrl}/rest/v1/orders?order=created_at.desc`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });
        await _handleResponse(response);
        return response.json();
    },

    async updateOrderStatus(orderId, newStatus) {
        const response = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${orderId}`, {
            method: 'PATCH',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ status: newStatus })
        });
        await _handleResponse(response);
        return response;
    },

    async deleteOrder(orderId) {
        const response = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${orderId}`, {
            method: 'DELETE',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Prefer': 'return=minimal'
            }
        });
        await _handleResponse(response);
        return response;
    }
};