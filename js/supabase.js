const supabaseUrl = 'https://epbzzntbppyyxeisuvtr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwYnp6bnRicHB5eXhlaXN1dnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjY2MzIsImV4cCI6MjA5MzI0MjYzMn0.w8GcCOAOIhi7Yx7Rhc8i8qszemDI6i0An9qSlTUye2Y';

const supabaseClient = {
    async getMenuItems() {
        const response = await fetch(`${supabaseUrl}/rest/v1/menu_items?status=eq.published&order=category,created_at`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });
        return response.json();
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
    }
};