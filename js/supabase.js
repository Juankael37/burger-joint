const supabaseUrl = 'https://epbzzntbppyyxeisuvtr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwYnp6bnRicHB5eXhlaXN1dnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjY2MzIsImV4cCI6MjA5MzI0MjYzMn0.w8GcCOAOIhi7Yx7Rhc8i8qszemDI6i0An9qSlTUye2Y';

const supabaseClient = {
    async getBranches() {
        const response = await fetch(`${supabaseUrl}/rest/v1/branches?is_active=eq.true&order=name`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });
        return response.json();
    },

    async getMenuItems() {
        const response = await fetch(`${supabaseUrl}/rest/v1/menu_items?status=eq.published&order=category,created_at`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });
        return response.json();
    },

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
        const items = await response.json();
        
        if (!branchSlug) return items;
        
        return items.filter(item => {
            const unavailable = item.unavailable_at_branches || [];
            return !unavailable.includes(branchSlug);
        });
    },

    async getAllMenuItems() {
        const response = await fetch(`${supabaseUrl}/rest/v1/menu_items?order=category,created_at`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });
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
        return response.json();
    },

    async toggleItemAvailability(itemId, branchId, makeUnavailable) {
        const item = await this.getMenuItemById(itemId);
        if (!item) return null;
        
        let unavailable = item.unavailable_at_branches || [];
        
        if (makeUnavailable) {
            if (!unavailable.includes(branchId)) {
                unavailable.push(branchId);
            }
        } else {
            unavailable = unavailable.filter(id => id !== branchId);
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
        
        if (!response.ok) {
            const err = await response.text();
            console.error('Update failed:', err);
            throw new Error(err);
        }
        
        return response.json();
    },

    async getMenuItemById(id) {
        const response = await fetch(`${supabaseUrl}/rest/v1/menu_items?id=eq.${id}`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });
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
        return response;
    },

    async publishAll() {
        const response = await fetch(`${supabaseUrl}/rest/v1/menu_items`, {
            method: 'PATCH',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({ status: 'published' })
        });
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

        if (!response.ok) {
            throw new Error('Upload failed');
        }

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
        return response;
    }
};