const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://epbzzntbppyyxeisuvtr.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwYnp6bnRicHB5eXhlaXN1dnRyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY2NjYzMiwiZXhwIjoyMDkzMjQyNjMyfQ.W4R0xJ0b2Y0Y2Z2Z2Z2Z2Z2Z2Z2Z2Z2Z2Z2Z2Z2Z2Z2Z2Z2Z2Z2Z2Z2Z2';

const supabase = createClient(supabaseUrl, serviceKey);

async function addPolicies() {
  console.log('Adding storage policies...');
  
  const sql = `
    -- Allow public access to menu-images bucket
    DROP POLICY IF EXISTS "Allow public upload" ON storage.objects;
    DROP POLICY IF EXISTS "Allow public select" ON storage.objects;
    DROP POLICY IF EXISTS "Allow public update" ON storage.objects;
    DROP POLICY IF EXISTS "Allow public delete" ON storage.objects;
    
    CREATE POLICY "Allow public upload" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'menu-images');
    
    CREATE POLICY "Allow public select" ON storage.objects
    FOR SELECT USING (bucket_id = 'menu-images');
    
    CREATE POLICY "Allow public update" ON storage.objects
    FOR UPDATE USING (bucket_id = 'menu-images');
    
    CREATE POLICY "Allow public delete" ON storage.objects
    FOR DELETE USING (bucket_id = 'menu-images');
  `;
  
  // Execute via REST API
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ query: sql })
  });
  
  if (response.ok) {
    console.log('Policies added successfully!');
    
    // Test upload
    const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==', 'base64');
    const { data, error } = await supabase.storage
      .from('menu-images')
      .upload(`menu/test-${Date.now()}.png`, buffer, { contentType: 'image/png' });
    
    if (error) {
      console.log('Still got error:', error.message);
    } else {
      console.log('Upload works! Path:', data.path);
    }
  } else {
    console.log('Failed to add policies:', response.status, await response.text());
  }
}

addPolicies();