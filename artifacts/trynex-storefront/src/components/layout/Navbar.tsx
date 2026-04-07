import { Link, useLocation } from "wouter";
import { Menu, X, ChevronDown, Heart, ShoppingCart, Search } from "lucide-react";
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
  const [shopOpen, setShopOpen] = useState(false);
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 12);
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

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

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
          ? "bg-white/[0.97] backdrop-blur-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(232,93,4,0.06)]"
          : "bg-white/95 backdrop-blur-lg",
      )}
      style={{ top: 'var(--announcement-height, 0px)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[4.25rem]">

          <Link href="/" className="flex items-center gap-3 group select-none">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black font-display text-lg shadow-lg transition-transform group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #E85D04, #FB8500)', boxShadow: '0 4px 14px rgba(232,93,4,0.35)' }}
            >
              T
            </div>
            <div className="flex flex-col leading-none gap-[3px]">
              <span className="text-[1.35rem] font-black font-display tracking-tight text-gray-900 group-hover:text-orange-600 transition-colors">
                TRY<span style={{ color: '#E85D04' }}>NEX</span>
              </span>
              <span className="text-[9px] font-bold text-gray-400 tracking-[0.25em] uppercase">Lifestyle</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center">
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
                      "flex items-center gap-1 px-4 py-2 rounded-full font-semibold text-[0.8125rem] transition-all",
                      location === link.href
                        ? "text-orange-600 bg-orange-50"
                        : "text-gray-600 hover:text-orange-600 hover:bg-orange-50/60"
                    )}
                  >
                    {link.label}
                    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", shopOpen && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {shopOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden p-1.5 z-50"
                      >
                        {SHOP_CATEGORIES.map((cat) => (
                          <Link
                            key={cat.label}
                            href={cat.href}
                            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[0.8125rem] font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
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
                    "px-4 py-2 rounded-full font-semibold text-[0.8125rem] transition-all",
                    location === link.href
                      ? "text-orange-600 bg-orange-50"
                      : "text-gray-600 hover:text-orange-600 hover:bg-orange-50/60"
                  )}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          <div className="flex items-center gap-1.5">
            <Link
              href="/wishlist"
              className="relative hidden sm:flex items-center justify-center w-10 h-10 rounded-full text-gray-500 hover:text-orange-600 hover:bg-orange-50/60 transition-all"
            >
              <Heart className="w-[1.15rem] h-[1.15rem]" />
              {wishlistCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-[1.15rem] h-[1.15rem] text-[9px] font-black text-white rounded-full flex items-center justify-center ring-2 ring-white"
                  style={{ background: '#E85D04' }}
                >
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className={cn(
                "relative flex items-center gap-2 rounded-full font-bold text-[0.8125rem] transition-all",
                itemCount > 0
                  ? "text-white px-5 py-2.5"
                  : "text-gray-600 px-4 py-2.5 border border-gray-200 bg-white hover:border-orange-300 hover:text-orange-600"
              )}
              style={itemCount > 0 ? {
                background: 'linear-gradient(135deg, #E85D04, #FB8500)',
                boxShadow: '0 4px 16px rgba(232,93,4,0.3)'
              } : undefined}
            >
              <ShoppingCart className="w-[1.05rem] h-[1.05rem]" />
              <span className="hidden sm:inline">
                {itemCount > 0 ? `Cart (${itemCount})` : "Cart"}
              </span>
              {itemCount > 0 && <span className="sm:hidden font-black text-xs">{itemCount}</span>}
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-full text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-all"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="md:hidden overflow-hidden bg-white border-t border-gray-100"
          >
            <div className="px-5 py-5 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center px-4 py-3.5 rounded-2xl font-semibold text-[0.9375rem] transition-all",
                    location === link.href
                      ? "text-orange-600 bg-orange-50"
                      : "text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 mt-3 border-t border-gray-100 space-y-1">
                <Link
                  href="/wishlist"
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold text-[0.9375rem] text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-all"
                >
                  <Heart className="w-4.5 h-4.5" style={{ width: '1.1rem', height: '1.1rem' }} />
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
