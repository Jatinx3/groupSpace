"use client";

import { useRouter } from "next/navigation";
import { createClientSupabase } from "../../lib/supabase-client";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClientSupabase();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
    >
      Logout
    </button>
  );
}
