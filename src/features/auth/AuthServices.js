import { csrfHeaders } from "../../utils/apiSecurity";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const syncCsrfToken = (data) => {
  if (!data || typeof data !== "object") return;
  const token = data.csrfToken;
  if (typeof token === "string" && token.trim().length > 0) {
    localStorage.setItem("csrfToken", token.trim());
  }
};

const request = async (endpoint, options = {}) => {
  const res = await fetch(`${API_URL}/api/users${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...csrfHeaders(),
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
    const data = await request("/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    syncCsrfToken(data);
    return data;
  },

  login: async ({ email, password }) => {
    const data = await request("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    syncCsrfToken(data);
    return data;
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

  sendOtp: async (email) => {
    return request("/send-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  verifyOtp: async (email, otp) => {
    return request("/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    });
  },
};

export const otpService = {
  sendOtp: async (email) => {
    const res = await fetch(`${API_URL}/api/users/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.message || "Failed to send OTP");
    return data;
  },

  registerWithOtp: async (email, password, otp) => {
    const res = await fetch(`${API_URL}/api/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password, otp }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.message || "Registration failed");
    return data;
  },
};
