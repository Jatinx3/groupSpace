"use client";

import { useState, useRef, useEffect } from "react";
import { Mail, ShieldCheck, Bell, Users, Moon, Globe, Lock, Smartphone, Camera } from "lucide-react";
import { useTheme } from "next-themes";
import { createClientSupabase } from "../../../lib/supabase-client";

interface Profile {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  avatar_url?: string | null;
}

type Tab = "profile" | "security" | "preferences";

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        checked ? "bg-gray-900 dark:bg-white" : "bg-gray-200 dark:bg-white/10"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-900 shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-3 text-base font-semibold text-gray-900 dark:text-white">
      <span className="w-1 h-5 bg-gray-900 dark:bg-white rounded-full shrink-0" />
      {children}
    </h2>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-1.5">
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
      className={`w-full bg-transparent border-b py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-zinc-600 focus:outline-none transition-colors ${
        disabled
          ? "border-gray-100 dark:border-white/5 text-gray-400 dark:text-zinc-600 cursor-not-allowed"
          : "border-gray-200 dark:border-white/10 focus:border-gray-900 dark:focus:border-white/40"
      }`}
    />
  );
}

export default function StudentProfileClient({ profile }: { profile: Profile }) {
  const supabase = createClientSupabase();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const [firstName, setFirstName] = useState(profile.first_name || "");
  const [lastName, setLastName] = useState(profile.last_name || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [avatarLoading, setAvatarLoading] = useState(false);

  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [twoFAApp, setTwoFAApp] = useState(false);
  const [twoFAEmail, setTwoFAEmail] = useState(false);
  const [twoFASms, setTwoFASms] = useState(false);

  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [teamUpdates, setTeamUpdates] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("en");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    const prefs = localStorage.getItem("gs_student_prefs");
    if (prefs) {
      try {
        const p = JSON.parse(prefs);
        if (p.studentId !== undefined) setStudentId(p.studentId);
        if (p.department !== undefined) setDepartment(p.department);
        if (p.year !== undefined) setYear(p.year);
        if (p.twoFAApp !== undefined) setTwoFAApp(p.twoFAApp);
        if (p.twoFAEmail !== undefined) setTwoFAEmail(p.twoFAEmail);
        if (p.twoFASms !== undefined) setTwoFASms(p.twoFASms);
        if (p.pushNotifs !== undefined) setPushNotifs(p.pushNotifs);
        if (p.emailNotifs !== undefined) setEmailNotifs(p.emailNotifs);
        if (p.teamUpdates !== undefined) setTeamUpdates(p.teamUpdates);
        if (p.darkMode !== undefined) setDarkMode(p.darkMode);
        if (p.language !== undefined) setLanguage(p.language);
      } catch {}
    }
  }, []);

  const savePrefs = (patch: Record<string, unknown>) => {
    const existing = localStorage.getItem("gs_student_prefs");
    const current = existing ? JSON.parse(existing) : {};
    localStorage.setItem("gs_student_prefs", JSON.stringify({ ...current, ...patch }));
  };

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
    savePrefs({ studentId, department, year });
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

  const handleSavePreferences = () => {
    savePrefs({ pushNotifs, emailNotifs, teamUpdates, darkMode, language });
    setSaveMsg({ type: "success", text: "Preferences saved." });
    setTimeout(() => setSaveMsg(null), 2000);
  };

  const handleSaveAll = () => {
    if (activeTab === "profile") handleSaveProfile();
    else if (activeTab === "security") handleSavePassword();
    else handleSavePreferences();
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "profile", label: "Profile" },
    { key: "security", label: "Security" },
    { key: "preferences", label: "Preferences" },
  ];

  const initials = (firstName.charAt(0) || profile.first_name?.charAt(0) || "U").toUpperCase();

  return (
    <div className="space-y-0">
      {/* Hero Header */}
      <div className="flex items-center gap-6 pb-6 border-b border-gray-100 dark:border-white/5">
        <div className="relative shrink-0">
          <div
            onClick={handleAvatarClick}
            className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-900 dark:bg-white flex items-center justify-center cursor-pointer group relative"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-white dark:text-gray-900">{initials}</span>
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {firstName} {lastName}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-1 border border-gray-300 dark:border-white/20 text-gray-600 dark:text-zinc-400 rounded-md">
              Student
            </span>
          </div>
          <div className="flex items-center gap-4 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-zinc-500">
              <Mail className="w-3.5 h-3.5" />
              {profile.email}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-zinc-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              Verified
            </span>
          </div>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving || pwSaving}
          className="shrink-0 flex items-center gap-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 text-sm font-semibold px-5 py-2.5 rounded-xl transition disabled:opacity-60"
        >
          {saving || pwSaving ? (
            <div className="w-4 h-4 border-2 border-white dark:border-gray-900 border-t-transparent rounded-full animate-spin" />
          ) : null}
          Save All
        </button>
      </div>

      {/* Save message */}
      {saveMsg && (
        <div className={`text-xs px-4 py-2 rounded-lg mt-4 ${saveMsg.type === "success" ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"}`}>
          {saveMsg.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-100 dark:border-white/5 mt-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-1 py-3 mr-8 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? "border-gray-900 dark:border-white text-gray-900 dark:text-white"
                : "border-transparent text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300"
            }`}
          >
            {tab.key === "profile" && <span className="text-base">👤</span>}
            {tab.key === "security" && <Lock className="w-3.5 h-3.5" />}
            {tab.key === "preferences" && <span className="text-base">⚙️</span>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pt-8 space-y-10">

        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && (
          <>
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

            <div className="space-y-6">
              <SectionHeading>Academic Details</SectionHeading>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-12 gap-y-6">
                <div>
                  <FieldLabel>Student ID</FieldLabel>
                  <UnderlineInput value={studentId} onChange={setStudentId} placeholder="STU-2024-0000" />
                </div>
                <div>
                  <FieldLabel>Department</FieldLabel>
                  <UnderlineInput value={department} onChange={setDepartment} placeholder="Computer Science" />
                </div>
                <div>
                  <FieldLabel>Year</FieldLabel>
                  <UnderlineInput value={year} onChange={setYear} placeholder="3rd Year" />
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── SECURITY TAB ── */}
        {activeTab === "security" && (
          <>
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
                <p className={`text-xs ${pwMsg.type === "success" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                  {pwMsg.text}
                </p>
              )}

              <button
                onClick={handleSavePassword}
                disabled={pwSaving}
                className="flex items-center gap-2 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-zinc-300 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition disabled:opacity-60"
              >
                <Lock className="w-3.5 h-3.5" />
                {pwSaving ? "Updating..." : "Update Password"}
              </button>
            </div>

            <div className="space-y-4">
              <SectionHeading>Two-Factor Authentication</SectionHeading>

              {[
                {
                  icon: <Smartphone className="w-4 h-4 text-gray-500 dark:text-zinc-400" />,
                  label: "Authenticator App",
                  desc: "Use an app to generate codes",
                  value: twoFAApp,
                  set: (v: boolean) => { setTwoFAApp(v); savePrefs({ twoFAApp: v }); },
                },
                {
                  icon: <Mail className="w-4 h-4 text-gray-500 dark:text-zinc-400" />,
                  label: "Email Verification",
                  desc: "Receive codes via email",
                  value: twoFAEmail,
                  set: (v: boolean) => { setTwoFAEmail(v); savePrefs({ twoFAEmail: v }); },
                },
                {
                  icon: <Smartphone className="w-4 h-4 text-gray-500 dark:text-zinc-400" />,
                  label: "SMS Verification",
                  desc: "Receive codes via SMS",
                  value: twoFASms,
                  set: (v: boolean) => { setTwoFASms(v); savePrefs({ twoFASms: v }); },
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center">{item.icon}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{item.label}</p>
                      <p className="text-xs text-gray-400 dark:text-zinc-500">{item.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 dark:text-zinc-500">{item.value ? "Enabled" : "Disabled"}</span>
                    <Toggle checked={item.value} onChange={item.set} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── PREFERENCES TAB ── */}
        {activeTab === "preferences" && (
          <>
            <div className="space-y-4">
              <SectionHeading>Notifications</SectionHeading>

              {[
                {
                  icon: <Bell className="w-4 h-4 text-gray-500 dark:text-zinc-400" />,
                  label: "Push Notifications",
                  desc: "Receive notifications on your device",
                  value: pushNotifs,
                  set: (v: boolean) => { setPushNotifs(v); savePrefs({ pushNotifs: v }); },
                },
                {
                  icon: <Mail className="w-4 h-4 text-gray-500 dark:text-zinc-400" />,
                  label: "Email Notifications",
                  desc: "Get updates via email",
                  value: emailNotifs,
                  set: (v: boolean) => { setEmailNotifs(v); savePrefs({ emailNotifs: v }); },
                },
                {
                  icon: <Users className="w-4 h-4 text-gray-500 dark:text-zinc-400" />,
                  label: "Team Updates",
                  desc: "Notifications about team activity",
                  value: teamUpdates,
                  set: (v: boolean) => { setTeamUpdates(v); savePrefs({ teamUpdates: v }); },
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center">{item.icon}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{item.label}</p>
                      <p className="text-xs text-gray-400 dark:text-zinc-500">{item.desc}</p>
                    </div>
                  </div>
                  <Toggle checked={item.value} onChange={item.set} />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <SectionHeading>Display</SectionHeading>

              <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center">
                    <Moon className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">Dark Mode</p>
                    <p className="text-xs text-gray-400 dark:text-zinc-500">Toggle dark theme</p>
                  </div>
                </div>
                <Toggle 
                  checked={mounted ? theme === "dark" : false} 
                  onChange={(v) => { 
                    const newTheme = v ? "dark" : "light";
                    setTheme(newTheme);
                    setDarkMode(v); 
                    savePrefs({ darkMode: v }); 
                  }} 
                />
              </div>

              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">Language</p>
                    <p className="text-xs text-gray-400 dark:text-zinc-500">Set your preferred language</p>
                  </div>
                </div>
                <select
                  value={language}
                  onChange={(e) => { setLanguage(e.target.value); savePrefs({ language: e.target.value }); }}
                  className="text-sm text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 bg-white dark:bg-[#0A0A0A] focus:outline-none focus:border-gray-900 dark:focus:border-white/30 cursor-pointer"
                >
                  <option value="en">English (US)</option>
                  <option value="en-gb">English (UK)</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="es">Español</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
