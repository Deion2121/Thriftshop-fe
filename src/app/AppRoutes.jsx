import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Route, Routes } from "react-router-dom";

import AdminDashboard from "../features/admin/AdminDashboard";
import Login from "../features/auth/Login";
import Register from "../features/auth/Register";
import Ecommerce from "../features/home/Ecommerce";
import Loader from "../components/ui/Loader";
import Header from "../components/layout/Header";
import Hero from "../features/home/Hero";
import LogoSlider from "../features/home/LogoSlider";
import Footer from "../components/layout/Footer";
import ProductGrid from "../features/products/ProductGrid";
import FilterSidebar from "../features/products/FilterSidebar";
import CartModal from "../features/cart/CartModal";
import OrderTrackingModal from "../features/orders/OrderTrackingModal";
import { useAuth } from "../features/auth/AuthContext";
import { fallbackProducts, groupProductsForFrontend } from "../utils/productImages";
import AdminRoute from "./AdminRoutes";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/products`;

const defaultFilters = {
  brand: "All",
  category: "All",
  subCategory: "All",
  size: null,
  shoeSize: null,
  sort: "Newest",
};

const normalize = (value) => String(value || "").trim().toLowerCase();
const productKey = (product) => String(product?.id ?? product?.title ?? "");
const cartItemKey = (product) => {
  const productName = normalize(product?.title || product?.name);
  return productName;
};
const shopChips = ["Men", "Women", "Shoes", "Sale"];

const readStoredList = (key) => {
  try {
    const stored = JSON.parse(localStorage.getItem(key));
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

const mergeVariants = (currentVariants = [], incomingVariants = [], selectedVariant) => {
  const variantsByName = new Map();

  [...currentVariants, ...incomingVariants, selectedVariant]
    .filter(Boolean)
    .forEach((variant) => {
      const key = normalize(variant.colorName || variant.color || "Default");
      if (!variantsByName.has(key)) variantsByName.set(key, variant);
    });

  return [...variantsByName.values()];
};

const compressCartItems = (items) =>
  items.reduce((merged, item) => {
    const key = cartItemKey(item);
    const existingIndex = merged.findIndex((mergedItem) => cartItemKey(mergedItem) === key);
    const quantity = Number(item.quantity || 1);

    if (existingIndex >= 0) {
      const next = [...merged];
      next[existingIndex] = {
        ...next[existingIndex],
        variants: mergeVariants(
          next[existingIndex].variants,
          item.variants,
          item.selectedVariant
        ),
        selectedVariant: item.selectedVariant || next[existingIndex].selectedVariant,
        quantity: Math.min(20, Number(next[existingIndex].quantity || 1) + quantity),
      };
      return next;
    }

    const selectedVariant =
      item.selectedVariant ||
      item.variants?.[0] || { image: item.img, colorName: "Default", colorHex: "#111111" };

    return [
      ...merged,
      {
        ...item,
        variants: mergeVariants(item.variants, [], selectedVariant),
        selectedVariant,
        quantity: Math.min(20, Math.max(1, quantity)),
      },
    ];
  }, [])
    .sort((a, b) => cartItemKey(a).localeCompare(cartItemKey(b)));

function AppRoutes() {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState(() => compressCartItems(readStoredList("cartItems")));
  const [wishlistItems, setWishlistItems] = useState(() => readStoredList("wishlistItems"));
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isShopView, setIsShopView] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [filters, setFilters] = useState(defaultFilters);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackedOrderNumber, setTrackedOrderNumber] = useState(() => localStorage.getItem("recentOrderNumber"));

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      setProductsError("");
      const res = await fetch(API_URL, { credentials: "include" });
      const data = await res.json().catch(() => []);

      if (!res.ok) {
        throw new Error(data?.message || "Could not load products.");
      }

      const formatted = Array.isArray(data) ? groupProductsForFrontend(data) : [];
      setAllProducts(formatted);
    } catch (err) {
      console.warn("Using fallback products because the API is unavailable:", err.message);
      setProductsError("");
      setAllProducts(fallbackProducts);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const arrangedCartItems = compressCartItems(cartItems);
    const currentCart = JSON.stringify(cartItems);
    const nextCart = JSON.stringify(arrangedCartItems);

    if (currentCart !== nextCart) {
      setCartItems(arrangedCartItems);
      return;
    }

    localStorage.setItem("cartItems", nextCart);
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("wishlistItems", JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const filteredProducts = useMemo(() => {
    const query = normalize(searchTerm);

    return allProducts.filter((product) => {
      const searchable = [
        product.title,
        product.brand,
        product.category,
        product.subCategory,
      ].map(normalize);

      const searchMatch = !query || searchable.some((value) => value.includes(query));
      const brandMatch = filters.brand === "All" || normalize(product.brand) === normalize(filters.brand);
      const categoryMatch = filters.category === "All" || normalize(product.category) === normalize(filters.category);
      const subMatch = filters.subCategory === "All" || normalize(product.subCategory) === normalize(filters.subCategory);
      const sizeMatch = !filters.size || product.sizes?.map(normalize).includes(normalize(filters.size));
      const shoeSizeMatch = !filters.shoeSize || product.shoeSizes?.map(normalize).includes(normalize(filters.shoeSize));

      return searchMatch && brandMatch && categoryMatch && subMatch && sizeMatch && shoeSizeMatch;
    });
  }, [allProducts, filters, searchTerm]);

  const resetFilters = () => setFilters(defaultFilters);

  const handleSearch = (query) => {
    setSearchTerm(query);
    setIsShopView(true);
  };

  const openShop = (brand = "All", category = "All", subCategory = "All") => {
    setFilters({
      ...defaultFilters,
      brand: brand || "All",
      category: category || "All",
      subCategory: subCategory || "All",
    });
    setSearchTerm("");
    setIsShopView(true);
  };

  const goHome = () => {
    setIsShopView(false);
    setSearchTerm("");
    resetFilters();
  };

  const refreshPage = () => {
    window.location.href = "/";
  };

  const addToCart = (product) => {
    setCartItems((prev) => compressCartItems([...prev, { ...product, quantity: 1 }]));

    setCartModalOpen(true);
  };

  const toggleWishlist = (product) => {
    setWishlistItems((prev) => {
      const key = productKey(product);
      const exists = prev.some((item) => productKey(item) === key);
      return exists ? prev.filter((item) => productKey(item) !== key) : [...prev, product];
    });
  };

  const clearShop = () => {
    resetFilters();
    setSearchTerm("");
  };

  const handleOrderCreated = (orderNumber) => {
    if (!orderNumber) return;
    setTrackedOrderNumber(orderNumber);
    localStorage.setItem("recentOrderNumber", orderNumber);
  };

  const ShopLayout = () => (
    <>
       <Header
         cartItems={cartItems}
         wishlistCount={wishlistItems.length}
         openCartModal={() => setCartModalOpen(true)}
         openShop={openShop}
         handleSearch={handleSearch}
         refreshPage={refreshPage}
         openTrackingModal={() => setTrackingModalOpen(true)}
       />

      <div className="grow relative">
        {!isShopView ? (
          <>
            <Hero openShop={openShop} />
            <Ecommerce addToCart={addToCart} filters={filters} openShop={openShop} />
            <LogoSlider />
          </>
        ) : (
          <main className="bg-white pb-20 pt-28">
            <div className="max-w-[1400px] mx-auto px-4 md:px-10">
              <button
                type="button"
                onClick={goHome}
                className="mb-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-gray-500"
              >
                <ArrowLeft size={14} /> Back to Home
              </button>

              <div className="relative overflow-hidden bg-black px-5 py-8 text-white md:px-8 md:py-10">
                <div className="absolute right-0 top-0 hidden h-full w-1/2 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.24),transparent_32%)] md:block" />
                <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 border border-white/15 bg-white/10 px-3 py-2">
                      <Sparkles size={13} />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/65">
                        Shop the rack
                      </p>
                    </div>
                    <h1 className="mt-4 max-w-4xl text-4xl font-black uppercase leading-[0.9] tracking-tight md:text-6xl">
                      {searchTerm ? `Results for ${searchTerm}` : filters.brand !== "All" ? filters.brand : "All Products"}
                    </h1>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-white/60">
                      Filter the latest thrifted finds, streetwear staples, and branded pieces ready for your next fit.
                    </p>
                  </div>
                  <div className="border border-white/15 bg-white/10 p-4 text-left backdrop-blur md:min-w-56">
                    <p className="text-4xl font-black italic leading-none">{filteredProducts.length}</p>
                    <p className="mt-2 text-[10px] font-black uppercase tracking-[0.25em] text-white/55">
                      Items found
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 border-x border-b border-black/10 bg-[#f7f7f4] p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-2">
                  {shopChips.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => openShop("All", category, "All")}
                      className={`border px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition ${
                        filters.category === category
                          ? "border-black bg-black text-white"
                          : "border-black/10 bg-white text-gray-600 hover:border-black hover:text-black"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => openShop("All", "All", "All")}
                  className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 transition hover:text-black"
                >
                  Full drop <ArrowRight size={13} />
                </button>
              </div>

              <div className="sr-only">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                    Shop
                  </p>
                  <h1 className="mt-2 text-3xl font-black uppercase tracking-tight md:text-5xl">
                    {searchTerm ? `Results for ${searchTerm}` : filters.brand !== "All" ? filters.brand : "All Products"}
                  </h1>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  {filteredProducts.length} items found
                </p>
              </div>

              <ProductGrid
                products={filteredProducts}
                loading={productsLoading}
                error={productsError}
                onRetry={fetchProducts}
                filters={filters}
                onOpenFilters={() => setShopOpen(true)}
                addToCart={addToCart}
                wishlistItems={wishlistItems}
                toggleWishlist={toggleWishlist}
                onClearFilters={clearShop}
              />
            </div>
          </main>
        )}
      </div>

      <Footer />

      <FilterSidebar
        isOpen={shopOpen}
        onClose={() => setShopOpen(false)}
        filters={filters}
        setFilters={setFilters}
        allProducts={allProducts}
      />

       <CartModal
         isOpen={cartModalOpen}
         onClose={() => setCartModalOpen(false)}
         cartItems={cartItems}
         setCartItems={setCartItems}
         openShop={openShop}
         onOrderCreated={handleOrderCreated}
       />
       <OrderTrackingModal
         isOpen={trackingModalOpen}
         onClose={() => setTrackingModalOpen(false)}
         orderNumber={trackedOrderNumber}
         currentUser={currentUser}
         recentOrder={trackedOrderNumber}
       />
     </>
  );

  if (isLoading) {
    return <Loader finishLoading={() => setIsLoading(false)} />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex min-h-screen flex-col bg-white text-black"
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/settings" element={<AdminDashboard initialSection="settings" />} />
          </Route>

          <Route path="/" element={<ShopLayout />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default AppRoutes;
