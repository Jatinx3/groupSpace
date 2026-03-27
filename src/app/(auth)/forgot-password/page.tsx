"use client";

import { useState, FormEvent } from "react";
import { createClientSupabase } from "../../../lib/supabase-client";
import Logo from "../../../components/ui/Logo";

export default function ForgotPasswordPage() {
  const supabase = createClientSupabase();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Email is required.");
      return;
    }

    if (
      !normalizedEmail.endsWith("@mytudublin.ie") &&
      !normalizedEmail.endsWith("@test.com") &&
      !normalizedEmail.endsWith("@ijatin.dev")
    ) {
      setError("Only @mytudublin.ie, @test.com, and @ijatin.dev emails are allowed.");
      return;
    }

    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-black/10 p-8 shadow-sm">
        <div className="flex justify-center mb-6">
          <Logo size="lg" showText={true} align="center" />
        </div>

        <h1 className="text-3xl font-black text-center tracking-tight uppercase text-black">
          Reset Password
        </h1>
        <p className="text-xs text-neutral-500 text-center mt-3 mb-8 tracking-[0.18em] uppercase">
          Enter your email to receive a reset link
        </p>

        {success ? (
          <div className="space-y-5">
            <div className="bg-green-50 border border-green-200 text-green-700 text-xs p-4 rounded-lg text-center">
              <p className="font-bold uppercase tracking-[0.16em] mb-1">Check your inbox</p>
              <p>A password reset link has been sent to <span className="font-semibold">{email}</span>.</p>
            </div>
            <a
              href="/login"
              className="block w-full text-center bg-black text-white p-3 rounded-lg text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors"
            >
              Back to Sign In
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
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
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <p className="text-xs text-center text-neutral-600 mt-4">
              Remember your password?{" "}
              <a href="/login" className="font-semibold text-black hover:underline">
                Sign in
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
