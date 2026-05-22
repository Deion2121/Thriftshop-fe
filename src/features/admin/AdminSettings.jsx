import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CreditCard,
  Globe2,
  Lock,
  PackageCheck,
  Receipt,
  Save,
  Store,
  Truck,
  UserCog,
} from "lucide-react";
import { settingsService } from "./settingsService";
import { useAuth } from "../auth/AuthContext";

const emptyPassword = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const setDeepValue = (source, path, value) => {
  const [group, key] = path.split(".");
  return {
    ...source,
    [group]: {
      ...source[group],
      [key]: value,
    },
  };
};

const SettingsPanel = () => {
  const { user, initSession } = useAuth();
  const [settings, setSettings] = useState(null);
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [passwords, setPasswords] = useState(emptyPassword);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    const loadSettings = async () => {
      try {
        setLoading(true);
        setErrors({});
        const data = await settingsService.getSettings();
        if (active) setSettings(data);
      } catch (err) {
        if (active) setErrors({ settings: err.message });
      } finally {
        if (active) setLoading(false);
      }
    };

    loadSettings();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setProfileEmail(user?.email || "");
  }, [user?.email]);

  const enabledPayments = useMemo(() => {
    if (!settings?.payments) return 0;
    return Object.values(settings.payments).filter(Boolean).length;
  }, [settings]);

  const updateSetting = (path, value) => {
    setSettings((prev) => setDeepValue(prev, path, value));
  };

  const validateSettings = () => {
    const nextErrors = {};

    if (!settings.store.name.trim()) nextErrors.storeName = "Store name is required.";
    if (!settings.store.email.trim()) nextErrors.storeEmail = "Store email is required.";
    if (settings.shipping.flatRate < 0) nextErrors.shipping = "Shipping rate cannot be negative.";
    if (settings.tax.rate < 0 || settings.tax.rate > 100) nextErrors.tax = "Tax rate must be between 0 and 100.";
    if (enabledPayments === 0) nextErrors.payments = "Enable at least one payment method.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    if (!validateSettings()) return;

    try {
      setSavingSettings(true);
      setNotice("");
      const saved = await settingsService.saveSettings(settings);
      setSettings(saved);
      setErrors({});
      setNotice("Settings saved.");
    } catch (err) {
      setErrors({ settings: err.message });
    } finally {
      setSavingSettings(false);
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();

    if (!profileEmail.trim()) {
      setErrors({ profile: "Admin email is required." });
      return;
    }

    try {
      setSavingProfile(true);
      setNotice("");
      await settingsService.updateProfile({ email: profileEmail });
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
      await settingsService.updatePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords(emptyPassword);
      setErrors({});
      setNotice("Password updated.");
    } catch (err) {
      setErrors({ password: err.message });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return <div className="border border-slate-200 bg-white p-8 text-sm font-bold text-slate-500">Loading settings...</div>;
  }

  if (!settings) {
    return <StatusMessage tone="error" message={errors.settings || "Settings are unavailable."} />;
  }

  return (
    <div className="space-y-6">
      {(notice || errors.settings) && (
        <StatusMessage tone={errors.settings ? "error" : "success"} message={errors.settings || notice} />
      )}

      <form onSubmit={saveSettings} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <SettingsSection icon={<Store size={18} />} title="Store Information">
            <TextInput label="Store Name" value={settings.store.name} onChange={(value) => updateSetting("store.name", value)} error={errors.storeName} />
            <TextInput label="Logo URL" type="url" value={settings.store.logo} onChange={(value) => updateSetting("store.logo", value)} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput label="Email" type="email" value={settings.store.email} onChange={(value) => updateSetting("store.email", value)} error={errors.storeEmail} />
              <TextInput label="Phone" value={settings.store.phone} onChange={(value) => updateSetting("store.phone", value)} />
            </div>
            <TextInput label="Address" value={settings.store.address} onChange={(value) => updateSetting("store.address", value)} />
          </SettingsSection>

          <SettingsSection icon={<Globe2 size={18} />} title="Currency And Language">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectInput label="Currency" value={settings.localization.currency} onChange={(value) => updateSetting("localization.currency", value)} options={["PHP", "USD", "EUR", "GBP", "JPY"]} />
              <SelectInput label="Language" value={settings.localization.language} onChange={(value) => updateSetting("localization.language", value)} options={[["en", "English"], ["fil", "Filipino"], ["es", "Spanish"], ["fr", "French"], ["ja", "Japanese"]]} />
            </div>
          </SettingsSection>

          <SettingsSection icon={<Truck size={18} />} title="Shipping">
            <ToggleRow label="Shipping Enabled" checked={settings.shipping.enabled} onChange={(value) => updateSetting("shipping.enabled", value)} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <TextInput label="Flat Rate" type="number" min="0" value={settings.shipping.flatRate} onChange={(value) => updateSetting("shipping.flatRate", Number(value))} error={errors.shipping} />
              <TextInput label="Free Over" type="number" min="0" value={settings.shipping.freeShippingThreshold} onChange={(value) => updateSetting("shipping.freeShippingThreshold", Number(value))} />
              <TextInput label="Process Days" type="number" min="0" value={settings.shipping.processingDays} onChange={(value) => updateSetting("shipping.processingDays", Number(value))} />
            </div>
          </SettingsSection>

          <SettingsSection icon={<Receipt size={18} />} title="Tax">
            <ToggleRow label="Tax Enabled" checked={settings.tax.enabled} onChange={(value) => updateSetting("tax.enabled", value)} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput label="Tax Rate %" type="number" min="0" max="100" value={settings.tax.rate} onChange={(value) => updateSetting("tax.rate", Number(value))} error={errors.tax} />
              <TextInput label="Tax ID" value={settings.tax.taxId} onChange={(value) => updateSetting("tax.taxId", value)} />
            </div>
          </SettingsSection>

          <SettingsSection icon={<CreditCard size={18} />} title="Payment Methods">
            {errors.payments && <InlineError message={errors.payments} />}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ToggleRow label="Cash On Delivery" checked={settings.payments.cashOnDelivery} onChange={(value) => updateSetting("payments.cashOnDelivery", value)} />
              <ToggleRow label="Card" checked={settings.payments.card} onChange={(value) => updateSetting("payments.card", value)} />
              <ToggleRow label="GCash" checked={settings.payments.gcash} onChange={(value) => updateSetting("payments.gcash", value)} />
              <ToggleRow label="Bank Transfer" checked={settings.payments.bankTransfer} onChange={(value) => updateSetting("payments.bankTransfer", value)} />
            </div>
          </SettingsSection>

          <SettingsSection icon={<PackageCheck size={18} />} title="Order Settings">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectInput label="Default Status" value={settings.orders.defaultStatus} onChange={(value) => updateSetting("orders.defaultStatus", value)} options={[["pending", "Pending"], ["confirmed", "Confirmed"]]} />
              <TextInput label="Low Stock Alert" type="number" min="0" value={settings.orders.lowStockThreshold} onChange={(value) => updateSetting("orders.lowStockThreshold", Number(value))} />
            </div>
            <ToggleRow label="Auto Confirm Orders" checked={settings.orders.autoConfirm} onChange={(value) => updateSetting("orders.autoConfirm", value)} />
            <ToggleRow label="Allow Cancellation" checked={settings.orders.allowCancellation} onChange={(value) => updateSetting("orders.allowCancellation", value)} />
          </SettingsSection>

          <SettingsSection icon={<Bell size={18} />} title="Notifications">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ToggleRow label="Order Emails" checked={settings.notifications.orderEmails} onChange={(value) => updateSetting("notifications.orderEmails", value)} />
              <ToggleRow label="Shipping Emails" checked={settings.notifications.shippingEmails} onChange={(value) => updateSetting("notifications.shippingEmails", value)} />
              <ToggleRow label="Low Stock Alerts" checked={settings.notifications.lowStockAlerts} onChange={(value) => updateSetting("notifications.lowStockAlerts", value)} />
              <ToggleRow label="Marketing Emails" checked={settings.notifications.marketingEmails} onChange={(value) => updateSetting("notifications.marketingEmails", value)} />
            </div>
          </SettingsSection>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={savingSettings} className="inline-flex h-11 items-center justify-center gap-2 bg-black px-5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-slate-800 disabled:opacity-60">
            <Save size={15} /> {savingSettings ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <form onSubmit={saveProfile}>
          <SettingsSection icon={<UserCog size={18} />} title="Admin Profile">
            {errors.profile && <InlineError message={errors.profile} />}
            <TextInput label="Admin Email" type="email" value={profileEmail} onChange={setProfileEmail} />
            <button type="submit" disabled={savingProfile} className="inline-flex h-11 items-center justify-center gap-2 border border-slate-200 px-5 text-xs font-black uppercase tracking-widest transition hover:border-black disabled:opacity-60">
              <Save size={15} /> {savingProfile ? "Saving..." : "Save Profile"}
            </button>
          </SettingsSection>
        </form>

        <form onSubmit={savePassword}>
          <SettingsSection icon={<Lock size={18} />} title="Password">
            {errors.password && <InlineError message={errors.password} />}
            <TextInput label="Current Password" type="password" value={passwords.currentPassword} onChange={(value) => setPasswords((prev) => ({ ...prev, currentPassword: value }))} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput label="New Password" type="password" value={passwords.newPassword} onChange={(value) => setPasswords((prev) => ({ ...prev, newPassword: value }))} />
              <TextInput label="Confirm Password" type="password" value={passwords.confirmPassword} onChange={(value) => setPasswords((prev) => ({ ...prev, confirmPassword: value }))} />
            </div>
            <button type="submit" disabled={savingPassword} className="inline-flex h-11 items-center justify-center gap-2 border border-slate-200 px-5 text-xs font-black uppercase tracking-widest transition hover:border-black disabled:opacity-60">
              <Save size={15} /> {savingPassword ? "Saving..." : "Update Password"}
            </button>
          </SettingsSection>
        </form>
      </div>
    </div>
  );
};

const SettingsSection = ({ icon, title, children }) => (
  <section className="border border-slate-200 bg-white p-5">
    <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
      <div className="flex h-10 w-10 items-center justify-center bg-slate-950 text-white">{icon}</div>
      <h2 className="text-sm font-black uppercase tracking-[0.2em]">{title}</h2>
    </div>
    <div className="space-y-4">{children}</div>
  </section>
);

const TextInput = ({ label, error, onChange, ...props }) => (
  <label className="block">
    <span className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</span>
    <input
      {...props}
      onChange={(event) => onChange(event.target.value)}
      className="mt-2 h-11 w-full border border-slate-200 px-3 text-sm outline-none transition focus:border-black"
    />
    {error && <InlineError message={error} />}
  </label>
);

const SelectInput = ({ label, options, value, onChange }) => (
  <label className="block">
    <span className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="mt-2 h-11 w-full border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-black"
    >
      {options.map((option) => {
        const value = Array.isArray(option) ? option[0] : option;
        const label = Array.isArray(option) ? option[1] : option;
        return <option key={value} value={value}>{label}</option>;
      })}
    </select>
  </label>
);

const ToggleRow = ({ label, checked, onChange }) => (
  <label className="flex min-h-11 items-center justify-between gap-4 border border-slate-100 px-3 py-2">
    <span className="text-xs font-black uppercase tracking-widest text-slate-600">{label}</span>
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className="h-5 w-5 accent-black"
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

export default SettingsPanel;
