"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Logo from "../../../components/ui/Logo";
import { isApprovedEmail, getAllowedDomainsLabel } from "../../../lib/auth-domains";
import { Mail, Eye, EyeOff, CheckCircle, ArrowRight, Loader2 } from "lucide-react";

declare global {
  interface Window {
    turnstile: any;
  }
}

type Stage = "form" | "verify";

const inputClass =
  "w-full p-3 border border-black/10 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black transition placeholder:text-neutral-400";

const labelClass = "block text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500 mb-1.5";

export default function SignupPage() {
  const router = useRouter();

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+353");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<Stage>("form");
  const [verifiedEmail, setVerifiedEmail] = useState("");

  // Real-time domain hint
  const emailLower = email.trim().toLowerCase();
  const isDomainInvalid =
    emailLower.includes("@") && !isApprovedEmail(emailLower);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!firstName.trim()) errs.firstName = "Required";
    if (!lastName.trim()) errs.lastName = "Required";

    if (!email.trim()) {
      errs.email = "Required";
    } else if (!isApprovedEmail(emailLower)) {
      errs.email = `Must be a university email (${getAllowedDomainsLabel()})`;
    }

    if (!password) {
      errs.password = "Required";
    } else if (password.length < 8) {
      errs.password = "Min. 8 characters";
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords don't match";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !captchaToken) {
      setError("Please complete the security check.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailLower,
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim() || null,
          countryCode,
          captchaToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "EMAIL_EXISTS") {
          setFieldErrors((prev) => ({
            ...prev,
            email: "An account with this email already exists.",
          }));
        } else {
          setError(data.error || "Signup failed. Please try again.");
        }
        setLoading(false);
        return;
      }

      // Success — redirect straight to login, account is ready
      router.push("/login?welcome=1");
    } catch {
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Verification success screen ───────────────────────────────────────
  if (stage === "verify") {
    return (
      <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-black/10 p-10 shadow-sm text-center">
          <div className="flex justify-center mb-8">
            <Logo size="lg" showText={true} align="center" />
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center">
              <Mail className="w-7 h-7 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-black uppercase tracking-tight text-black mb-3">
            Check your inbox
          </h1>

          <p className="text-sm text-neutral-500 mb-2 leading-relaxed">
            We sent a verification link to
          </p>
          <p className="text-sm font-bold text-black mb-6 font-mono">
            {verifiedEmail}
          </p>

          <div className="bg-neutral-50 border border-black/5 rounded-xl p-4 text-left mb-8 space-y-2">
            {[
              "Open your university email",
              "Click the verification link",
              "You'll be redirected to your dashboard",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-xs text-neutral-600">{step}</p>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-neutral-400 uppercase tracking-[0.18em]">
            Didn't receive an email?{" "}
            <button
              className="text-black font-bold underline underline-offset-2 hover:opacity-70 transition"
              onClick={() => setStage("form")}
            >
              Try again
            </button>
          </p>
        </div>
      </div>
    );
  }

  // ── Signup form ───────────────────────────────────────────────────────
  return (
    <>
      {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={() => {
            window.turnstile.render("#turnstile-container", {
              sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
              callback: (token: string) => setCaptchaToken(token),
            });
          }}
        />
      )}

      <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl border border-black/10 p-8 shadow-sm">
          <div className="flex justify-center mb-6">
            <Logo size="lg" showText={true} align="center" />
          </div>

          <h1 className="text-3xl font-black text-center tracking-tight uppercase text-black">
            Create Account
          </h1>
          <p className="text-[10px] text-neutral-400 text-center mt-2 mb-8 tracking-[0.2em] uppercase">
            Sign up using your university email
          </p>

          <form onSubmit={handleSignup} className="space-y-4" noValidate>

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>First Name</label>
                <input
                  type="text"
                  placeholder="Jane"
                  className={`${inputClass} ${fieldErrors.firstName ? "border-red-400 ring-1 ring-red-400" : ""}`}
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, firstName: "" }));
                  }}
                  autoComplete="given-name"
                />
                {fieldErrors.firstName && (
                  <p className="text-[10px] text-red-500 mt-1">{fieldErrors.firstName}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>Last Name</label>
                <input
                  type="text"
                  placeholder="Smith"
                  className={`${inputClass} ${fieldErrors.lastName ? "border-red-400 ring-1 ring-red-400" : ""}`}
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, lastName: "" }));
                  }}
                  autoComplete="family-name"
                />
                {fieldErrors.lastName && (
                  <p className="text-[10px] text-red-500 mt-1">{fieldErrors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>University Email</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="jane.smith@mytudublin.ie"
                  className={`${inputClass} pr-9 ${
                    fieldErrors.email
                      ? "border-red-400 ring-1 ring-red-400"
                      : !isDomainInvalid && emailLower.includes("@")
                      ? "border-emerald-400 ring-1 ring-emerald-400"
                      : ""
                  }`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  autoComplete="email"
                />
                {!isDomainInvalid && emailLower.includes("@") && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                )}
              </div>
              {fieldErrors.email && (
                <p className="text-[10px] text-red-500 mt-1">{fieldErrors.email}</p>
              )}
              {isDomainInvalid && !fieldErrors.email && (
                <p className="text-[10px] text-amber-600 mt-1">
                  Only {getAllowedDomainsLabel()} emails are accepted
                </p>
              )}
            </div>

            {/* Phone (optional) */}
            <div>
              <label className={labelClass}>Phone <span className="text-neutral-300 font-normal normal-case tracking-normal">(optional)</span></label>
              <div className="flex gap-2">
                <select
                  className="p-3 border border-black/10 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black text-neutral-600 shrink-0"
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
                  placeholder="Phone number"
                  className={`${inputClass} flex-1`}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className={labelClass}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  className={`${inputClass} pr-10 ${fieldErrors.password ? "border-red-400 ring-1 ring-red-400" : ""}`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength indicator */}
              {password && (
                <div className="flex gap-1 mt-2">
                  {[8, 12, 16].map((len, i) => (
                    <div
                      key={i}
                      className={`h-0.5 flex-1 rounded-full transition-colors ${
                        password.length >= len
                          ? i === 0
                            ? "bg-red-400"
                            : i === 1
                            ? "bg-amber-400"
                            : "bg-emerald-500"
                          : "bg-neutral-200"
                      }`}
                    />
                  ))}
                </div>
              )}
              {fieldErrors.password && (
                <p className="text-[10px] text-red-500 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className={labelClass}>Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Repeat password"
                className={`${inputClass} ${fieldErrors.confirmPassword ? "border-red-400 ring-1 ring-red-400" : ""}`}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
                }}
                autoComplete="new-password"
              />
              {fieldErrors.confirmPassword && (
                <p className="text-[10px] text-red-500 mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Turnstile */}
            {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
              <div id="turnstile-container" />
            )}

            {/* Global error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white p-3.5 rounded-lg text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-neutral-400 uppercase tracking-[0.16em] mt-1">
              Already have an account?{" "}
              <a href="/login" className="font-bold text-black hover:underline">
                Sign in
              </a>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}