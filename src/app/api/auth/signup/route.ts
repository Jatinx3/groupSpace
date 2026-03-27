import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase, createAdminSupabase } from "../../../../lib/supabase-server";
import { isApprovedEmail, getAllowedDomainsLabel } from "../../../../lib/auth-domains";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, phone, countryCode, captchaToken } = body;

    // ── 1. Input completeness check ───────────────────────────────────────
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ── 2. Domain enforcement (server-side, bypass-proof) ────────────────
    if (!isApprovedEmail(normalizedEmail)) {
      return NextResponse.json(
        {
          error: `Only university email addresses are accepted (${getAllowedDomainsLabel()}).`,
          code: "DOMAIN_NOT_ALLOWED",
        },
        { status: 403 }
      );
    }

    // ── 3. Password length ────────────────────────────────────────────────
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    // ── 4. Create user (triggering automated confirmation email) ────────
    // We use a server-side client with the ANON key to trigger the
    // normal Supabase signup flow. This is the only reliable way to
    // get Supabase's built-in mailer to send the "Confirm your email" message.
    const supabase = await createServerSupabase();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
        // captchaToken is handled by Supabase automatically if Turnstile is enabled in dashboard
      },
    });

    if (authError) {
      if (authError.message?.toLowerCase().includes("already registered")) {
        return NextResponse.json(
          { error: "An account with this email already exists.", code: "EMAIL_EXISTS" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Signup failed." }, { status: 500 });
    }

    // ── 5. Create profile row (using Admin client for bypass) ────────────
    const admin = createAdminSupabase();
    const { error: profileError } = await admin.from("profiles").upsert({
      id: authData.user.id,
      first_name: firstName,
      last_name: lastName,
      email: normalizedEmail,
      role: "student",
      phone: phone ? `${countryCode ?? ""}${phone}` : null,
    });

    return NextResponse.json({ ok: true, email: normalizedEmail });
  } catch (err: any) {
    console.error("Signup API error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
