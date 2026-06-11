import { csrfHeaders } from "../../utils/apiSecurity";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const parseResponse = async (res, fallbackMessage) => {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || data.error || fallbackMessage);
  }

  return data;
};

export const suggestionService = {
  submitSuggestion: async (suggestionData) => {
    const res = await fetch(`${API_BASE}/api/suggestions`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...csrfHeaders(),
      },
      body: JSON.stringify(suggestionData),
    });

    return parseResponse(res, "Could not submit suggestion.");
  },
};