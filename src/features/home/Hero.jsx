import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import clip from "../../assets/clip.mp4";

const quickLinks = [
  { label: "Men", category: "Men" },
  { label: "Women", category: "Women" },
  { label: "Shoes", category: "Shoes" },
  { label: "Sale", category: "Sale" },
];

const Hero = ({ openShop }) => {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-black">
      <video
        src={clip}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover opacity-90"
      />
      <div className="absolute inset-0 bg-black/55" />

      <motion.div
        initial={{ opacity: 0, y: 34 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 mx-auto flex w-full max-w-7xl flex-col justify-end px-5 pb-20 pt-36 text-white md:px-8 lg:min-h-screen lg:pb-24"
      >
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/70">
          Curated thrift and streetwear
        </p>
        <h1 className="mt-5 max-w-5xl text-5xl font-black uppercase leading-[0.9] tracking-tight sm:text-6xl md:text-8xl">
          Vintage & Thrift Finds
        </h1>
        <p className="mt-6 max-w-2xl text-sm leading-7 text-white/75 md:text-base">
          One-of-one pieces, clean staples, and brand drops picked for daily wear.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => openShop("All", "All", "All")}
            className="inline-flex items-center gap-3 bg-white px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-black transition hover:bg-zinc-200"
          >
            Shop Now <ArrowRight size={15} />
          </button>

          {quickLinks.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => openShop("All", link.category, "All")}
              className="border border-white/30 px-5 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white transition hover:border-white hover:bg-white hover:text-black"
            >
              {link.label}
            </button>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
