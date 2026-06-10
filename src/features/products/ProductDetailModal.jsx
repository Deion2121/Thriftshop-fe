import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Palette, Ruler, ShoppingBag, Tag, X } from "lucide-react";

const getColorSwatchStyle = (variant = {}) => {
  const primary = variant.colorHex || "#111111";
  const secondary = variant.colorHexSecondary;

  return secondary
    ? { background: `linear-gradient(135deg, ${primary} 0 50%, ${secondary} 50% 100%)` }
    : { backgroundColor: primary };
};

const buildDescription = (product) => {
  if (product?.description) return product.description;

  const category = product?.subCategory || product?.category || "piece";
  const brand = product?.brand || "selected brand";

  return `A carefully selected ${brand} ${category.toLowerCase()} made for easy daily styling. Check the available color and size options before adding it to your bag.`;
};

const ProductDetailModal = ({ product, isOpen, onClose, addToCart }) => {
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    if (!product) return;
    setSelectedVariant(
      product.selectedVariant ||
        product.variants?.[0] || { image: product.img, colorName: "Default", colorHex: "#111111" }
    );
  }, [product]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const sizes = useMemo(
    () => (product?.shoeSizes?.length ? product.shoeSizes : product?.sizes || []),
    [product]
  );

  if (!product) return null;

  const description = buildDescription(product);
  const image = selectedVariant?.image || product.img;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[350] bg-black/65 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-[351] flex items-center justify-center px-4 py-6">
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="product-detail-title"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative grid max-h-[92vh] w-full max-w-4xl overflow-y-auto bg-white shadow-2xl md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] dark:bg-zinc-950 dark:text-zinc-100"
            >
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center bg-white text-black shadow-sm transition hover:bg-black hover:text-white dark:bg-zinc-900 dark:text-white dark:hover:bg-white dark:hover:text-black"
                aria-label="Close product details"
              >
                <X size={18} />
              </button>

              <div className="flex min-h-80 items-center justify-center bg-[#f2f2ef] p-6 md:min-h-full dark:bg-zinc-900">
                <img
                  src={image}
                  alt={product.title}
                  className="max-h-[56vh] w-full object-contain"
                />
              </div>

              <div className="flex flex-col p-5 sm:p-7">
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 bg-black px-3 py-2 text-[9px] font-black uppercase tracking-[0.22em] text-white">
                    <Tag size={12} /> {product.brand}
                  </span>
                  <span className="border border-black/10 px-3 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 dark:border-white/10 dark:text-zinc-400">
                    {product.subCategory || product.category}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-5 border-b border-black/10 pb-5 dark:border-white/10">
                  <div className="min-w-0">
                    <h2
                      id="product-detail-title"
                      className="text-2xl font-black uppercase leading-none tracking-tight sm:text-4xl"
                    >
                      {product.title}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-zinc-400">{description}</p>
                  </div>
                  <p className="shrink-0 text-lg font-black italic sm:text-2xl">
                    PHP {Number(product.price || 0).toLocaleString()}
                  </p>
                </div>

                {product.variants?.length > 0 && (
                  <div className="border-b border-black/10 py-5 dark:border-white/10">
                    <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-gray-400">
                      <Palette size={13} /> Color
                    </div>
                    <div className="flex flex-wrap gap-3" role="radiogroup" aria-label={`${product.title} color`}>
                      {product.variants.map((variant) => (
                        <button
                          key={variant.colorName}
                          type="button"
                          onClick={() => setSelectedVariant(variant)}
                          role="radio"
                          aria-checked={selectedVariant?.colorName === variant.colorName}
                          className={`flex min-h-11 items-center gap-2 border px-3 text-[10px] font-black uppercase tracking-widest transition ${
                            selectedVariant?.colorName === variant.colorName
                              ? "border-black bg-[#f7f7f4] text-black ring-2 ring-black dark:border-white dark:bg-zinc-800 dark:text-white dark:ring-white"
                              : "border-black/10 bg-white text-gray-500 hover:border-black hover:text-black dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-white dark:hover:text-white"
                          }`}
                        >
                          <span
                            className={`h-5 w-5 rounded-full border border-black/10 ${
                              selectedVariant?.colorName === variant.colorName ? "ring-2 ring-black/20 ring-offset-2" : ""
                            }`}
                            style={getColorSwatchStyle(variant)}
                          />
                          {variant.colorName}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {sizes.length > 0 && (
                  <div className="border-b border-black/10 py-5 dark:border-white/10">
                    <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-gray-400">
                      <Ruler size={13} /> Available sizes
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => (
                        <span
                          key={size}
                          className="border border-black/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-600 dark:border-white/10 dark:text-zinc-300"
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      addToCart({ ...product, selectedVariant });
                      onClose();
                    }}
                    className="inline-flex min-h-14 w-full items-center justify-center gap-3 bg-black px-5 text-[11px] font-black uppercase tracking-[0.28em] text-white transition hover:bg-zinc-800"
                  >
                    <ShoppingBag size={16} /> Add to Bag
                  </button>
                </div>
              </div>
            </motion.section>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductDetailModal;
