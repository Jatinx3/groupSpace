"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClientSupabase } from "../../../lib/supabase-client";
import Logo from "../../../components/ui/Logo";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClientSupabase();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setValidSession(true);
      }
      setChecking(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setValidSession(true);
      }
      setChecking(false);
    });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push("/login");
    }, 3000);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-black/10 p-8 shadow-sm text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Verifying link...</p>
        </div>
      </div>
    );
  }

  if (!validSession) {
    return (
      <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-black/10 p-8 shadow-sm">
          <div className="flex justify-center mb-6">
            <Logo size="lg" showText={true} align="center" />
          </div>
          <h1 className="text-3xl font-black text-center tracking-tight uppercase text-black mb-4">
            Invalid Link
          </h1>
          <p className="text-xs text-neutral-500 text-center mb-6 tracking-[0.14em]">
            This password reset link is invalid or has expired.
          </p>
          <a
            href="/forgot-password"
            className="block w-full text-center bg-black text-white p-3 rounded-lg text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors"
          >
            Request New Link
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-black/10 p-8 shadow-sm">
        <div className="flex justify-center mb-6">
          <Logo size="lg" showText={true} align="center" />
        </div>

        <h1 className="text-3xl font-black text-center tracking-tight uppercase text-black">
          New Password
        </h1>
        <p className="text-xs text-neutral-500 text-center mt-3 mb-8 tracking-[0.18em] uppercase">
          Choose a new password for your account
        </p>

        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 text-xs p-4 rounded-lg text-center">
            <p className="font-bold uppercase tracking-[0.16em] mb-1">Password updated</p>
            <p>Your password has been changed. Redirecting to sign in...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-600">
                New Password
              </label>
              <input
                type="password"
                className="mt-2 w-full p-3 border border-black/10 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-600">
                Confirm Password
              </label>
              <input
                type="password"
                className="mt-2 w-full p-3 border border-black/10 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white p-3 rounded-lg text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
