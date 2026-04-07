import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Loader } from "@/components/ui/Loader";
import { SEOHead } from "@/components/SEOHead";
import { useListProducts } from "@workspace/api-client-react";
import {
  ArrowRight, Sparkles, Zap, Package, Star, Check, Truck,
  ShieldCheck, Clock, Palette, Layers, Award, ChevronRight,
  Users, BadgeCheck, Flame, Timer
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const MARQUEE_ITEMS = [
  "PREMIUM QUALITY", "CUSTOM DESIGNS", "FAST DELIVERY", "MADE IN BANGLADESH",
  "YOU IMAGINE WE CRAFT", "LIMITED EDITION", "EXCLUSIVE DROPS", "100% AUTHENTIC",
  "PREMIUM 320GSM FABRIC", "BEST PRICE IN BD"
];

const FEATURES = [
  {
    icon: Palette,
    title: "100% Custom Design",
    desc: "Every piece crafted to your exact vision — from concept sketch to wearable masterpiece, delivered to your door.",
    color: "#E85D04",
    bg: "#fff4ee",
    badge: "Unlimited Creativity"
  },
  {
    icon: Zap,
    title: "48-Hour Express",
    desc: "Lightning-fast production with nationwide delivery across all 64 districts. Speed meets premium quality.",
    color: "#2563eb",
    bg: "#eff6ff",
    badge: "Super Fast"
  },
  {
    icon: Layers,
    title: "Premium Materials",
    desc: "We source only the finest 230-320GSM fabrics. Vibrant colors, sharp prints, lasting comfort — every time.",
    color: "#16a34a",
    bg: "#f0fdf4",
    badge: "Top Grade"
  },
];

const PROCESS = [
  { step: "01", title: "Choose & Design", desc: "Pick your product and share your design — or let our team help create something incredible.", icon: "🎨" },
  { step: "02", title: "We Craft It", desc: "Our artisans use premium fabrics and state-of-the-art printing to bring your vision to life.", icon: "⚡" },
  { step: "03", title: "Fast Delivery", desc: "Packed with care, delivered express anywhere in Bangladesh within 3-7 business days.", icon: "🚀" },
];

const TESTIMONIALS = [
  {
    name: "Rakib Hasan", role: "Fashion Influencer", stars: 5,
    text: "TryNex is literally the best custom apparel brand in BD. The hoodie quality is insane — thick, premium, and the print doesn't fade. 10/10!",
    location: "Dhaka"
  },
  {
    name: "Mithila Chowdhury", role: "Small Business Owner", stars: 5,
    text: "Ordered 50 custom tees for my brand launch. Every single one was perfect. The colors were exactly what I wanted. Will order again!",
    location: "Chittagong"
  },
  {
    name: "Farhan Ahmed", role: "University Student", stars: 5,
    text: "Got a custom hoodie for my crew. Everyone was shocked at how premium it felt. The delivery was super fast too. Highly recommend!",
    location: "Sylhet"
  },
  {
    name: "Nadia Islam", role: "Corporate Manager", stars: 5,
    text: "We use TryNex for all our company merch now. Professional quality, great service, and the best prices in Bangladesh. Absolutely love it!",
    location: "Rajshahi"
  },
];

const STATS = [
  { value: "5K+", label: "Happy Customers", icon: "😊", color: "#E85D04" },
  { value: "98%", label: "Satisfaction Rate", icon: "⭐", color: "#eab308" },
  { value: "48h", label: "Production Time", icon: "⚡", color: "#2563eb" },
  { value: "64", label: "Districts Served", icon: "🗺️", color: "#16a34a" },
];

const CATEGORIES = [
  { name: "T-Shirts", emoji: "👕", desc: "Premium custom tees", count: "Starting ৳599", color: "#fff4ee", accent: "#E85D04" },
  { name: "Hoodies", emoji: "🧥", desc: "320GSM premium fleece", count: "Starting ৳1,299", color: "#eff6ff", accent: "#2563eb" },
  { name: "Caps", emoji: "🧢", desc: "Embroidered & printed", count: "Starting ৳499", color: "#f0fdf4", accent: "#16a34a" },
  { name: "Mugs", emoji: "☕", desc: "Ceramic & sublimation", count: "Starting ৳399", color: "#fdf4ff", accent: "#9333ea" },
  { name: "Custom", emoji: "✨", desc: "Anything you imagine", count: "Get a quote", color: "#fffbeb", accent: "#d97706" },
];

const SALE_END_OFFSET = 5 * 3600000 + 30 * 60000;

function CountdownTimer() {
  const [saleEnd] = useState(() => new Date(Date.now() + SALE_END_OFFSET));
  const [timeLeft, setTimeLeft] = useState({ h: 5, m: 30, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, saleEnd.getTime() - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [saleEnd]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-2">
      {[{ v: timeLeft.h, l: "HRS" }, { v: timeLeft.m, l: "MIN" }, { v: timeLeft.s, l: "SEC" }].map(({ v, l }, i) => (
        <div key={l} className="flex items-center gap-2">
          <div className="text-center">
            <div className="px-3 py-2 rounded-xl font-black text-white text-xl min-w-[3rem] text-center"
              style={{ background: 'linear-gradient(135deg, #E85D04, #FB8500)', boxShadow: '0 4px 12px rgba(232,93,4,0.4)' }}>
              {pad(v)}
            </div>
            <p className="text-[9px] font-bold text-gray-400 mt-1 tracking-widest">{l}</p>
          </div>
          {i < 2 && <span className="text-orange-500 font-black text-xl mb-4">:</span>}
        </div>
      ))}
    </div>
  );
}

function AnimatedCounter({ target, duration = 2000 }: { target: string, duration?: number }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting && !started) setStarted(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const numPart = parseFloat(target.replace(/[^0-9.]/g, ""));
    const suffix = target.replace(/[0-9.]/g, "");
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * numPart * 10) / 10;
      setDisplay(current % 1 === 0 ? Math.round(current) + suffix : current + suffix);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, target, duration]);

  return <div ref={ref}>{display}</div>;
}

export default function Home() {
  const { data: productsData, isLoading } = useListProducts({ limit: 8, featured: true });
  const featuredProducts = productsData?.products || [];
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEOHead
        canonical="/"
        keywords="custom t-shirt bangladesh, custom hoodie bd, premium apparel bangladesh, trynex lifestyle, custom printing dhaka, corporate gift bangladesh, custom mug bd"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "OnlineStore",
            "name": "TryNex Lifestyle",
            "url": "https://trynex.com.bd",
            "description": "Bangladesh's #1 premium custom apparel brand. Custom T-shirts, Hoodies, Mugs & Caps.",
            "areaServed": { "@type": "Country", "name": "Bangladesh" },
            "currenciesAccepted": "BDT",
            "paymentAccepted": "Cash on Delivery, bKash, Nagad, Rocket",
            "priceRange": "৳399 - ৳3,999",
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "TryNex Lifestyle",
            "url": "https://trynex.com.bd",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://trynex.com.bd/products?search={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          },
        ]}
      />
      <Navbar />

      {/* ═══════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative flex items-center justify-center overflow-hidden"
        style={{ paddingTop: 'calc(var(--announcement-height, 0px) + 4rem)', paddingBottom: '3rem', minHeight: '85vh' }}
      >
        {/* Warm gradient background */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #FFFDF8 0%, #FFF4EA 40%, #FFEEDD 100%)' }} />

        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-30"
            style={{ background: 'radial-gradient(circle, rgba(251,133,0,0.4), transparent)' }} />
          <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full blur-3xl opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(232,93,4,0.3), transparent)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-10"
            style={{ background: 'radial-gradient(circle, rgba(232,93,4,0.5), transparent)' }} />
        </div>

        {/* Dot grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #E85D04 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <motion.div
          style={{ y: heroY }}
          className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto"
        >
          {/* Launch badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #fff4ee, #ffe8d4)', color: '#E85D04', border: '1.5px solid #fdd5b4' }}
          >
            <Flame className="w-4 h-4" />
            Bangladesh's #1 Custom Apparel Brand
            <span className="px-2 py-0.5 rounded-full text-xs text-white font-black"
              style={{ background: '#E85D04' }}>NEW</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display font-black leading-tight mb-6 text-gray-900"
            style={{ fontSize: 'clamp(3rem, 9vw, 6rem)', letterSpacing: '-0.03em' }}
          >
            You Imagine,
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #E85D04 0%, #FB8500 50%, #E85D04 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              We Craft.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Premium custom T-shirts, Hoodies, Mugs & Caps delivered across all 64 districts of Bangladesh.
            Starting from just <strong className="text-gray-800">৳399</strong>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-14"
          >
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2.5 px-10 py-4 rounded-2xl font-bold text-white text-lg transition-all hover:-translate-y-1"
              style={{
                background: 'linear-gradient(135deg, #E85D04, #FB8500)',
                boxShadow: '0 8px 32px rgba(232,93,4,0.4)'
              }}
            >
              Shop Now <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/track"
              className="inline-flex items-center justify-center gap-2.5 px-10 py-4 rounded-2xl font-bold text-gray-700 text-lg transition-all hover:border-orange-400 hover:text-orange-600"
              style={{ background: 'white', border: '2px solid #e5e7eb' }}
            >
              Track Order
            </Link>
          </motion.div>

          {/* Trust micro-badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500"
          >
            {[
              { icon: "🚚", text: "Free Shipping above ৳1,500" },
              { icon: "⚡", text: "48h Production" },
              { icon: "✅", text: "100% Satisfaction" },
              { icon: "💳", text: "bKash • Nagad • COD" },
            ].map(({ icon, text }) => (
              <span key={text} className="flex items-center gap-2 font-semibold">
                <span>{icon}</span>
                <span>{text}</span>
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-400 text-xs flex flex-col items-center gap-1"
        >
          <div className="w-5 h-8 rounded-full border-2 border-gray-300 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-orange-400"></div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════
          MARQUEE TICKER
      ═══════════════════════════════════════ */}
      <section className="py-4 overflow-hidden border-y border-orange-100"
        style={{ background: 'linear-gradient(135deg, #FFF4EA, #FFF8F2)' }}>
        <div className="animate-marquee">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center gap-4 px-6 text-sm font-black tracking-widest"
              style={{ color: '#E85D04' }}>
              {item}
              <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
            </span>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FLASH SALE BANNER
      ═══════════════════════════════════════ */}
      <section className="py-8 px-4" style={{ background: 'white' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6"
            style={{
              background: 'linear-gradient(135deg, #1C1917 0%, #292524 100%)',
              border: '1px solid rgba(232,93,4,0.2)'
            }}
          >
            {/* Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20"
              style={{ background: 'radial-gradient(circle, #E85D04, transparent)' }} />

            <div className="relative text-white">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-orange-400" />
                <span className="text-orange-400 font-bold text-sm uppercase tracking-widest">Flash Sale</span>
              </div>
              <h2 className="text-3xl font-black font-display mb-1">Up to <span style={{ color: '#FB8500' }}>30% OFF</span></h2>
              <p className="text-gray-400 text-sm">On selected T-shirts & Hoodies. Limited stock!</p>
            </div>

            <div className="flex flex-col items-center gap-3 relative">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Ends in</p>
              <CountdownTimer />
            </div>

            <Link
              href="/products"
              className="relative px-8 py-4 rounded-2xl font-bold text-gray-900 text-base flex items-center gap-2 transition-all hover:-translate-y-1"
              style={{ background: 'linear-gradient(135deg, #FB8500, #E85D04)', boxShadow: '0 6px 24px rgba(232,93,4,0.4)' }}
            >
              <Flame className="w-4 h-4" /> Shop the Sale
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CATEGORIES GRID
      ═══════════════════════════════════════ */}
      <section className="py-20 px-4" style={{ background: '#FAFAFA' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="section-eyebrow mb-4">
              <Package className="w-3 h-3" /> Our Collections
            </span>
            <h2 className="section-heading mt-4">
              Shop by Category
            </h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto">
              From premium tees to cozy hoodies — every product made with care, ready for your custom design.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4 }}
              >
                <Link href="/products"
                  className="flex flex-col items-center p-6 rounded-2xl text-center transition-all cursor-pointer group border"
                  style={{ background: cat.color, borderColor: `${cat.accent}20` }}>
                  <div className="text-5xl mb-4">{cat.emoji}</div>
                  <h3 className="font-black text-gray-900 text-base mb-1">{cat.name}</h3>
                  <p className="text-xs text-gray-500 mb-3">{cat.desc}</p>
                  <span className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: `${cat.accent}15`, color: cat.accent }}>
                    {cat.count}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURED PRODUCTS
      ═══════════════════════════════════════ */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="section-eyebrow mb-4">
                <Sparkles className="w-3 h-3" /> Featured Products
              </span>
              <h2 className="section-heading mt-4">Best Sellers</h2>
              <p className="text-gray-500 mt-3 max-w-lg">Our most-loved products — hand-picked for quality and style.</p>
            </div>
            <Link href="/products"
              className="flex items-center gap-2 font-bold text-orange-600 hover:text-orange-700 transition-colors shrink-0">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <div className="skeleton aspect-[4/5]" />
                  <div className="p-4 space-y-2">
                    <div className="skeleton h-4 rounded w-3/4" />
                    <div className="skeleton h-4 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {featuredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURES / WHY CHOOSE US
      ═══════════════════════════════════════ */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(180deg, #FFF8F3 0%, #FFF4EC 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="section-eyebrow mb-4">
              <Award className="w-3 h-3" /> Why TryNex?
            </span>
            <h2 className="section-heading mt-4">Built for Bangladesh</h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto">
              We combine premium quality, lightning-fast production, and Bangladesh-first service — all in one brand.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                  whileHover={{ y: -6 }}
                  className="p-8 rounded-3xl text-center border"
                  style={{ background: 'white', borderColor: `${f.color}20`, boxShadow: `0 4px 24px ${f.color}08` }}
                >
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                    style={{ background: f.bg, border: `1.5px solid ${f.color}25` }}>
                    <Icon className="w-7 h-7" style={{ color: f.color }} />
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black mb-4"
                    style={{ background: f.bg, color: f.color }}>
                    {f.badge}
                  </span>
                  <h3 className="text-xl font-black text-gray-900 mb-3">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════ */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="section-eyebrow mb-4">
              <Clock className="w-3 h-3" /> How It Works
            </span>
            <h2 className="section-heading mt-4">Simple as 1-2-3</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PROCESS.map((p, i) => (
              <motion.div
                key={p.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center relative"
              >
                {i < PROCESS.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5"
                    style={{ background: 'linear-gradient(90deg, #fb8500, #fbd580)' }} />
                )}
                <div className="relative z-10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #fff4ee, #ffe8d4)', border: '2px solid #fdd5b4' }}>
                  {p.icon}
                </div>
                <div className="text-xs font-black text-orange-400 tracking-widest mb-2">STEP {p.step}</div>
                <h3 className="text-lg font-black text-gray-900 mb-2">{p.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          STATS
      ═══════════════════════════════════════ */}
      <section className="py-16 px-4" style={{ background: '#1C1917' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-4xl font-black font-display text-white mb-1"
                  style={{ color: stat.color }}>
                  <AnimatedCounter target={stat.value} />
                </div>
                <p className="text-gray-500 text-sm font-semibold">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════ */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(180deg, #FAFAFA 0%, #FFF4EC 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="section-eyebrow mb-4">
              <Star className="w-3 h-3" /> Testimonials
            </span>
            <h2 className="section-heading mt-4">
              Loved Across Bangladesh
            </h2>
            <p className="text-gray-500 mt-4">Real reviews from real customers — from Dhaka to Chittagong.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm"
              >
                <div className="flex mb-3">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-orange-400 text-orange-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm"
                    style={{ background: 'linear-gradient(135deg, #E85D04, #FB8500)' }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role} · {t.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TRUST BADGES
      ═══════════════════════════════════════ */}
      <section className="py-12 px-4 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: ShieldCheck, title: "100% Secure Payments", desc: "bKash, Nagad, Rocket & COD", color: "#16a34a", bg: "#f0fdf4" },
              { icon: Truck, title: "Nationwide Delivery", desc: "All 64 districts of Bangladesh", color: "#2563eb", bg: "#eff6ff" },
              { icon: BadgeCheck, title: "Quality Guarantee", desc: "230-320GSM premium fabric", color: "#E85D04", bg: "#fff4ee" },
              { icon: Users, title: "5,000+ Happy Customers", desc: "98% satisfaction rate", color: "#9333ea", bg: "#fdf4ff" },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: bg }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${color}15` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm leading-tight">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA SECTION
      ═══════════════════════════════════════ */}
      <section className="py-24 px-4" style={{ background: 'linear-gradient(135deg, #1C1917 0%, #292524 100%)' }}>
        <div className="max-w-3xl mx-auto text-center relative">
          {/* Glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-96 h-96 rounded-full blur-3xl opacity-20"
              style={{ background: 'radial-gradient(circle, #E85D04, transparent)' }} />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold mb-8"
              style={{ background: 'rgba(232,93,4,0.2)', color: '#FB8500', border: '1px solid rgba(232,93,4,0.3)' }}>
              <Palette className="w-4 h-4" /> Custom Order
            </span>
            <h2 className="font-display font-black text-white leading-tight mb-6"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', letterSpacing: '-0.03em' }}>
              Have a design in mind?<br />
              <span style={{ color: '#FB8500' }}>Let's make it real.</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-lg mx-auto mb-12 leading-relaxed">
              Share your idea — we handle design, print and delivery. 100% unique, 100% yours.
              Starting from just <strong className="text-white">৳750</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2.5 px-10 py-5 rounded-2xl font-bold text-white text-lg transition-all hover:-translate-y-1"
                style={{
                  background: 'linear-gradient(135deg, #E85D04, #FB8500)',
                  boxShadow: '0 8px 32px rgba(232,93,4,0.45)'
                }}
              >
                Start Designing <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/track"
                className="inline-flex items-center justify-center gap-2.5 px-10 py-5 rounded-2xl font-bold text-white text-lg transition-all"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.12)' }}
              >
                Track Your Order
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm font-semibold text-gray-500">
              {["Free shipping above ৳1,500", "48-hour production", "100% satisfaction guarantee"].map(t => (
                <span key={t} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-orange-500" /> {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
