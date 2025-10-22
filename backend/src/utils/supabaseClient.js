const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '❌ Missing Supabase environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)'
  );
  // In a real app, you might want to exit or handle this more gracefully
  // For now, we'll allow it to fail on first use.
}

// The service_role key has super admin rights and should only be used on the server.
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
