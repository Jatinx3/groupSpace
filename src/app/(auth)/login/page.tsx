"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientSupabase } from "../../../lib/supabase-client";
import Logo from "../../../components/ui/Logo";
import { isApprovedEmail, getAllowedDomainsLabel } from "../../../lib/auth-domains";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justSignedUp = searchParams.get("welcome") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const supabase = createClientSupabase(remember);
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("All fields are required.");
      return;
    }

    if (!isApprovedEmail(normalizedEmail)) {
      setError(`Only university emails are accepted (${getAllowedDomainsLabel()}).`);
      return;
    }

    setLoading(true);

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

   if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Authentication failed.");
      setLoading(false);
      return;
    }


    // Check role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "student") {
      await supabase.auth.signOut();
      setError("Access denied. Student account required.");
      setLoading(false);
      return;
    }

    router.push("/student/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-black/10 p-8 shadow-sm">
        <div className="flex justify-center mb-6">
          <Logo size="lg" showText={true} align="center" />
        </div>

        <h1 className="text-3xl font-black text-center tracking-tight uppercase text-black">
          Student Sign In
        </h1>
        <p className="text-xs text-neutral-500 text-center mt-3 mb-8 tracking-[0.18em] uppercase">
          Access your Collably workspace
        </p>

        {/* Welcome Banner from Signup */}
        {justSignedUp && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-xs p-3 rounded-lg mb-4 text-center">
            ✅ Account created! Sign in to access your workspace.
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-600">
              University Email
            </label>
            <input
              type="email"
              className="mt-2 w-full p-3 border border-black/10 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john.doe@mytudublin.ie"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-600">
              Password
            </label>
            <input
              type="password"
              className="mt-2 w-full p-3 border border-black/10 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-neutral-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span className="uppercase tracking-[0.16em]">
                Remember me
              </span>
            </label>

            <a
              href="/forgot-password"
              className="font-medium uppercase tracking-[0.16em] text-black hover:underline"
            >
              Forgot password?
            </a>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-3.5 rounded-lg text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
            ) : (
              "Sign In"
            )}
          </button>

          <div className="space-y-1 text-xs text-center text-neutral-600 mt-4">
            <p>
              Don’t have an account?{" "}
              <a
                href="/signup"
                className="font-semibold text-black hover:underline"
              >
                Sign up
              </a>
            </p>
            <p>
              Are you a professor?{" "}
              <a
                href="/professor-login"
                className="font-semibold text-black hover:underline"
              >
                Log in here
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}