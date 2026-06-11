import { csrfHeaders } from "../../utils/apiSecurity";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const wishlistService = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/api/wishlist`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to fetch wishlist");
    }
    return res.json();
  },

  add: async (productId) => {
    const res = await fetch(`${API_URL}/api/wishlist`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...csrfHeaders(),
      },
      body: JSON.stringify({ product_id: productId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || "Failed to add to wishlist");
    }
    return data;
  },

  remove: async (productId) => {
    const res = await fetch(`${API_URL}/api/wishlist/product/${productId}`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || "Failed to remove from wishlist");
    }
    return data;
  },

  clear: async () => {
    const res = await fetch(`${API_URL}/api/wishlist`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || "Failed to clear wishlist");
    }
    return data;
  },
};
