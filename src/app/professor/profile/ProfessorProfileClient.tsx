"use client";

import { useState, useRef } from "react";
import { Mail, ShieldCheck, Lock, Camera, BookOpen } from "lucide-react";
import { createClientSupabase } from "../../../lib/supabase-client";

interface Profile {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  avatar_url?: string | null;
}

type Tab = "profile" | "security";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-3 text-base font-semibold text-slate-900">
      <span className="w-1 h-5 bg-slate-900 rounded-full shrink-0" />
      {children}
    </h2>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
      {children}
    </p>
  );
}

function UnderlineInput({
  value,
  onChange,
  type = "text",
  disabled = false,
  placeholder = "",
}: {
  value: string;
  onChange?: (v: string) => void;
  type?: string;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      className={`w-full bg-transparent border-b py-2 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none transition-colors ${
        disabled
          ? "border-slate-100 text-slate-400 cursor-not-allowed"
          : "border-slate-200 focus:border-slate-900"
      }`}
    />
  );
}

export default function ProfessorProfileClient({ profile }: { profile: Profile }) {
  const supabase = createClientSupabase();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const [firstName, setFirstName] = useState(profile.first_name || "");
  const [lastName, setLastName] = useState(profile.last_name || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [avatarLoading, setAvatarLoading] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const filePath = `${user.id}-${Date.now()}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
    if (uploadError) { setAvatarLoading(false); return; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    setAvatarUrl(data.publicUrl);
    await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", user.id);
    setAvatarLoading(false);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMsg(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const { error } = await supabase.from("profiles").update({ first_name: firstName, last_name: lastName, phone }).eq("id", user.id);
    setSaving(false);
    setSaveMsg(error ? { type: "error", text: error.message } : { type: "success", text: "Profile saved successfully." });
    setTimeout(() => setSaveMsg(null), 3000);
  };

  const handleSavePassword = async () => {
    setPwMsg(null);
    if (!newPassword) { setPwMsg({ type: "error", text: "Enter a new password." }); return; }
    if (newPassword !== confirmPassword) { setPwMsg({ type: "error", text: "Passwords do not match." }); return; }
    if (newPassword.length < 6) { setPwMsg({ type: "error", text: "Password must be at least 6 characters." }); return; }
    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwSaving(false);
    if (error) { setPwMsg({ type: "error", text: error.message }); return; }
    setPwMsg({ type: "success", text: "Password updated successfully." });
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPwMsg(null), 3000);
  };

  const handleSaveAll = () => {
    if (activeTab === "profile") handleSaveProfile();
    else handleSavePassword();
  };

  const initials = (firstName.charAt(0) || profile.first_name?.charAt(0) || "P").toUpperCase();

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "profile", label: "Profile", icon: <BookOpen className="w-3.5 h-3.5" /> },
    { key: "security", label: "Security", icon: <Lock className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-0">
      {/* Hero Header */}
      <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
        <div className="relative shrink-0">
          <div
            onClick={handleAvatarClick}
            className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center cursor-pointer group relative"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-white">{initials}</span>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
              {avatarLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900">
              {firstName} {lastName}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-1 border border-slate-300 text-slate-600 rounded-md">
              Professor
            </span>
          </div>
          <div className="flex items-center gap-4 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1.5 text-sm text-slate-500">
              <Mail className="w-3.5 h-3.5" />
              {profile.email}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Verified
            </span>
          </div>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving || pwSaving}
          className="shrink-0 flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition disabled:opacity-60"
        >
          {saving || pwSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : null}
          Save All
        </button>
      </div>

      {/* Save message */}
      {saveMsg && (
        <div className={`text-xs px-4 py-2 rounded-lg ${saveMsg.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
          {saveMsg.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-100">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-1 py-3 mr-8 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pt-8 space-y-10">

        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <SectionHeading>Personal Information</SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
              <div>
                <FieldLabel>First Name</FieldLabel>
                <UnderlineInput value={firstName} onChange={setFirstName} />
              </div>
              <div>
                <FieldLabel>Last Name</FieldLabel>
                <UnderlineInput value={lastName} onChange={setLastName} />
              </div>
              <div>
                <FieldLabel>Email Address</FieldLabel>
                <UnderlineInput value={profile.email} disabled />
              </div>
              <div>
                <FieldLabel>Phone Number</FieldLabel>
                <UnderlineInput value={phone} onChange={setPhone} placeholder="+1 555 000 0000" />
              </div>
            </div>
          </div>
        )}

        {/* ── SECURITY TAB ── */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <SectionHeading>Change Password</SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
              <div>
                <FieldLabel>New Password</FieldLabel>
                <UnderlineInput type="password" value={newPassword} onChange={setNewPassword} placeholder="Enter new password" />
              </div>
              <div>
                <FieldLabel>Confirm Password</FieldLabel>
                <UnderlineInput type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Confirm new password" />
              </div>
            </div>

            {pwMsg && (
              <p className={`text-xs ${pwMsg.type === "success" ? "text-emerald-600" : "text-red-500"}`}>
                {pwMsg.text}
              </p>
            )}

            <button
              onClick={handleSavePassword}
              disabled={pwSaving}
              className="flex items-center gap-2 border border-slate-200 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-slate-50 transition disabled:opacity-60"
            >
              <Lock className="w-3.5 h-3.5" />
              {pwSaving ? "Updating..." : "Update Password"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
