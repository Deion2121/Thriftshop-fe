import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
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
import { formatProductForFrontend } from "../utils/productImages";
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

const readStoredList = (key) => {
  try {
    const stored = JSON.parse(localStorage.getItem(key));
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

function AppRoutes() {
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState(() => readStoredList("cartItems"));
  const [wishlistItems, setWishlistItems] = useState(() => readStoredList("wishlistItems"));
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isShopView, setIsShopView] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(API_URL);
        const formatted = Array.isArray(res.data) ? res.data.map(formatProductForFrontend) : [];
        setAllProducts(formatted);
      } catch (err) {
        console.error("Product fetch error:", err);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
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
    setCartItems((prev) => {
      const variantName = product.selectedVariant?.colorName || "Default";
      const existingItem = prev.find(
        (item) =>
          item.id === product.id &&
          (item.selectedVariant?.colorName || "Default") === variantName
      );

      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id && (item.selectedVariant?.colorName || "Default") === variantName
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { ...product, quantity: 1 }];
    });

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

  const ShopLayout = () => (
    <>
      <Header
        cartItems={cartItems}
        wishlistCount={wishlistItems.length}
        openCartModal={() => setCartModalOpen(true)}
        openShop={openShop}
        handleSearch={handleSearch}
        refreshPage={refreshPage}
      />

      <div className="grow relative">
        {!isShopView ? (
          <>
            <Hero openShop={openShop} />
            <Ecommerce addToCart={addToCart} filters={filters} openShop={openShop} />
            <LogoSlider />
          </>
        ) : (
          <main className="pt-32 pb-20">
            <div className="max-w-[1400px] mx-auto px-4 md:px-10">
              <button
                type="button"
                onClick={goHome}
                className="mb-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-gray-500"
              >
                <ArrowLeft size={14} /> Back to Home
              </button>

              <div className="flex flex-col gap-3 border-b border-gray-100 pb-8 md:flex-row md:items-end md:justify-between">
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
          </Route>

          <Route path="/" element={<ShopLayout />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default AppRoutes;
