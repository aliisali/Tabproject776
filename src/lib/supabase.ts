import { createClient } from '@supabase/supabase-js';

// Auto-configured Supabase connection
const supabaseUrl = 'https://jyrndorchtglkmabncim.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5cm5kb3JjaHRnbGttYWJuY2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MTI2MDQsImV4cCI6MjA3NDM4ODYwNH0.w_86LzY-LduLH517CSP4fLKEIgFDPnDnKjGXCluHCIE';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Auto-setup database with demo data
const setupDatabase = async () => {
  try {
    console.log('🔄 Auto-configuring database...');
    
    // Check if data exists
    const { data: existingUsers, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('⚠️ Database not ready, using localStorage fallback');
      return;
    }
    
    if (!existingUsers || existingUsers.length === 0) {
      console.log('📝 Setting up demo data...');
      
      // Run the setup SQL
      const { error: setupError } = await supabase.rpc('setup_demo_data');
      
      if (setupError) {
        console.log('⚠️ Demo data setup failed, using localStorage');
      } else {
        console.log('✅ Demo data configured successfully');
      }
    } else {
      console.log('✅ Database already configured');
    }
  } catch (err) {
    console.log('⚠️ Auto-setup failed, using localStorage fallback');
  }
};

// Auto-setup on module load
setupDatabase();