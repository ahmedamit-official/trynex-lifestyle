import { Link, useLocation } from "wouter";
import { ShoppingBag, Menu, X, ChevronDown, Heart, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const SHOP_CATEGORIES = [
  { label: "All Products", href: "/products", emoji: "🛍️" },
  { label: "T-Shirts", href: "/products", emoji: "👕" },
  { label: "Hoodies", href: "/products", emoji: "🧥" },
  { label: "Caps", href: "/products", emoji: "🧢" },
  { label: "Mugs", href: "/products", emoji: "☕" },
  { label: "Custom Orders", href: "/products", emoji: "✨" },
];

export function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 12);
        if (y > 80) {
          if (y > lastY) {
            setHidden(true);
          } else if (y < lastY) {
            setHidden(false);
          }
        } else {
          setHidden(false);
        }
        lastY = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setShopOpen(false);
  }, [location]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Shop", dropdown: true },
    { href: "/blog", label: "Blog" },
    { href: "/track", label: "Track Order" },
  ];

  return (
    <header
      className={cn(
        "fixed left-0 right-0 z-40 transition-all duration-300",
        scrolled
          ? "bg-white/98 backdrop-blur-xl shadow-md shadow-orange-100/50 border-b border-orange-100"
          : "bg-white/95 backdrop-blur-md",
        hidden && !mobileOpen && "pointer-events-none"
      )}
      style={{
        top: 'var(--announcement-height, 0px)',
        transform: hidden && !mobileOpen ? 'translateY(-100%)' : 'translateY(0)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black font-display text-base shadow-lg"
              style={{ background: 'linear-gradient(135deg, #E85D04, #FB8500)', boxShadow: '0 4px 12px rgba(232,93,4,0.35)' }}
            >
              T
            </div>
            <div className="flex flex-col leading-none gap-0.5">
              <span className="text-xl font-black font-display tracking-tight text-gray-900 group-hover:text-orange-600 transition-colors">
                TRY<span style={{ color: '#E85D04' }}>NEX</span>
              </span>
              <span className="text-[9px] font-bold text-gray-400 tracking-[0.2em] uppercase">Lifestyle</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) =>
              link.dropdown ? (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => setShopOpen(true)}
                  onMouseLeave={() => setShopOpen(false)}
                >
                  <button
                    className={cn(
                      "flex items-center gap-1 px-4 py-2 rounded-xl font-semibold text-sm transition-all",
                      location === link.href
                        ? "text-orange-600 bg-orange-50"
                        : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                    )}
                  >
                    {link.label}
                    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", shopOpen && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {shopOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden p-2 z-50"
                      >
                        {SHOP_CATEGORIES.map((cat) => (
                          <Link
                            key={cat.label}
                            href={cat.href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          >
                            <span className="text-base">{cat.emoji}</span>
                            {cat.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-xl font-semibold text-sm transition-all",
                    location === link.href
                      ? "text-orange-600 bg-orange-50"
                      : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                  )}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative hidden sm:flex items-center p-2.5 rounded-xl text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition-all"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-[1.1rem] h-[1.1rem] text-[9px] font-black text-white rounded-full flex items-center justify-center"
                  style={{ background: '#E85D04' }}
                >
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className={cn(
                "relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all",
                itemCount > 0
                  ? "text-white"
                  : "text-gray-600 border border-gray-200 bg-white hover:border-orange-300 hover:text-orange-600"
              )}
              style={itemCount > 0 ? {
                background: 'linear-gradient(135deg, #E85D04, #FB8500)',
                boxShadow: '0 4px 16px rgba(232,93,4,0.3)'
              } : undefined}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">
                {itemCount > 0 ? `Cart (${itemCount})` : "Cart"}
              </span>
              {itemCount > 0 && <span className="sm:hidden font-black text-xs">{itemCount}</span>}
            </Link>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 rounded-xl text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition-all"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-white border-t border-gray-100"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-xl font-semibold text-sm transition-all",
                    location === link.href
                      ? "text-orange-600 bg-orange-50"
                      : "text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 mt-2 border-t border-gray-100">
                <Link
                  href="/wishlist"
                  className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-all"
                >
                  <Heart className="w-4 h-4" />
                  Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
