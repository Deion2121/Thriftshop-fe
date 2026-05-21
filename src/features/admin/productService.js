import { csrfHeaders } from "../../utils/apiSecurity";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const PRODUCTS_API_URL = `${API_BASE}/api/products`;

const normalizeProduct = (product = {}) => ({
  ...product,
  image: product.image || product.image_url || "",
});

const authHeaders = () => {
  return {
    "Content-Type": "application/json",
    ...csrfHeaders(),
  };
};

export const productService = {
  // Add a new product
  addProduct: async (productData) => {
    const res = await fetch(PRODUCTS_API_URL, {
      method: "POST",
      headers: authHeaders(),
      credentials: "include",
      body: JSON.stringify(productData),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to add product");
    }

    return res.json();
  },

  // Delete a product
  deleteProduct: async (productId) => {
    const res = await fetch(`${PRODUCTS_API_URL}/${productId}`, {
      method: "DELETE",
      headers: authHeaders(),
      credentials: "include",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to delete product");
    }

    return normalizeProduct(await res.json());
  },

  // Update a product
  updateProduct: async (productId, productData) => {
    const res = await fetch(`${PRODUCTS_API_URL}/${productId}`, {
      method: "PUT",
      headers: authHeaders(),
      credentials: "include",
      body: JSON.stringify(productData),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to update product");
    }

    return normalizeProduct(await res.json());
  },

  // Get all products
  getProducts: async () => {
    const res = await fetch(PRODUCTS_API_URL, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to fetch products");
    }

    const data = await res.json();
    return Array.isArray(data) ? data.map(normalizeProduct) : [];
  },
};

export default productService;
