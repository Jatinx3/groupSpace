"use client";

import { useState, FormEvent, useEffect } from "react";
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

  // Render Turnstile after script loads
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
      console.error("Turnstile site key missing.");
      return;
    }

    if (window.turnstile) {
      window.turnstile.render("#turnstile-container", {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
        callback: (token: string) => {
          setCaptchaToken(token);
        },
      });
    }
  }, []);

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !phone
    ) {
      setError("All fields are required.");
      return;
    }

    if (!email.endsWith("@mytudublin.ie")) {
      setError("Only @mytudublin.ie emails allowed.");
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
      email,
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
        email,
        role: "student",
        phone: `${countryCode}${phone}`,
      });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    router.push("/student/");
    router.refresh();
  };

  return (
    <>
      {/* Load Turnstile script properly */}
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
      />

      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-8">

          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white text-xl">
              🎓
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-center text-slate-900">
            Create your student account
          </h1>

          <p className="text-sm text-slate-500 text-center mt-2 mb-8">
            Sign up to access your university portal
          </p>

          <form onSubmit={handleSignup} className="space-y-5">

            {/* Name Row */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                className="p-3 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Last Name"
                className="p-3 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            {/* Phone */}
            <div className="flex gap-3">
              <select
                className="p-3 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
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
                className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Email */}
            <input
              type="email"
              placeholder="University Email"
              className="p-3 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* Password */}
            <input
              type="password"
              placeholder="Password"
              className="p-3 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* Confirm Password */}
            <input
              type="password"
              placeholder="Retype Password"
              className="p-3 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none w-full"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {/* Turnstile */}
            <div id="turnstile-container" />

            {/* Error */}
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
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <p className="text-sm text-center text-slate-500 mt-4">
              Already have an account?{" "}
              <a href="/login" className="text-slate-900 font-medium hover:underline">
                Log in
              </a>
            </p>

          </form>
        </div>
      </div>
    </>
  );
}