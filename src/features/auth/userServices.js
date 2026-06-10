import { csrfHeaders } from "../../utils/apiSecurity";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const userService = {
  getCurrentUser: async () => {
    const res = await fetch(`${API_URL}/api/users/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.status === 401 || res.status === 403) return null;

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to fetch current user");
    }

    return res.json();
  },

  logout: async () => {
    await fetch(`${API_URL}/api/users/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        ...csrfHeaders(),
      },
    });
  },
};
