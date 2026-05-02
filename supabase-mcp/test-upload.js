const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://epbzzntbppyyxeisuvtr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwYnp6bnRicHB5eXhlaXN1dnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjY2MzIsImV4cCI6MjA5MzI0MjYzMn0.w8GcCOAOIhi7Yx7Rhc8i8qszemDI6i0An9qSlTUye2Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadTest() {
  // Create a small test image (1x1 red pixel PNG)
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
  const buffer = Buffer.from(testImageBase64, 'base64');
  
  const fileName = `test-${Date.now()}.png`;
  const filePath = `menu/${fileName}`;
  
  console.log('Uploading to:', filePath);
  
  const { data, error } = await supabase.storage
    .from('menu-images')
    .upload(filePath, buffer, {
      contentType: 'image/png',
      upsert: false
    });
  
  if (error) {
    console.log('Upload error:', error.message);
    console.log('Error details:', error);
  } else {
    console.log('Upload success!');
    console.log('Path:', data.path);
    
    // Get public URL
    const { data: urlData } = supabase.storage.from('menu-images').getPublicUrl(filePath);
    console.log('Public URL:', urlData.publicUrl);
  }
}

uploadTest();