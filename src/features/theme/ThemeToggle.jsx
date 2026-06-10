import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeContext";

const ThemeToggle = ({ className = "" }) => {
  const { isDark, toggleTheme } = useTheme();
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      aria-pressed={isDark}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:scale-110 hover:bg-white hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 dark:border-white/15 dark:bg-white/10 ${className}`}
    >
      <Icon size={18} />
    </button>
  );
};

export default ThemeToggle;
