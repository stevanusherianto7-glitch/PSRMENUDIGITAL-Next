const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ugfpbkjuxrdgveyfbfks.supabase.co';
const supabaseKey = 'sb_publishable_goaDeAnsgkAQ1ZQM_lArBQ_LhC6vN-7';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking tables in the new Supabase project...");
  
  const tables = ['meja', 'inventory', 'transactions'];
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.error(`Table ${table} error:`, error.message);
      } else {
        console.log(`Table ${table} is present! Data sample size:`, data.length);
      }
    } catch (e) {
      console.error(`Table ${table} failed:`, e.message);
    }
  }
}

check();
