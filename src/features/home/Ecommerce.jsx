import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, ArrowRight } from "lucide-react";
import chhood from "../../assets/carhartt/chhood.png";
import s from "../../assets/s.png";
import nb from "../../assets/nb.png";

const featuredProducts = [
  { id: 101, title: "Premium Trouser", brand: "Carhartt", price: 135, img: chhood, category: "Men", subCategory: "Pants" },
  { id: 102, title: "Urban Sling Bag", brand: "JThrift", price: 55, img: s, category: "Women", subCategory: "Accessories" },
  { id: 103, title: "Classic Basic Tee", brand: "New Balance", price: 35, img: nb, category: "Men", subCategory: "T-Shirts" },
];

const collections = [
  { title: "Workwear", copy: "Heavyweight staples and utility details.", category: "Men", subCategory: "Jackets" },
  { title: "Everyday Bags", copy: "Small carry pieces for fast city days.", category: "Women", subCategory: "Accessories" },
  { title: "Fresh Basics", copy: "Clean tees and easy layers.", category: "Men", subCategory: "T-Shirts" },
];

const Ecommerce = ({ addToCart, filters, openShop }) => {
  const [addedMessage, setAddedMessage] = useState(null);

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
    <section className="bg-white px-4 py-16 md:px-10">
      <AnimatePresence>
        {addedMessage && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed right-6 top-24 z-50 bg-black px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg"
          >
            {addedMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Selected for you</p>
            <h2 className="mt-2 text-3xl font-black uppercase italic tracking-tight md:text-5xl">Must-Haves</h2>
          </div>
          <button
            type="button"
            onClick={() => openShop("All", "All", "All")}
            className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] hover:text-gray-500"
          >
            View all products <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {featuredProducts.map((product) => (
            <motion.article key={product.id} whileHover={{ y: -5 }} className="group">
              <div className="relative aspect-4/5 overflow-hidden bg-[#f5f5f5]">
<img
                   src={product.img}
                   alt={product.title}
                   className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                 />
                <button
                  type="button"
                  onClick={() => handleAddToCart(product)}
                  className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center bg-white shadow-md transition-colors hover:bg-black hover:text-white"
                  aria-label={`Add ${product.title} to bag`}
                >
                  <Plus size={18} />
                </button>
              </div>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight">{product.title}</h3>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">{product.brand}</p>
                </div>
                <p className="font-black italic text-gray-700">PHP {product.price.toLocaleString()}</p>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 border-y border-gray-100 md:grid-cols-3">
          {collections.map((collection) => (
            <button
              key={collection.title}
              type="button"
              onClick={() => openShop("All", collection.category, collection.subCategory)}
              className="border-b border-gray-100 px-0 py-7 text-left transition hover:bg-gray-50 md:border-b-0 md:border-r md:px-6 last:border-r-0"
            >
              <h3 className="text-lg font-black uppercase tracking-tight">{collection.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{collection.copy}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Ecommerce;
