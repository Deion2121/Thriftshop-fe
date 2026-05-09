import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";

const ProductCard = ({ product, addToCart, isWishlisted = false, toggleWishlist }) => {
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants?.[0] || { image: product.img, colorName: "Default" }
  );
  const [isHovered, setIsHovered] = useState(false);

  const sizes = product.shoeSizes?.length ? product.shoeSizes : product.sizes;

  return (
    <div
      className="group relative flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-3/4 overflow-hidden bg-[#f6f6f6]">
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedVariant.image}
            src={selectedVariant.image}
            alt={product.title}
            initial={{ opacity: 0.85 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.85 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-105"
          />
        </AnimatePresence>

        <button
          type="button"
          onClick={() => toggleWishlist?.(product)}
          className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center bg-white shadow-sm transition hover:bg-black hover:text-white ${
            isWishlisted ? "text-red-500" : "text-black"
          }`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
        </button>

        <motion.button
          type="button"
          onClick={() => addToCart({ ...product, selectedVariant })}
          initial={{ y: 18, opacity: 0 }}
          animate={isHovered ? { y: 0, opacity: 1 } : { y: 18, opacity: 0 }}
          className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 bg-black py-3 text-white transition hover:bg-zinc-800"
        >
          <ShoppingBag size={14} />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Add to Bag</span>
        </motion.button>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[11px] font-black uppercase leading-tight tracking-tight group-hover:underline">
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
          <div className="flex gap-2 pt-1">
            {product.variants.map((variant) => (
              <button
                key={variant.colorName}
                type="button"
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

        <div className="flex items-center justify-between gap-3">
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
    </div>
  );
};

export default ProductCard;
