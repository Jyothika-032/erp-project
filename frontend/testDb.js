import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ahvhbkioncgrfklwpqos.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFodmhia2lvbmNncmZrbHdwcW9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzOTA0ODQsImV4cCI6MjA5MTk2NjQ4NH0.bXzS1fPEZMWjhpqZ4VsN83BuNp2Ji10Y2kBScNF9mTc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('placement_records').select('*').limit(5);
  if (error) console.log("Error:", error.message);
  else console.log("Data:", JSON.stringify(data, null, 2));
}

check();
