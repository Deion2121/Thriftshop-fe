import { csrfHeaders } from "../../utils/apiSecurity";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const reviewService = {
  getProductReviews: async (productId) => {
    const res = await fetch(`${API_URL}/api/reviews/product/${productId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to fetch reviews");
    }
    return res.json();
  },

  create: async (productId, data) => {
    const res = await fetch(`${API_URL}/api/reviews/product/${productId}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...csrfHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to submit review");
    }
    return res.json();
  },

  delete: async (productId, reviewId) => {
    const res = await fetch(`${API_URL}/api/reviews/product/${productId}/review/${reviewId}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to delete review");
    }
    return res.json();
  },
};
