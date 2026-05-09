import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FilterAccordion = ({ 
  title, 
  items, 
  selected, 
  onSelect, 
  onMouseEnterItem, 
  onMouseLeaveItem 
}) => {
  const [isOpen, setIsOpen] = useState(true);

  // Check natin kung "Size" ang title para baguhin ang layout
  const isSizeGrid = title.toLowerCase().includes("size");

  return (
    <div className="border-b py-4">
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center mb-4 group"
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-900 group-hover:text-gray-500 transition-colors">
          {title}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </button>

      {/* Accordion Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
           
            <div className={
              isSizeGrid 
              ? "grid grid-cols-3 gap-2 pb-2" 
              : "flex flex-wrap gap-2 pb-2"
            }>
              {items.map((item) => {
                const isSelected = selected === item;
                
                return (
                  <button
                    key={item}
                    onMouseEnter={() => title === "Brands" && onMouseEnterItem?.(item)}
                    onMouseLeave={() => title === "Brands" && onMouseLeaveItem?.()}
                    onClick={() => onSelect(item)}
                    className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all duration-300 text-center ${
                      isSelected
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-500 border-gray-100 hover:border-black hover:text-black"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterAccordion;