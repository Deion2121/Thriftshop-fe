import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { BadgeCheck, Sparkles } from "lucide-react";

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

const logos = [
  { name: "Nike", image: nike },
  { name: "New Balance", image: nb },
  { name: "Adidas", image: adidas },
  { name: "Carhartt", image: ch },
  { name: "Vans", image: vans },
  { name: "Champion", image: champion },
  { name: "Tommy Hilfiger", image: tommy },
  { name: "Polo Ralph Lauren", image: rlpolo },
  { name: "Converse", image: converse },
  { name: "Fila", image: fila },
  { name: "Guess", image: guess },
  { name: "H&M", image: hm },
  { name: "Puma", image: puma },
  { name: "Reebok", image: reebok },
];

const LogoCarousel = () => {
  const carouselRef = useRef(null);
  const controls = useAnimation();
  const [width, setWidth] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const element = carouselRef.current;
    if (!element) return undefined;

    const updateWidth = () => setWidth(element.scrollWidth / 2);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const startAnimation = useCallback(() => {
    if (width <= 1 || isPaused) return;

    controls.start({
      x: [0, -width],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          ease: "linear",
          duration: 28,
        },
      },
    });
  }, [controls, isPaused, width]);

  useEffect(() => {
    if (isPaused) {
      controls.stop();
      return;
    }

    startAnimation();
  }, [controls, isPaused, startAnimation]);

  return (
    <section className="overflow-hidden border-y border-black/10 bg-white dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-[1400px] px-4 py-12 md:px-10 md:py-16">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 border border-black/10 bg-[#f7f7f4] px-3 py-2 text-black dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100">
              <p className="text-[10px] font-black uppercase tracking-[0.28em]">Brands in rotation</p>
            </div>
            <h2 className="mt-4 max-w-3xl text-3xl font-black uppercase leading-none tracking-tight md:text-5xl">
              Labels customers keep coming back for.
            </h2>
          </div>

          <div className="grid grid-cols-2 border border-black/10 bg-black text-white sm:min-w-80">
            <div className="border-r border-white/10 p-4">
              <p className="text-2xl font-black italic leading-none">{logos.length}+</p>
              <p className="mt-2 text-[9px] font-black uppercase tracking-[0.22em] text-white/50">Brands</p>
            </div>
            <div className="p-4">
              <p className="flex items-center gap-2 text-2xl font-black italic leading-none">
                <BadgeCheck size={20} /> QC
              </p>
              <p className="mt-2 text-[9px] font-black uppercase tracking-[0.22em] text-white/50">Checked</p>
            </div>
          </div>
        </div>

        <div
          className="relative -mx-4 overflow-hidden py-2 md:-mx-10"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        >
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20 bg-linear-to-r from-white to-transparent md:w-40 dark:from-zinc-950" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-linear-to-l from-white to-transparent md:w-40 dark:from-zinc-950" />

          <motion.div
            ref={carouselRef}
            className="flex w-max cursor-grab items-center gap-4 px-4 active:cursor-grabbing md:gap-5 md:px-10"
            animate={controls}
            drag="x"
            dragConstraints={{ left: -width, right: 0 }}
            dragElastic={0.04}
            onDragStart={() => setIsPaused(true)}
            onDragEnd={() => setIsPaused(false)}
          >
            {[...logos, ...logos].map((logo, index) => (
              <motion.div
                key={`${logo.name}-${index}`}
                whileHover={{ y: -4 }}
                className="group flex h-28 w-40 shrink-0 items-center justify-center border border-black/10 bg-[#f7f7f4] px-6 transition-colors hover:border-black hover:bg-white sm:h-32 sm:w-48 dark:border-white/10 dark:bg-zinc-900 dark:hover:border-white dark:hover:bg-zinc-800"
              >
                <img
                  src={logo.image}
                  alt={`${logo.name} logo`}
                  className="max-h-16 w-auto max-w-full object-contain opacity-65 grayscale transition duration-300 group-hover:scale-110 group-hover:opacity-100 group-hover:grayscale-0 sm:max-h-20"
                  draggable="false"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LogoCarousel;
