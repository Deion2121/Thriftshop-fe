import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Sparkles } from "lucide-react";
import clip from "../../assets/clip.mp4";

const quickLinks = [
  { label: "Men", category: "Men" },
  { label: "Women", category: "Women" },
  { label: "Shoes", category: "Shoes" },
  { label: "Sale", category: "Sale" },
];

const heroStats = [
  { value: "1/1", label: "Unique finds" },
  { value: "24h", label: "Fast dispatch" },
  { value: "QC", label: "Quality checked" },
];

const Hero = ({ openShop }) => {
  return (
    <section className="relative flex min-h-screen items-end overflow-hidden bg-black">
      <video
        src={clip}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover opacity-85"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_28%,rgba(255,255,255,0.2),transparent_26%),linear-gradient(90deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.62)_43%,rgba(0,0,0,0.2)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black via-black/70 to-transparent" />
      <div className="absolute left-0 top-24 hidden h-px w-1/3 bg-white/30 lg:block" />

      <motion.div
        initial={{ opacity: 0, y: 34 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 px-5 pb-12 pt-36 text-white md:px-8 md:pb-16 lg:min-h-screen lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end lg:pb-24"
      >
        <div>
          <div className="inline-flex items-center gap-2 border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-md">
            <p className="text-white" />
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/80">
              Thrifted heat, no repeats
            </p>
          </div>

          <h1 className="mt-6 max-w-5xl text-5xl font-black uppercase leading-[0.84] tracking-tight sm:text-7xl md:text-8xl lg:text-9xl">
            Vintage Archives
          </h1>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-white/78 md:text-base">
            Vintage gems, branded staples, and streetwear pieces picked to upgrade
            your rotation. If it hits, do not sleep on it.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => openShop("All", "All", "All")}
              className="group inline-flex min-h-14 items-center gap-3 bg-white px-7 text-[11px] font-black uppercase tracking-[0.2em] text-black shadow-2xl shadow-black/30 transition hover:bg-zinc-200"
            >
              Shop Now
              <ArrowRight size={16} className="transition group-hover:translate-x-1" />
            </button>

            <div className="flex flex-wrap gap-2">
              {quickLinks.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => openShop("All", link.category, "All")}
                  className="min-h-12 border border-white/25 bg-white/[0.06] px-5 text-[11px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-md transition hover:border-white hover:bg-white hover:text-black"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-12 grid max-w-2xl grid-cols-3 border-y border-white/15">
            {heroStats.map((stat) => (
              <div key={stat.label} className="border-r border-white/15 py-4 pr-4 last:border-r-0 sm:pr-6">
                <p className="text-2xl font-black italic tracking-tight sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <motion.aside
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: "easeOut" }}
          className="hidden border border-white/15 bg-black/35 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl lg:block"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">
              This week
            </p>
            <BadgeCheck size={18} className="text-white/70" />
          </div>

          <div className="py-6">
            <p className="text-3xl font-black uppercase leading-none tracking-tight">
              New drops just landed
            </p>
            <p className="mt-4 text-sm leading-6 text-white/65">
              Graphic tees, cargos, sneakers, and outerwear with that already-found-it energy.
            </p>
          </div>
          <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-5 text-white/65">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em]">
              Local delivery and pickup ready
            </p>
          </div>
        </motion.aside>
      </motion.div>
    </section>
  );
};

export default Hero;
