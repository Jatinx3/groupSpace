"use client";

import { useState, FormEvent } from "react";
import { createClientSupabase } from "../../../lib/supabase-client";
import { useRouter } from "next/navigation";
import Script from "next/script";

declare global {
  interface Window {
    turnstile: any;
  }
}

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClientSupabase();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+353");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const normalizedEmail = email.trim().toLowerCase();

    if (
      !firstName ||
      !lastName ||
      !normalizedEmail ||
      !password ||
      !confirmPassword ||
      !phone
    ) {
      setError("All fields are required.");
      return;
    }

    if (
      !normalizedEmail.endsWith("@mytudublin.ie") &&
      !normalizedEmail.endsWith("@test.com")
    ) {
      setError("Only @mytudublin.ie and @test.com emails allowed.");
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

    if (!captchaToken) {
      setError("Please complete the captcha.");
      return;
    }

    setLoading(true);

    const { data, error: signupError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        captchaToken,
      },
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError("Signup failed.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: data.user.id,
        first_name: firstName,
        last_name: lastName,
        email: normalizedEmail,
        role: "student",
        phone: `${countryCode}${phone}`,
      });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    await fetch("/api/enroll-defaults", { method: "POST" });

    router.push("/student/");
    router.refresh();
  };

  return (
    <>
      {/* Turnstile Script */}
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => {
          if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
            console.error("Missing Turnstile site key");
            return;
          }

          window.turnstile.render("#turnstile-container", {
            sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
            callback: (token: string) => {
              setCaptchaToken(token);
            },
          });
        }}
      />

      <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-black/10 p-8 shadow-sm">

          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white text-xs font-bold tracking-[0.2em] uppercase">
              GS
            </div>
          </div>

          <h1 className="text-3xl font-black text-center tracking-tight uppercase text-black">
            Create Account
          </h1>

          <p className="text-xs text-neutral-500 text-center mt-3 mb-8 tracking-[0.18em] uppercase">
            Join your university workspace in GroupSpace
          </p>

          <form onSubmit={handleSignup} className="space-y-5">

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                className="p-3 border border-black/10 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Last Name"
                className="p-3 border border-black/10 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <select
                className="p-3 border border-black/10 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
              >
                <option value="+353">+353</option>
                <option value="+44">+44</option>
                <option value="+91">+91</option>
                <option value="+1">+1</option>
              </select>

              <input
                type="tel"
                placeholder="Phone Number"
                className="flex-1 p-3 border border-black/10 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <input
              type="email"
              placeholder="University Email"
              className="p-3 border border-black/10 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="p-3 border border-black/10 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Retype Password"
              className="p-3 border border-black/10 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black w-full"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {/* Turnstile Container */}
            <div id="turnstile-container" />

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
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <p className="text-xs text-center text-neutral-600 mt-4">
              Already have an account?{" "}
              <a href="/login" className="font-semibold text-black hover:underline">
                Log in
              </a>
            </p>

          </form>
        </div>
      </div>
    </>
  );
}