import React, { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import FilterAccordion from "./FilterAccordion";

const FilterSidebar = ({ isOpen, onClose, filters, setFilters, allProducts = [] }) => {
  const normalize = (value) => String(value || "").trim().toLowerCase();
  const brandOptions = [
    "Nike",
    "Adidas",
    "Polo RL",
    "Vans",
    "Converse",
    "Puma",
    "Tommy Hilfiger",
    "New Balance",
    "Reebok",
    "Fila",
    "Uniqlo",
    "Champion",
    "Carhartt",
    "Guess",
  ];
  const sortOptions = ["Newest", "Price: Low to High", "Price: High to Low"];
  const categoryOptions = ["Men", "Women", "Kids", "Shoes", "Sale"];
  const subCategoryMap = {
    Men: ["T-Shirts", "Hoodies", "Pants", "Jackets", "Tracksuits"],
    Women: ["Tops", "Dresses", "Leggings", "Outerwear", "Accessories"],
    Kids: ["T-Shirts", "Sets", "Jackets", "Pants"],
    Shoes: ["Lifestyle", "Running", "Basketball", "Training", "Sandals"],
    Sale: ["Clearance", "Last Chance", "Seasonal Sale", "Flash Sale"],
  };
  const subCategoryOptions = subCategoryMap[filters.category] || [];
  const sizeOptions = ["S", "M", "L", "XL", "XXL"];
  const shoeSizeOptions = ["UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"];

  const filteredCount = useMemo(() => {
    return allProducts.filter((product) => {
      const matchBrand = filters.brand === "All" || normalize(product.brand) === normalize(filters.brand);
      const matchCategory = filters.category === "All" || normalize(product.category) === normalize(filters.category);
      const matchSub = filters.subCategory === "All" || normalize(product.subCategory) === normalize(filters.subCategory);
      const matchSize = !filters.size || product.sizes?.map(normalize).includes(normalize(filters.size));
      const matchShoeSize = !filters.shoeSize || product.shoeSizes?.map(normalize).includes(normalize(filters.shoeSize));
      return matchBrand && matchCategory && matchSub && matchSize && matchShoeSize;
    }).length;
  }, [filters, allProducts]);

  const handleUpdate = (key, value) => {
    setFilters((prev) => {
      const nextValue = prev[key] === value ? (["brand", "category", "subCategory"].includes(key) ? "All" : null) : value;
      const next = { ...prev, [key]: nextValue };

      if (key === "category") {
        next.subCategory = "All";
      }

      return next;
    });
  };

  const clearAll = () => {
    setFilters({
      brand: "All",
      category: "All",
      subCategory: "All",
      size: null,
      shoeSize: null,
      sort: "Newest",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[110] backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-white z-[120] shadow-2xl flex flex-col"
          >
            <div className="p-6 flex justify-between items-center border-b border-gray-100">
              <div className="flex flex-col">
                <h2 className="text-xl font-black uppercase italic tracking-tight">Filter & Sort</h2>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors text-left font-bold mt-1 underline decoration-1"
                >
                  Clear All
                </button>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-full transition-all"
                aria-label="Close filters"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-1 custom-scrollbar">
              <FilterAccordion
                title="Sort By"
                items={sortOptions}
                selected={filters.sort}
                onSelect={(val) => handleUpdate("sort", val)}
              />

              <FilterAccordion
                title="Category"
                items={categoryOptions}
                selected={filters.category}
                onSelect={(val) => handleUpdate("category", val)}
              />

              {subCategoryOptions.length > 0 && (
                <FilterAccordion
                  title="Subcategory"
                  items={subCategoryOptions}
                  selected={filters.subCategory}
                  onSelect={(val) => handleUpdate("subCategory", val)}
                />
              )}

              <FilterAccordion
                title="Brands"
                items={brandOptions}
                selected={filters.brand}
                onSelect={(val) => handleUpdate("brand", val)}
              />

              <FilterAccordion
                title="Size"
                items={sizeOptions}
                selected={filters.size}
                onSelect={(val) => handleUpdate("size", val)}
              />

              <FilterAccordion
                title="Shoe Size"
                items={shoeSizeOptions}
                selected={filters.shoeSize}
                onSelect={(val) => handleUpdate("shoeSize", val)}
              />
            </div>

            <div className="p-6 border-t border-gray-100 bg-white">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-4 bg-black text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:bg-zinc-800 flex justify-center items-center gap-3 active:scale-[0.98]"
              >
                Show Results
                <span className="text-gray-400 font-normal">({filteredCount})</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FilterSidebar;
