const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const request = async (endpoint, options = {}) => {
  const res = await fetch(`${API_URL}/api/users${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
};

export const authService = {
  register: async ({ email, password }) => {
    return request("/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  login: async ({ email, password }) => {
    return request("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  getCurrentUser: async () => {
    return request("/me", {
      method: "GET",
    });
  },

  logout: async () => {
    return request("/logout", {
      method: "POST",
    });
  },
};
