import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, LogOut, Menu, Search, ShoppingCart, User, X, Package2 } from "lucide-react";
import { useAuth } from "../../features/auth/AuthContext";
import logo from "../../assets/flogo.png";

const CATEGORY_DATA = {
  Men: {
    Clothing: ["T-Shirts", "Hoodies", "Pants", "Jackets", "Tracksuits"],
    Shoes: ["Lifestyle", "Running", "Basketball", "Training"],
    Accessories: ["Bags", "Caps", "Socks", "Watches"],
  },
  Women: {
    Clothing: ["Tops", "Dresses", "Leggings", "Outerwear", "Skirts"],
    Shoes: ["Lifestyle", "Running", "Training", "Sandals"],
    Accessories: ["Handbags", "Jewelry", "Socks", "Headwear"],
  },
  Kids: {
    Clothing: ["T-Shirts", "Sets", "Jackets", "Pants"],
    Shoes: ["Lifestyle", "Running", "Sandals"],
  },
  Shoes: {
    Categories: ["Lifestyle", "Running", "Basketball", "Training", "Football", "Skateboarding"],
    Brands: ["Nike", "Adidas", "New Balance", "Vans", "Converse"],
  },
  Sale: {
    Offers: ["Clearance", "Last Chance", "Seasonal Sale", "Flash Sale"],
    Discounts: ["20% Off", "30% Off", "50% Off"],
  },
};

const NAV_ITEMS = Object.keys(CATEGORY_DATA);

function Header({ cartItems = [], wishlistCount = 0, openCartModal, openShop, refreshPage, handleSearch, openTrackingModal }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const controlHeader = () => {
      setIsScrolled(window.scrollY > 20);

      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setIsVisible(false);
        setActiveDropdown(null);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", controlHeader);
    return () => window.removeEventListener("scroll", controlHeader);
  }, [lastScrollY]);

  const runSearch = () => {
    const query = searchQuery.trim();

    if (!query) {
      setIsSearchOpen((open) => !open);
      return;
    }

    handleSearch(query);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleSearchKey = (e) => {
    if (e.key === "Enter") runSearch();
    if (e.key === "Escape") setIsSearchOpen(false);
  };

  const handleCategoryClick = (category, subCategory = "All", brand = "All") => {
    openShop(brand, category, subCategory);
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
    navigate("/");
  };

  const avatarSrc =
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || "Admin")}&background=000&color=fff`;
  const cartCount = cartItems.reduce((total, item) => total + Number(item.quantity || 1), 0);

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 border-b ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        } ${
          isScrolled || activeDropdown || mobileMenuOpen
            ? "bg-black border-white/10 py-2"
            : "bg-black/30 border-transparent py-4 backdrop-blur-sm"
        }`}
        onMouseLeave={() => setActiveDropdown(null)}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16 md:h-20">
          <button type="button" onClick={refreshPage} className="active:scale-95 transition" aria-label="Go home">
            <img src={logo} alt="JThrift" className="h-10 md:h-14" />
          </button>

          <nav className="hidden lg:flex font-black space-x-10">
            {NAV_ITEMS.map((item) => (
              <button
                key={item}
                type="button"
                onMouseEnter={() => setActiveDropdown(item)}
                onClick={() => handleCategoryClick(item)}
                className="relative text-[11px] uppercase tracking-[0.3em] text-white group py-4"
              >
                {item}
                <span
                  className={`absolute left-0 bottom-2 h-0.5 bg-white transition-all ${
                    activeDropdown === item ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4 sm:gap-6 text-white">
            <div className="relative flex items-center">
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "min(58vw, 260px)", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="flex items-center bg-white/10 rounded-full px-4 py-1.5 border border-white/20 mr-2"
                  >
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearchKey}
                      placeholder="Search products"
                      className="bg-transparent w-full text-[11px] outline-none uppercase tracking-widest placeholder:text-white/50"
                      autoFocus
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <button type="button" onClick={runSearch} className="hover:scale-110 transition" aria-label="Search">
                <Search size={20} />
              </button>
            </div>

            {user ? (
              <div className="relative hidden sm:block">
                <button type="button" onClick={() => setProfileOpen((open) => !open)}>
                  <img src={avatarSrc} alt="User avatar" className="w-8 h-8 rounded-full border border-white/20" />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-3 w-52 bg-black border border-white/10 rounded-xl shadow-xl overflow-hidden"
                    >
                      {user.role === "admin" && (
                        <button
                          type="button"
                          onClick={() => navigate("/admin")}
                          className="block w-full text-left px-4 py-3 hover:bg-white/10"
                        >
                          Admin Dashboard
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-3 text-red-400 hover:bg-white/10"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="hidden sm:block hover:scale-110 transition"
                aria-label="Login"
              >
                <User size={20} />
              </button>
            )}

            <div className="relative hidden sm:block" aria-label="Wishlist count">
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-[9px] rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </div>

            <button type="button" className="relative hover:scale-110 transition" onClick={openCartModal} aria-label="Open cart">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-[9px] rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              className="relative hover:scale-110 transition"
              onClick={openTrackingModal}
              aria-label="Track Order"
            >
              <Package2 size={20} />
            </button>

            <button type="button" className="lg:hidden" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
              <Menu size={24} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {activeDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="hidden lg:block border-t border-white/10 bg-black text-white"
            >
              <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-4 gap-8">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/50 mb-3">Explore</p>
                  <button
                    type="button"
                    onClick={() => handleCategoryClick(activeDropdown)}
                    className="text-2xl font-black uppercase tracking-tight hover:text-white/70"
                  >
                    All {activeDropdown}
                  </button>
                </div>

                {Object.entries(CATEGORY_DATA[activeDropdown]).map(([group, items]) => (
                  <div key={group}>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/50 mb-3">{group}</p>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() =>
                            group === "Brands"
                              ? handleCategoryClick("All", "All", item)
                              : handleCategoryClick(activeDropdown, item)
                          }
                          className="block text-sm text-white/80 hover:text-white"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            className="fixed inset-0 z-[200] bg-black text-white lg:hidden overflow-y-auto"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <img src={logo} alt="JThrift" className="h-10" />
              <button type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                <X size={24} />
              </button>
            </div>

            <div className="p-5 space-y-6">
              {NAV_ITEMS.map((category) => (
                <div key={category} className="border-b border-white/10 pb-5">
                  <button type="button" onClick={() => handleCategoryClick(category)} className="text-xl font-black uppercase">
                    {category}
                  </button>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {Object.values(CATEGORY_DATA[category]).flat().slice(0, 8).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleCategoryClick(category, item)}
                        className="text-left text-sm text-white/70 py-1"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {!user && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/login");
                  }}
                  className="w-full bg-white text-black py-3 font-bold uppercase text-sm"
                >
                  Login
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Header;
