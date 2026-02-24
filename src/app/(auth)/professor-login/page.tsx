"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClientSupabase } from "../../../lib/supabase-client";

export default function ProfessorLoginPage() {
  const router = useRouter();
  const supabase = createClientSupabase();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("All fields are required.");
      return;
    }

    if (!email.endsWith("@mytudublin.ie") && !email.endsWith("@test.com")) {
      setError("Only @mytudublin.ie and @test.com emails are allowed.");
      return;
    }

    setLoading(true);

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) {
      console.log("Supabase login error (professor):", loginError);
      setError(loginError.message);
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Authentication failed.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "professor") {
      await supabase.auth.signOut();
      setError("Access denied. Professor account required.");
      setLoading(false);
      return;
    }

    router.push("/professor");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white text-xl">
            👨‍🏫
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-center text-slate-900">
          Professor login
        </h1>
        <p className="text-sm text-slate-500 text-center mt-2 mb-8">
          Sign in to your thesis and course dashboard
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700">
              University Email *
            </label>
            <input
              type="email"
              className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane.smith@mytudublin.ie"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Password *
            </label>
            <input
              type="password"
              className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>

            <a
              href="#"
              className="text-slate-900 font-medium hover:underline"
            >
              Forgot password?
            </a>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white p-3 rounded-lg hover:bg-slate-800 transition font-medium"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-sm text-center text-slate-500 mt-4">
            Are you a student?{" "}
            <a
              href="/login"
              className="text-slate-900 font-medium hover:underline"
            >
              Log in here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

