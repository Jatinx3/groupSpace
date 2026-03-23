import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Read all thesis projects
const { data, error } = await supabase
  .from("thesis_projects")
  .select("id, student_id, supervisor_id, title");

console.log(JSON.stringify(data, null, 2));
if (error) console.error(error);
