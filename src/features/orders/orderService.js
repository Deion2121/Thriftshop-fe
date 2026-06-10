import { csrfHeaders } from "../../utils/apiSecurity";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const orderService = {
  // Create a new order
  createOrder: async (orderData) => {
    const res = await fetch(`${API_URL}/api/orders/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...csrfHeaders(),
      },
      body: JSON.stringify(orderData),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to create order");
    }

    return res.json();
  },

  // Get all orders for the current user
  getUserOrders: async (userId) => {
    const res = await fetch(`${API_URL}/api/orders/${userId}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to fetch orders");
    }

    return res.json();
  },

  // Get all orders for admin monitoring
  getAllOrders: async () => {
    const res = await fetch(`${API_URL}/api/orders/admin/all`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to fetch orders");
    }

    return res.json();
  },

  // Track an order by order number (public, no auth required)
  trackOrderByNumber: async (orderNumber) => {
    const res = await fetch(`${API_URL}/api/orders/track/${orderNumber}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Order not found");
    }

    return res.json();
  },

  // Update order status
  updateOrderStatus: async (orderNumber, status, notes) => {
    const res = await fetch(`${API_URL}/api/orders/${orderNumber}/status`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...csrfHeaders(),
      },
      body: JSON.stringify({ status, notes }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to update order status");
    }

    return res.json();
  },
};
