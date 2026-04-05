import { Link, useLocation } from "wouter";
import { ShoppingBag, Menu, X, ChevronDown, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [location] = useLocation();
  const { itemCount } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 40);
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      setScrollProgress(total > 0 ? (y / total) * 100 : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop All", href: "/products" },
    { name: "Blog", href: "/blog" },
    { name: "Track Order", href: "/track" },
  ];

  return (
    <>
      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 z-[60] h-[2px] bg-primary transition-all duration-100"
        style={{ width: `${scrollProgress}%`, boxShadow: '0 0 8px rgba(255,107,43,0.6)' }} />

      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "py-3 shadow-2xl shadow-black/60"
          : "bg-transparent py-5"
      )}
        style={isScrolled ? {
          background: 'rgba(6,6,6,0.92)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        } : {}}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 text-foreground/70 hover:text-primary transition-colors lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-0 group">
            <span className="text-2xl font-black font-display tracking-tighter group-hover:opacity-90 transition-opacity">
              <span className="text-foreground">TRY</span>
              <span className="text-gradient">NEX</span>
            </span>
            <span className="ml-2 text-[9px] font-bold uppercase tracking-[0.2em] text-foreground/25 hidden sm:block self-end mb-0.5">Lifestyle</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-250 group",
                  location === link.href
                    ? "text-primary"
                    : "text-foreground/55 hover:text-foreground"
                )}
              >
                {link.name}
                {location === link.href && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'rgba(255,107,43,0.1)', border: '1px solid rgba(255,107,43,0.2)' }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                {location !== link.href && (
                  <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(255,255,255,0.04)' }} />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            <Link
              href="/cart"
              className="relative p-2.5 text-foreground/65 hover:text-primary transition-colors group"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", bounce: 0.6 }}
                    className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 text-white text-[9px] font-black rounded-full flex items-center justify-center"
                    style={{ background: 'hsl(var(--primary))', boxShadow: '0 2px 8px rgba(255,107,43,0.5)' }}
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            <Link
              href="/products"
              className="hidden sm:flex btn-glow items-center gap-2 ml-2 px-4 py-2 rounded-xl font-bold text-white text-xs"
              style={{ background: 'hsl(var(--primary))', boxShadow: '0 4px 20px rgba(255,107,43,0.35)' }}
            >
              Shop Now
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 lg:hidden"
              style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 250 }}
              className="fixed top-0 left-0 bottom-0 w-[82%] max-w-sm z-50 flex flex-col lg:hidden"
              style={{ background: 'hsl(0 0% 5%)', borderRight: '1px solid rgba(255,255,255,0.07)' }}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-white/5">
                <Link href="/" className="text-2xl font-black font-display tracking-tighter" onClick={() => setMobileMenuOpen(false)}>
                  TRY<span className="text-gradient">NEX</span>
                </Link>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-foreground/40 hover:text-foreground rounded-xl transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Nav */}
              <nav className="flex-1 flex flex-col p-5 gap-1.5 overflow-y-auto">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center px-4 py-3.5 rounded-2xl font-semibold text-base transition-all duration-200",
                        location === link.href
                          ? "text-primary"
                          : "text-foreground/55 hover:text-foreground hover:bg-white/5"
                      )}
                      style={location === link.href ? {
                        background: 'rgba(255,107,43,0.1)',
                        border: '1px solid rgba(255,107,43,0.2)'
                      } : {}}
                    >
                      {link.name}
                      {location === link.href && <span className="ml-auto text-primary/60 text-xs">●</span>}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Bottom */}
              <div className="p-5 border-t border-white/5 space-y-3">
                <Link
                  href="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold text-foreground/55 hover:text-foreground hover:bg-white/5 transition-all"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Cart
                  {itemCount > 0 && (
                    <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-black text-white"
                      style={{ background: 'hsl(var(--primary))' }}>{itemCount}</span>
                  )}
                </Link>
                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-glow flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-bold text-white text-sm"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), rgba(255,152,64,1))' }}
                >
                  Shop Collection
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
