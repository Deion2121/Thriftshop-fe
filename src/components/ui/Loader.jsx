import React from "react";
import { motion } from "framer-motion";
import logo from "../../assets/flogo.png"; 

// Idinagdag ang { finishLoading } sa loob ng curly braces (Destructuring)
const Loader = ({ finishLoading }) => {
  return (
    <motion.div
      key="loader-container"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 flex items-center justify-center bg-black z-9999"
    >
      <motion.img
        src={logo}
        alt="Logo"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{
          duration: 1.5,
          repeat: 1, // 1 repeat + initial run = approx 3 seconds
          ease: "easeInOut",
        }}
        // Dito tinatawag ang prop na galing sa App.js
        onAnimationComplete={finishLoading} 
        className="w-32 h-32 object-contain"
      />
    </motion.div>
  );
};

export default Loader;