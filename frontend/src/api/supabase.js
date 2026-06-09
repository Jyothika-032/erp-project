import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://ahvhbkioncgrfklwpqos.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFodmhia2lvbmNncmZrbHdwcW9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzOTA0ODQsImV4cCI6MjA5MTk2NjQ4NH0.bXzS1fPEZMWjhpqZ4VsN83BuNp2Ji10Y2kBScNF9mTc'
);
