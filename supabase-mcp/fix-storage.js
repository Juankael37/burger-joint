const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://epbzzntbppyyxeisuvtr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwYnp6bnRicHB5eXhlaXN1dnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjY2MzIsImV4cCI6MjA5MzI0MjYzMn0.w8GcCOAOIhi7Yx7Rhc8i8qszemDI6i0An9qSlTUye2Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixStoragePolicies() {
  console.log('Testing storage access...');
  
  // Try to list files in menu-images bucket
  const { data, error } = await supabase.storage.from('menu-images').list('menu');
  
  if (error) {
    console.log('Storage error:', error.message);
    console.log('\nTo fix this, go to Supabase → Storage → menu-images → Policies');
    console.log('Add these policies for public access:');
    console.log('1. SELECT - Allow public read');
    console.log('2. INSERT - Allow public upload');
    console.log('3. UPDATE - Allow public update');
    console.log('4. DELETE - Allow public delete');
  } else {
    console.log('Storage working! Files:', data);
  }
  
  // Test database
  console.log('\nTesting database...');
  const { data: items, error: dbError } = await supabase.from('menu_items').select('*').limit(1);
  
  if (dbError) {
    console.log('Database error:', dbError.message);
  } else {
    console.log('Database working! Connected to menu_items table');
  }
}

fixStoragePolicies();