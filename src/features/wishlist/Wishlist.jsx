import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag, ArrowLeft, Heart } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { wishlistService } from "./wishlistService";
import { csrfHeaders } from "../../utils/apiSecurity";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Wishlist = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser) return;
    loadWishlist();
  }, [currentUser]);

  const loadWishlist = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await wishlistService.getAll();
      setItems(data);
    } catch (err) {
      setError(err.message || "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await wishlistService.remove(productId);
      setItems((prev) => prev.filter((item) => item.product_id !== productId));
    } catch (err) {
      setError(err.message || "Failed to remove item");
    }
  };

  const moveToCart = (item) => {
    const product = {
      id: item.product_id,
      name: item.name,
      brand: item.brand,
      category: item.category,
      subCategory: item.subCategory,
      price: item.price,
      img: item.image_url || "",
      title: item.name,
      sizes: item.sizes || [],
    };

    const existing = JSON.parse(localStorage.getItem("tab_cart") || "[]");
    const exists = existing.find((p) => String(p?.id || p?.title) === String(item.product_id));
    if (!exists) {
      existing.push({
        ...product,
        variants: [{ image: item.image_url || "", colorName: "Default", colorHex: "#111111" }],
        selectedVariant: { image: item.image_url || "", colorName: "Default", colorHex: "#111111" },
        quantity: 1,
      });
      localStorage.setItem("tab_cart", JSON.stringify(existing));
      window.dispatchEvent(new Event("cartUpdated"));
    }

    removeFromWishlist(item.product_id);
  };

  if (!currentUser) {
    navigate("/login", { replace: true });
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:px-8 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 transition hover:text-black dark:text-zinc-400 dark:hover:text-white"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Heart size={24} className="text-red-500" />
            <h1 className="text-3xl font-black uppercase tracking-tight">My Wishlist</h1>
          </div>
          <p className="mt-2 text-sm text-slate-500">{items.length} items saved</p>
        </div>

        {error && <p className="mb-6 text-sm text-red-600">{error}</p>}

        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart size={48} className="mb-4 text-gray-300" />
            <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Your wishlist is empty</p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-4 inline-flex items-center gap-2 bg-black px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-slate-800"
            >
              <ShoppingBag size={14} /> Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <div key={item.id} className="border border-slate-200 bg-white p-4 transition hover:shadow-lg dark:border-white/10 dark:bg-zinc-900">
                <div className="relative aspect-square bg-slate-100 dark:bg-zinc-800 mb-4">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="h-full w-full object-contain" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ShoppingBag size={32} className="text-gray-300" />
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-black uppercase tracking-tight line-clamp-1">{item.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{item.brand}</p>
                <p className="mt-2 text-sm font-black italic">PHP {Number(item.price).toLocaleString()}</p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => moveToCart(item)}
                    className="flex-1 bg-black px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-slate-800"
                  >
                    Add to Cart
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(item.product_id)}
                    className="border border-slate-200 p-2 transition hover:border-red-500 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Wishlist;
