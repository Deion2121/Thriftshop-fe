import React, { useEffect, useState } from "react";
import { ArrowLeft, Lock, Save, UserCog } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { csrfHeaders } from "../../utils/apiSecurity";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const emptyPassword = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const parseResponse = async (res, fallbackMessage) => {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || data.error || fallbackMessage);
  }

  return data;
};

const AccountSettings = () => {
  const navigate = useNavigate();
  const { user, initSession } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [passwords, setPasswords] = useState(emptyPassword);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user) navigate("/login", { replace: true });
  }, [navigate, user]);

  useEffect(() => {
    setEmail(user?.email || "");
  }, [user?.email]);

  const saveProfile = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setErrors({ profile: "Email is required." });
      return;
    }

    try {
      setSavingProfile(true);
      setNotice("");
      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...csrfHeaders(),
        },
        body: JSON.stringify({ email }),
      });

      await parseResponse(res, "Could not update profile.");
      await initSession();
      setErrors({});
      setNotice("Profile updated.");
    } catch (err) {
      setErrors({ profile: err.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      setErrors({ password: "New passwords do not match." });
      return;
    }

    if (passwords.newPassword.length < 8) {
      setErrors({ password: "New password must be at least 8 characters." });
      return;
    }

    try {
      setSavingPassword(true);
      setNotice("");
      const res = await fetch(`${API_BASE}/api/users/password`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...csrfHeaders(),
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });

      await parseResponse(res, "Could not update password.");
      setPasswords(emptyPassword);
      setErrors({});
      setNotice("Password updated.");
    } catch (err) {
      setErrors({ password: err.message });
    } finally {
      setSavingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 md:px-8 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 transition hover:text-black dark:text-zinc-400 dark:hover:text-white"
        >
          <ArrowLeft size={14} /> Back to shop
        </button>

        <div className="mb-6 border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Account</p>
          <h1 className="mt-2 text-3xl font-black uppercase tracking-tight">Profile Settings</h1>
          <p className="mt-2 text-sm text-slate-500">{user.email}</p>
        </div>

        {(notice || errors.page) && (
          <StatusMessage tone={errors.page ? "error" : "success"} message={errors.page || notice} />
        )}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <form onSubmit={saveProfile}>
            <SettingsSection icon={<UserCog size={18} />} title="Profile">
              {errors.profile && <InlineError message={errors.profile} />}
              <TextInput label="Email" type="email" value={email} onChange={setEmail} />
              <button type="submit" disabled={savingProfile} className="inline-flex h-11 items-center justify-center gap-2 bg-black px-5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-slate-800 disabled:opacity-60">
                <Save size={15} /> {savingProfile ? "Saving..." : "Save Profile"}
              </button>
            </SettingsSection>
          </form>

          <form onSubmit={savePassword}>
            <SettingsSection icon={<Lock size={18} />} title="Password">
              {errors.password && <InlineError message={errors.password} />}
              <TextInput label="Current Password" type="password" value={passwords.currentPassword} onChange={(value) => setPasswords((prev) => ({ ...prev, currentPassword: value }))} />
              <TextInput label="New Password" type="password" value={passwords.newPassword} onChange={(value) => setPasswords((prev) => ({ ...prev, newPassword: value }))} />
              <TextInput label="Confirm Password" type="password" value={passwords.confirmPassword} onChange={(value) => setPasswords((prev) => ({ ...prev, confirmPassword: value }))} />
              <button type="submit" disabled={savingPassword} className="inline-flex h-11 items-center justify-center gap-2 border border-slate-200 px-5 text-xs font-black uppercase tracking-widest transition hover:border-black disabled:opacity-60">
                <Save size={15} /> {savingPassword ? "Saving..." : "Update Password"}
              </button>
            </SettingsSection>
          </form>
        </div>
      </div>
    </main>
  );
};

const SettingsSection = ({ icon, title, children }) => (
  <section className="border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
    <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-white/10">
      <div className="flex h-10 w-10 items-center justify-center bg-slate-950 text-white">{icon}</div>
      <h2 className="text-sm font-black uppercase tracking-[0.2em]">{title}</h2>
    </div>
    <div className="space-y-4">{children}</div>
  </section>
);

const TextInput = ({ label, onChange, ...props }) => (
  <label className="block">
    <span className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</span>
    <input
      {...props}
      onChange={(event) => onChange(event.target.value)}
      className="mt-2 h-11 w-full border border-slate-200 px-3 text-sm outline-none transition focus:border-black dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-white"
    />
  </label>
);

const InlineError = ({ message }) => (
  <p className="mt-2 text-xs font-bold text-red-600">{message}</p>
);

const StatusMessage = ({ tone, message }) => (
  <div className={`border px-4 py-3 text-sm font-medium ${
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700"
  }`}>
    {message}
  </div>
);

export default AccountSettings;
