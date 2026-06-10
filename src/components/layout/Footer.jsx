import React from "react";

const Footer = () => {
  return (
    <footer className="bg-black text-white dark:border-t dark:border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-black uppercase tracking-tight">JThrift</p>
          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-white/50">
            Curated vintage and streetwear finds
          </p>
        </div>
        <p className="text-xs text-white/50">
          Copyright {new Date().getFullYear()} JTFT. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
