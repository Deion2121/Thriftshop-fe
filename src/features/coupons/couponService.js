import { csrfHeaders } from "../../utils/apiSecurity";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const couponService = {
  validate: async (code, cartTotal) => {
    const res = await fetch(`${API_URL}/api/coupons/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code, cart_total: cartTotal }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { valid: false, message: data.message || "Invalid coupon" };
    }
    return data;
  },
};
