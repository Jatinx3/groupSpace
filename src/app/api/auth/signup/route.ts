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

    // ── 4. Create user via Admin API (email pre-confirmed, no verification needed) ────────
    // Domain restriction already enforces university emails server-side.
    // Email verification is temporarily disabled while collably.space builds
    // domain reputation. Re-enable by switching back to supabase.auth.signUp.
    const admin = createAdminSupabase();

    // Check if user already exists
    const { data: existingUsers } = await admin.auth.admin.listUsers();
    const alreadyExists = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === normalizedEmail
    );
    if (alreadyExists) {
      return NextResponse.json(
        { error: "An account with this email already exists.", code: "EMAIL_EXISTS" },
        { status: 409 }
      );
    }

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true, // Skip verification — domain restriction is the guard
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Signup failed." }, { status: 500 });
    }

    // ── 5. Create profile row ────────────────────────────────────────────
    const { error: profileError } = await admin.from("profiles").upsert({
      id: authData.user.id,
      first_name: firstName,
      last_name: lastName,
      email: normalizedEmail,
      role: "student",
      phone: phone ? `${countryCode ?? ""}${phone}` : null,
    });

    if (profileError) {
      // Clean up the auth user if profile creation fails
      await admin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: "Failed to create profile." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, email: normalizedEmail, verified: true });
  } catch (err: any) {
    console.error("Signup API error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
