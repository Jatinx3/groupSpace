"use client";

import { useState } from "react";
import { createClientSupabase } from "../../../lib/supabase-client";

export default function ChangePasswordSection() {
  const supabase = createClientSupabase();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordChange = async () => {
    setError(null);
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-8 max-w-2xl space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">
        Change Password
      </h2>

      <div>
        <label className="text-sm font-medium text-slate-700">
          New Password
        </label>
        <input
          type="password"
          className="mt-2 w-full p-3 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">
          Confirm Password
        </label>
        <input
          type="password"
          className="mt-2 w-full p-3 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      {error && (
        <div className="text-sm text-red-500">{error}</div>
      )}

      {success && (
        <div className="text-sm text-green-600">
          Password updated successfully.
        </div>
      )}

      <button
        onClick={handlePasswordChange}
        disabled={loading}
        className="bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition"
      >
        {loading ? "Updating..." : "Update Password"}
      </button>
    </div>
  );
}