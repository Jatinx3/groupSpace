"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createClientSupabase() {
  console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
