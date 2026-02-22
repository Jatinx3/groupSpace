"use client";

import { useState, FormEvent, useEffect } from "react";
import { createClientSupabase } from "../../../lib/supabase-client";
import { useRouter } from "next/navigation";

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

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    document.body.appendChild(script);
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

    // Safe profile creation
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

    router.push("/student/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border">
        <h1 className="text-2xl font-semibold mb-6 text-center">
          Student Signup
        </h1>

        <form onSubmit={handleSignup} className="space-y-4">

          <input
            type="text"
            placeholder="First Name"
            className="w-full p-3 border rounded-lg"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Last Name"
            className="w-full p-3 border rounded-lg"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          {/* Phone */}
          <div className="flex gap-2">
            <select
              className="p-3 border rounded-lg"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
            >
              <option value="+353">🇮🇪 +353</option>
              <option value="+44">🇬🇧 +44</option>
              <option value="+91">🇮🇳 +91</option>
              <option value="+1">🇺🇸 +1</option>
            </select>

            <input
              type="tel"
              placeholder="Phone Number"
              className="flex-1 p-3 border rounded-lg"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <input
            type="email"
            placeholder="University Email"
            className="w-full p-3 border rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Retype Password"
            className="w-full p-3 border rounded-lg"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {/* CAPTCHA */}
          <div
            className="cf-turnstile"
            data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            data-callback={(token: string) => setCaptchaToken(token)}
          ></div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-3 rounded-lg hover:opacity-90 transition"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}