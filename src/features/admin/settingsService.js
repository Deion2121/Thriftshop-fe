import { csrfHeaders } from "../../utils/apiSecurity";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const parseResponse = async (res, fallbackMessage) => {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || data.error || fallbackMessage);
  }

  return data;
};

export const settingsService = {
  getSettings: async () => {
    const res = await fetch(`${API_BASE}/api/settings`, {
      credentials: "include",
    });

    return parseResponse(res, "Could not load settings.");
  },

  saveSettings: async (settings) => {
    const res = await fetch(`${API_BASE}/api/settings`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...csrfHeaders(),
      },
      body: JSON.stringify(settings),
    });

    return parseResponse(res, "Could not save settings.");
  },

  updateProfile: async ({ email }) => {
    const res = await fetch(`${API_BASE}/api/users/profile`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...csrfHeaders(),
      },
      body: JSON.stringify({ email }),
    });

    return parseResponse(res, "Could not update profile.");
  },

  updatePassword: async (passwords) => {
    const res = await fetch(`${API_BASE}/api/users/password`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...csrfHeaders(),
      },
      body: JSON.stringify(passwords),
    });

    return parseResponse(res, "Could not update password.");
  },

  getUsers: async () => {
    const res = await fetch(`${API_BASE}/api/users/users`, {
      credentials: "include",
    });

    return parseResponse(res, "Could not load users.");
  },

  updateUser: async (id, user) => {
    const res = await fetch(`${API_BASE}/api/users/users/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...csrfHeaders(),
      },
      body: JSON.stringify(user),
    });

    return parseResponse(res, "Could not update user.");
  },
};
