import React, { useCallback, useRef, useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

import nike from "../../assets/nike-logo.png";
import nb from "../../assets/nb-logo.png";
import adidas from "../../assets/Adidas_logo.png";
import ch from "../../assets/carhartt-logo.png";
import vans from "../../assets/vans.png";
import champion from "../../assets/champion.png";
import tommy from "../../assets/tommy.png";
import rlpolo from "../../assets/rlpolo.png";
import converse from "../../assets/converse_logo.png";
import fila from "../../assets/fila_logo.png";
import guess from "../../assets/guess_logo.png";
import hm from "../../assets/h&m_logo.png";
import puma from "../../assets/puma_logo.png";
import reebok from "../../assets/reebok_logo.png";

const LogoCarousel = () => {
  const logos = [nike, nb, adidas, ch, vans, champion, tommy, rlpolo, converse , fila, guess, hm, puma, reebok];

  const carouselRef = useRef(null);
  const controls = useAnimation();

  const [width, setWidth] = useState(0);
  // 🔹 calculate width (half because duplicated)
  useEffect(() => {
    if (carouselRef.current) {
      setWidth(carouselRef.current.scrollWidth / 4);
     
    }
  }, []);

  // 🔹 autoplay infinite loop
  const startAnimation = useCallback(() => {
    controls.start({
      x: [-width, 0],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          ease: "linear",
          duration: 15,
        },
      },
    });
  }, [controls, width]);

  // start once width is ready
  useEffect(() => {
    if (width > 1) startAnimation();
  }, [width, startAnimation]);

 
 

  return (
    <div
      className="relative w-full overflow-hidden bg-white py-24 flex justify-center items-center"
    >
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-32 bg-linear-to-r from-white to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-32 bg-linear-to-l from-white to-transparent z-10" />

      {/* Logo track */}
      <motion.div
        ref={carouselRef}
        className="flex gap-16 items-center cursor-grab w-max"
        animate={controls}
        drag="x"
        dragConstraints={{ left: -width, right: 0 }}
        dragElastic={0.05}
        onDragStart={() => controls.stop()}
        onDragEnd={() => startAnimation()}
      >
        {[...logos, ...logos].map((logo, i) => (
          <div
            key={i}
            className="flex justify-center items-center w-36 h-28 shrink-0"
          >
            <img
              src={logo}
              alt={`brand-logo-${i}`}
              className="
                h-20 sm:h-24 md:h-28 w-auto object-contain
                opacity-70 hover:opacity-100
                transition-all duration-300
                hover:scale-125 hover:drop-shadow-lg
              "
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default LogoCarousel;
