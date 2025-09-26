import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jyrndorchtglkmabncim.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5cm5kb3JjaHRnbGttYWJuY2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjcyOTU5NzQsImV4cCI6MjA0Mjg3MTk3NH0.VQzNpHJrOLtHQNVXkOcYJKqx8wOQGxZQJQzNpHJrOLt';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection with better error handling
const testConnection = async () => {
  try {
    console.log('🔄 Testing Supabase connection...');
    console.log('📍 URL:', supabaseUrl);
    console.log('🔑 Key configured:', !!supabaseKey);
    
    const { data, error } = await supabase.from('users').select('id').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    } else {
      console.log('✅ Supabase connection successful');
      console.log('📊 Test query returned:', data);
    }
  } catch (err) {
    console.error('❌ Connection test error:', err);
  }
};

// Run test on module load
testConnection();