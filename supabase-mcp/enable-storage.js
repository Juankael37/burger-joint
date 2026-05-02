const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://epbzzntbppyyxeisuvtr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwYnp6bnRicHB5eXhlaXN1dnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjY2MzIsImV4cCI6MjA5MzI0MjYzMn0.w8GcCOAOIhi7Yx7Rhc8i8qszemDI6i0An9qSlTUye2Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function enableStorageAccess() {
  // We need to disable RLS on storage.objects or add proper policies
  // Let's check current policies first
  
  console.log('Checking storage policies...');
  
  // First, let's try to insert a policy via SQL
  const policies = [
    // Allow all operations on menu-images bucket
    {
      name: 'Allow public upload',
      sql: `
        CREATE POLICY "Allow public upload" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'menu-images');
      `
    },
    {
      name: 'Allow public select',
      sql: `
        CREATE POLICY "Allow public select" ON storage.objects
        FOR SELECT USING (bucket_id = 'menu-images');
      `
    },
    {
      name: 'Allow public update',
      sql: `
        CREATE POLICY "Allow public update" ON storage.objects
        FOR UPDATE USING (bucket_id = 'menu-images');
      `
    },
    {
      name: 'Allow public delete',
      sql: `
        CREATE POLICY "Allow public delete" ON storage.objects
        FOR DELETE USING (bucket_id = 'menu-images');
      `
    }
  ];
  
  // Try adding policies via the REST API
  for (const policy of policies) {
    console.log('Adding policy:', policy.name);
    try {
      // Use the pg_policies system
      const { error } = await supabase.rpc('pg_catalog', { 
        sql: policy.sql 
      });
      
      // That won't work - need to use raw SQL
      console.log('Note: Policies need to be added manually in Supabase dashboard');
    } catch (e) {
      console.log('Could not add via API');
    }
  }
  
  console.log('\n=== FIX REQUIRED ===');
  console.log('Go to: Supabase → Storage → menu-images → Policies');
  console.log('Add these 4 policies (SELECT, INSERT, UPDATE, DELETE) with:');
  console.log('- For: storage.objects');
  console.log('- USING expression: bucket_id = \'menu-images\'');
  console.log('- WITH CHECK: bucket_id = \'menu-images\'');
}

enableStorageAccess();