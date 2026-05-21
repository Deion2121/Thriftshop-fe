import React, { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, RefreshCcw, SlidersHorizontal, SearchX, Shirt } from "lucide-react";
import ProductCard from "./ProductCard";

const sortProducts = (products, sort) => {
  const list = [...products];

  if (sort === "Price: Low to High") {
    list.sort((a, b) => a.price - b.price);
  }

  if (sort === "Price: High to Low") {
    list.sort((a, b) => b.price - a.price);
  }

  return list;
};

const ProductGrid = ({
  products,
  loading = false,
  error = "",
  onRetry,
  filters,
  onOpenFilters,
  addToCart,
  wishlistItems = [],
  toggleWishlist,
  onClearFilters,
}) => {
  const sortedProducts = useMemo(
    () => sortProducts(products, filters.sort),
    [products, filters.sort]
  );

  const activeFilters = [
    filters.brand !== "All" && filters.brand,
    filters.category !== "All" && filters.category,
    filters.subCategory !== "All" && filters.subCategory,
    filters.size,
    filters.shoeSize,
  ].filter(Boolean);

  const wishlistKeys = new Set(wishlistItems.map((item) => String(item.id ?? item.title)));

  return (
    <div className="mx-auto max-w-[1440px] px-0 pt-8 pb-20">
      <div className="mb-8 flex flex-col gap-4 border border-black/5 bg-[#f7f7f4] p-4 md:flex-row md:items-center md:justify-between md:p-5">
        <div className="flex flex-wrap gap-2">
          {activeFilters.length > 0 ? (
            activeFilters.map((filter) => (
              <span
                key={filter}
                className="border border-black/10 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-600"
              >
                {filter}
              </span>
            ))
          ) : (
            <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
              <Shirt size={14} /> Browse the full drop
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenFilters}
          className="inline-flex min-h-12 items-center justify-center gap-3 border border-black bg-black px-5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-zinc-800 active:scale-95"
        >
          <SlidersHorizontal size={16} /> Filter & Sort
        </button>
      </div>

      {error && (
        <div className="mb-8 flex flex-col gap-4 border border-red-100 bg-red-50 p-5 text-red-700 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 shrink-0" size={18} />
            <p className="text-sm font-semibold">{error}</p>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-10 items-center justify-center gap-2 border border-red-200 bg-white px-4 text-[10px] font-black uppercase tracking-widest transition hover:border-red-400"
          >
            <RefreshCcw size={14} /> Retry
          </button>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="aspect-3/4 bg-[#f1f1ee]" />
              <div className="mt-4 h-3 w-2/3 bg-[#f1f1ee]" />
              <div className="mt-3 h-3 w-1/3 bg-[#f1f1ee]" />
            </div>
          ))}
        </div>
      )}

      {!loading && !error && (
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-y-10">
        <AnimatePresence mode="popLayout">
          {sortedProducts.map((product, index) => (
            <motion.div
              layout
              key={product.id ?? product.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{
                duration: 0.35,
                delay: index * 0.03,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <ProductCard
                product={product}
                addToCart={addToCart}
                isWishlisted={wishlistKeys.has(String(product.id ?? product.title))}
                toggleWishlist={toggleWishlist}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      )}

      {!loading && !error && sortedProducts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-10 flex flex-col items-center border-t border-gray-100 py-32 text-center"
        >
          <SearchX size={34} className="mb-5 text-gray-300" />
          <h2 className="text-xl font-black uppercase italic tracking-tight">No products found</h2>
          <p className="mt-2 max-w-sm text-xs leading-6 text-gray-500">
            Try a broader search, remove a size, or clear the active filters.
          </p>
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-6 border border-black px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition hover:bg-black hover:text-white"
          >
            Clear Filters
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default ProductGrid;
