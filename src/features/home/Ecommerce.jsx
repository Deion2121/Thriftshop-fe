import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Plus, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import chhood from "../../assets/carhartt/chhood.png";
import s from "../../assets/s.png";
import nb from "../../assets/nb.png";

const collections = [
  { title: "Workwear", copy: "Heavyweight staples, utility pockets, and boxy layers.", category: "Men", subCategory: "Jackets", stat: "Hardwearing" },
  { title: "Everyday Bags", copy: "Compact carry pieces for fits that stay moving.", category: "Women", subCategory: "Accessories", stat: "Grab-ready" },
  { title: "Fresh Basics", copy: "Clean tees and low-effort layers for repeat wear.", category: "Men", subCategory: "T-Shirts", stat: "Rotation" },
];

const Ecommerce = ({ addToCart, filters, openShop, allProducts = [] }) => {
  const [addedMessage, setAddedMessage] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    setFeaturedProducts(allProducts.filter((p) => p.isFeatured));
  }, [allProducts]);

  const nextSlide = () => setCarouselIndex((prev) => (prev + 1) % featuredProducts.length);
  const prevSlide = () => setCarouselIndex((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);

  const handleAddToCart = (product) => {
    addToCart({
      ...product,
      variants: [{ image: product.img, colorName: "Default", colorHex: "#111111" }],
      selectedVariant: { image: product.img, colorName: "Default", colorHex: "#111111" },
    });
    setAddedMessage(`${product.title} added`);
    setTimeout(() => setAddedMessage(null), 1800);
  };

  if (filters.category !== "All" || filters.subCategory !== "All") {
    return null;
  }

  return (
    <section className="bg-[#f6f6f3] px-4 py-16 md:px-10 md:py-24 dark:bg-zinc-950 dark:text-zinc-100">
      <AnimatePresence>
        {addedMessage && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed right-6 top-24 z-50 border border-white/10 bg-black px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-2xl"
          >
            {addedMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 grid gap-6 border-b border-black/10 pb-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 bg-black px-3 py-2 text-white">
              <p className="text-[10px] font-black uppercase tracking-[0.28em]">Selected for you</p>
            </div>
            <h2 className="mt-4 max-w-3xl text-4xl font-black uppercase leading-[0.9] tracking-tight md:text-6xl">
              Rotation pieces that do the most.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-gray-600 dark:text-zinc-400">
              A quick rack of thrifted staples, branded finds, and easy add-ons made for everyday styling.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openShop("All", "All", "All")}
            className="inline-flex h-12 items-center justify-center gap-2 border border-black bg-white px-5 text-[11px] font-black uppercase tracking-[0.2em] transition hover:bg-black hover:text-white dark:border-white/20 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-white dark:hover:text-black"
          >
            View all products <ArrowRight size={14} />
          </button>
        </div>

        {featuredProducts.length > 0 && (
          <div className="relative mb-8 overflow-hidden">
            <div className="relative h-[400px] md:h-[500px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={carouselIndex}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 grid grid-cols-1 gap-5 sm:grid-cols-3"
                >
                  {featuredProducts.map((product, index) => (
                    <motion.article
                      key={product.id}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.25 }}
                      transition={{ duration: 0.45, delay: index * 0.08 }}
                      whileHover={{ y: -6 }}
                      className="group bg-white dark:bg-zinc-900"
                    >
                      <div className="relative aspect-4/5 overflow-hidden bg-[#ededeb]">
                        <div className="absolute left-3 top-3 z-10 bg-white px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em]">
                          {product.tag}
                        </div>
                        <img
                          src={product.img}
                          alt={product.title}
                          className="h-full w-full object-contain p-5 transition-transform duration-500 group-hover:scale-105"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center bg-white shadow-lg transition-colors hover:bg-black hover:text-white"
                          aria-label={`Add ${product.title} to bag`}
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                      <div className="border-x border-b border-black/10 p-4 dark:border-white/10">
                        <div className="mb-3 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-gray-400">
                          <BadgeCheck size={13} /> Quality checked
                        </div>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-sm font-black uppercase tracking-tight">{product.title}</h3>
                            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">{product.brand}</p>
                          </div>
                          <p className="font-black italic text-gray-700 dark:text-zinc-200">PHP {product.price.toLocaleString()}</p>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {featuredProducts.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-lg transition hover:bg-white"
                  aria-label="Previous featured products"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-lg transition hover:bg-white"
                  aria-label="Next featured products"
                >
                  <ChevronRight size={20} />
                </button>
                <div className="mt-4 flex justify-center gap-2">
                  {featuredProducts.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCarouselIndex(i)}
                      className={`h-1.5 w-6 rounded-full transition ${
                        i === carouselIndex ? "bg-black" : "bg-gray-300 hover:bg-gray-400"
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 border border-black/10 bg-white md:grid-cols-3 dark:border-white/10 dark:bg-zinc-900">
          {collections.map((collection) => (
            <button
              key={collection.title}
              type="button"
              onClick={() => openShop("All", collection.category, collection.subCategory)}
              className="group border-b border-black/10 p-6 text-left transition hover:bg-black hover:text-white md:border-b-0 md:border-r last:border-r-0 dark:border-white/10 dark:hover:bg-white dark:hover:text-black"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 transition group-hover:text-white/45">
                {collection.stat}
              </p>
              <div className="mt-8 flex items-end justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">{collection.title}</h3>
                  <p className="mt-3 max-w-xs text-sm leading-6 text-gray-500 transition group-hover:text-white/65">
                    {collection.copy}
                  </p>
                </div>
                <ArrowRight size={18} className="shrink-0 transition group-hover:translate-x-1" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Ecommerce;