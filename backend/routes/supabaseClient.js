const { createClient } = require('@supabase/supabase-js');

// Ensure environment variables are loaded and available.
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error('Supabase URL and Key must be defined in .env file');
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = supabase;
