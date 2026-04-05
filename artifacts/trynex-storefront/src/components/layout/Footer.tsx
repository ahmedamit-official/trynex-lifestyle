import { Link, useLocation } from "wouter";
import { Facebook, Instagram, Mail, MapPin, Phone, Truck, ShieldCheck, Clock, Youtube, Heart, ExternalLink } from "lucide-react";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";

const PAYMENT_ICONS = [
  { name: "bKash", color: "#e2136e" },
  { name: "Nagad", color: "#f7941d" },
  { name: "Rocket", color: "#8b2291" },
  { name: "Cash", color: "#4ade80" },
];

export function Footer() {
  const [, setLocation] = useLocation();
  const [tapCount, setTapCount] = useState(0);
  const [tapTimer, setTapTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [tapFeedback, setTapFeedback] = useState(false);

  const handleSecretTap = useCallback(() => {
    setTapFeedback(true);
    setTimeout(() => setTapFeedback(false), 200);
    setTapCount(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setTimeout(() => setLocation("/admin/login"), 100);
        return 0;
      }
      return next;
    });
    if (tapTimer) clearTimeout(tapTimer);
    const t = setTimeout(() => setTapCount(0), 3000);
    setTapTimer(t);
  }, [tapTimer, setLocation]);

  return (
    <footer style={{ background: 'hsl(0 0% 3%)' }} className="text-foreground/60 overflow-hidden relative">
      {/* Top Glow Border */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,107,43,0.6) 30%, rgba(255,152,64,0.4) 50%, rgba(255,107,43,0.6) 70%, transparent 100%)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Trust Signals */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-12 border-b border-white/5">
          {[
            { icon: Truck, title: "Nationwide Delivery", desc: "Fast shipping across all 64 districts of Bangladesh", color: "#60a5fa" },
            { icon: ShieldCheck, title: "Premium Quality", desc: "Guaranteed 230-320GSM fabric & vibrant lasting prints", color: "#4ade80" },
            { icon: Clock, title: "24/7 Support", desc: "Always here to help — WhatsApp, Call or Email", color: "hsl(var(--primary))" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                whileHover={{ y: -3 }}
                className="flex items-center gap-4 p-4 rounded-2xl transition-colors"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: `${item.color}12`, border: `1px solid ${item.color}20` }}>
                  <Icon className="w-5.5 h-5.5" style={{ color: item.color }} />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm mb-0.5">{item.title}</h4>
                  <p className="text-xs text-foreground/35 leading-snug">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Main Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 py-16">

          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block mb-5 group">
              <span className="text-3xl font-black font-display tracking-tighter text-foreground group-hover:opacity-90 transition-opacity">
                TRY<span className="text-gradient">NEX</span>
                <span className="block text-xs font-semibold text-foreground/25 tracking-[0.2em] uppercase mt-1">Lifestyle</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-foreground/40 mb-7 max-w-xs">
              You imagine, we craft. Bangladesh's premier custom apparel brand — premium fabrics, bold designs, fast delivery.
            </p>

            {/* Social Links */}
            <div className="flex gap-2.5 mb-8">
              {[
                { Icon: Facebook, href: "#", label: "Facebook" },
                { Icon: Instagram, href: "#", label: "Instagram" },
                { Icon: Youtube, href: "#", label: "YouTube" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:text-primary hover:border-primary/30 hover:-translate-y-1"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            {/* Payment Methods */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/25 mb-3">We Accept</p>
              <div className="flex flex-wrap gap-2">
                {PAYMENT_ICONS.map(p => (
                  <div key={p.name}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-black"
                    style={{ background: `${p.color}15`, border: `1px solid ${p.color}25`, color: p.color }}>
                    {p.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shop */}
          <div className="lg:col-span-2">
            <h4 className="font-black text-foreground mb-6 text-xs uppercase tracking-widest">Shop</h4>
            <ul className="space-y-3.5">
              {[
                { label: "All Products", href: "/products" },
                { label: "T-Shirts", href: "/products" },
                { label: "Hoodies", href: "/products" },
                { label: "Caps & Hats", href: "/products" },
                { label: "Custom Orders", href: "/products" },
                { label: "Jackets", href: "/products" },
              ].map(l => (
                <li key={l.label}>
                  <Link href={l.href}
                    className="text-sm text-foreground/40 hover:text-primary transition-colors duration-200 animated-underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div className="lg:col-span-2">
            <h4 className="font-black text-foreground mb-6 text-xs uppercase tracking-widest">Help</h4>
            <ul className="space-y-3.5">
              {[
                { label: "Track Order", href: "/track" },
                { label: "Size Guide", href: "#" },
                { label: "Return Policy", href: "#" },
                { label: "FAQ", href: "#" },
                { label: "About Us", href: "#" },
                { label: "Contact Us", href: "#" },
              ].map(l => (
                <li key={l.label}>
                  <Link href={l.href}
                    className="text-sm text-foreground/40 hover:text-primary transition-colors duration-200 animated-underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-4">
            <h4 className="font-black text-foreground mb-6 text-xs uppercase tracking-widest">Get In Touch</h4>
            <ul className="space-y-4 mb-6">
              <li className="flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                  style={{ background: 'rgba(255,107,43,0.08)', border: '1px solid rgba(255,107,43,0.15)' }}>
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm text-foreground/40 leading-snug">Banani, Dhaka-1213<br />Bangladesh</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(255,107,43,0.08)', border: '1px solid rgba(255,107,43,0.15)' }}>
                  <Phone className="w-3.5 h-3.5 text-primary" />
                </div>
                <a href="tel:+8801903426915" className="text-sm text-foreground/40 hover:text-primary transition-colors">01903426915</a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(255,107,43,0.08)', border: '1px solid rgba(255,107,43,0.15)' }}>
                  <Mail className="w-3.5 h-3.5 text-primary" />
                </div>
                <a href="mailto:hello@trynex.com" className="text-sm text-foreground/40 hover:text-primary transition-colors">hello@trynex.com</a>
              </li>
            </ul>

            {/* CTA */}
            <Link href="/products"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white text-xs transition-all hover:-translate-y-0.5"
              style={{ background: 'hsl(var(--primary))', boxShadow: '0 6px 24px rgba(255,107,43,0.35)' }}>
              Shop Now <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-foreground/25 flex items-center gap-1.5">
            © {new Date().getFullYear()} TryNex Lifestyle. Made with <Heart className="w-3 h-3 text-primary fill-primary" /> in Bangladesh.
          </p>
          <div className="flex items-center gap-6 text-xs text-foreground/25">
            <span className="hover:text-foreground/40 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-foreground/40 cursor-pointer transition-colors">Terms of Service</span>
            {/* Secret admin shortcut — invisible dot, activated by 5 taps */}
            <button
              onClick={handleSecretTap}
              className="select-none transition-all duration-150"
              aria-hidden="true"
              tabIndex={-1}
              style={{
                opacity: tapFeedback ? 0.15 : 0.06,
                fontSize: '1.1rem',
                fontFamily: 'display',
                fontWeight: 900,
                letterSpacing: '-0.05em',
                color: 'rgba(255,107,43,0.8)',
                cursor: 'default',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                transition: 'opacity 0.15s ease'
              }}
              title=""
            >
              ✦
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
