import { csrfHeaders } from "../../utils/apiSecurity";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const addressService = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/api/addresses`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to fetch addresses");
    return res.json();
  },

  create: async (data) => {
    const res = await fetch(`${API_URL}/api/addresses`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...csrfHeaders() },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to create address");
    }
    return res.json();
  },

  update: async (id, data) => {
    const res = await fetch(`${API_URL}/api/addresses/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...csrfHeaders() },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to update address");
    }
    return res.json();
  },

  delete: async (id) => {
    const res = await fetch(`${API_URL}/api/addresses/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to delete address");
    }
    return res.json();
  },

  setDefault: async (id) => {
    const res = await fetch(`${API_URL}/api/addresses/${id}/default`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to set default");
    }
    return res.json();
  },
};
