import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ahvhbkioncgrfklwpqos.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFodmhia2lvbmNncmZrbHdwcW9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzOTA0ODQsImV4cCI6MjA5MTk2NjQ4NH0.bXzS1fPEZMWjhpqZ4VsN83BuNp2Ji10Y2kBScNF9mTc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function explore() {
  console.log("Checking tables...");
  
  const tables = ['students', 'institution', 'placement_records', 'courses', 'batches'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Table [${table}]: Error - ${error.message}`);
    } else {
      console.log(`Table [${table}]: Success. Found ${data.length} records sample.`);
      if (data.length > 0) {
        console.log(`Sample columns: ${Object.keys(data[0]).join(', ')}`);
      }
    }
  }
}

explore();
