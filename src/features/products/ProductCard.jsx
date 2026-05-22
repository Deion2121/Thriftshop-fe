import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, ShoppingBag, Sparkles } from "lucide-react";

const ProductCard = ({ product, addToCart, isWishlisted = false, toggleWishlist, onOpenDetails }) => {
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants?.[0] || { image: product.img, colorName: "Default" }
  );

  const sizes = product.shoeSizes?.length ? product.shoeSizes : product.sizes;
  const openDetails = () => onOpenDetails?.({ ...product, selectedVariant });
  const stopCardClick = (event) => event.stopPropagation();
  const handleKeyDown = (event) => {
    if (event.target !== event.currentTarget) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDetails();
    }
  };

  return (
    <article
      className="group relative flex cursor-pointer flex-col"
      role="button"
      tabIndex={0}
      onClick={openDetails}
      onKeyDown={handleKeyDown}
      aria-label={`View details for ${product.title}`}
    >
      <div className="relative aspect-3/4 overflow-hidden border border-black/5 bg-[#f2f2ef]">
        <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 bg-white/90 px-2.5 py-2 text-[8px] font-black uppercase tracking-[0.16em] text-black shadow-sm backdrop-blur">
          <Sparkles size={11} /> Picked
        </div>

        <AnimatePresence mode="wait">
          <motion.img
            key={selectedVariant.image}
            src={selectedVariant.image}
            alt={product.title}
            initial={{ opacity: 0.85 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.85 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full object-contain p-4 transition-transform duration-700 group-hover:scale-105"
          />
        </AnimatePresence>

        <button
          type="button"
          onClick={(event) => {
            stopCardClick(event);
            toggleWishlist?.(product);
          }}
          className={`absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center bg-white shadow-sm transition hover:bg-black hover:text-white ${
            isWishlisted ? "text-red-500" : "text-black"
          }`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
        </button>

        <motion.button
          type="button"
          onClick={(event) => {
            stopCardClick(event);
            addToCart({ ...product, selectedVariant });
          }}
          initial={{ y: 8, opacity: 0.92 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute inset-x-3 bottom-3 flex min-h-11 items-center justify-center gap-2 bg-black py-3 text-white shadow-xl transition hover:bg-zinc-800"
        >
          <ShoppingBag size={14} />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Add to Bag</span>
        </motion.button>
      </div>

      <div className="border-x border-b border-black/5 bg-white p-3.5 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[11px] font-black uppercase leading-tight tracking-tight transition group-hover:text-gray-500">
              {product.title}
            </h3>
            <p className="mt-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-400">
              {product.brand}
            </p>
          </div>
          <span className="shrink-0 text-[11px] font-black italic">
            PHP {product.price.toLocaleString()}
          </span>
        </div>

        {product.variants?.length > 0 && (
          <div className="mt-4 flex gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.colorName}
                type="button"
                onClick={stopCardClick}
                onMouseEnter={() => setSelectedVariant(variant)}
                onFocus={() => setSelectedVariant(variant)}
                className={`h-4 w-4 rounded-full border transition-all duration-300 ${
                  selectedVariant.colorName === variant.colorName
                    ? "scale-125 border-black ring-1 ring-black/20 ring-offset-1"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: variant.colorHex }}
                title={variant.colorName}
                aria-label={`Select ${variant.colorName}`}
              />
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-black/5 pt-3">
          <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-gray-400">
            {selectedVariant.colorName}
          </p>
          {sizes?.length > 0 && (
            <p className="truncate text-[8px] font-bold uppercase tracking-[0.16em] text-gray-400">
              {sizes.slice(0, 4).join(" / ")}
            </p>
          )}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
