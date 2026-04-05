import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Loader } from "@/components/ui/Loader";
import { useListProducts } from "@workspace/api-client-react";
import { ArrowRight, Sparkles, Zap, Package, Star, ChevronRight, Check, Truck, ShieldCheck, Clock, Palette, Layers, Award } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const MARQUEE_ITEMS = ["PREMIUM QUALITY", "CUSTOM DESIGNS", "FAST DELIVERY", "MADE IN BD", "YOU IMAGINE WE CRAFT", "LIMITED EDITION", "EXCLUSIVE DROPS", "100% AUTHENTIC", "PREMIUM FABRIC", "BEST PRICE"];

const FEATURES = [
  {
    icon: Palette,
    title: "100% Custom Design",
    desc: "Every piece is crafted to your exact vision — from your concept sketch to a wearable masterpiece, delivered to your door.",
    color: "#FF6B2B",
    badge: "Unlimited Creativity"
  },
  {
    icon: Zap,
    title: "48-Hour Express",
    desc: "Lightning-fast production with nationwide delivery across all 64 districts of Bangladesh. Speed meets quality.",
    color: "#60a5fa",
    badge: "Super Fast"
  },
  {
    icon: Layers,
    title: "Premium Materials",
    desc: "We source only the finest 230-320GSM fabrics. Vibrant colors, sharp prints, lasting comfort — every single time.",
    color: "#4ade80",
    badge: "Top Grade"
  },
];

const PROCESS = [
  { step: "01", title: "Choose & Design", desc: "Pick your product and share your design idea — or let our team help you create something incredible." },
  { step: "02", title: "We Craft It", desc: "Our artisans use premium fabrics and state-of-the-art printing to bring your vision to life with precision." },
  { step: "03", title: "Fast Delivery", desc: "Your custom order is packed with care and delivered express anywhere in Bangladesh within 3-5 days." },
];

const TESTIMONIALS = [
  { name: "Rakib Hasan", role: "Fashion Influencer", text: "TryNex is literally the best custom apparel brand in BD. The hoodie quality is insane — thick, premium, and the print doesn't fade. 10/10!", stars: 5, avatar: "R" },
  { name: "Mithila Chowdhury", role: "Small Business Owner", text: "Ordered 50 custom tees for my brand launch. Every single one was perfect. The colors were exactly what I wanted. Will order again!", stars: 5, avatar: "M" },
  { name: "Farhan Ahmed", role: "University Student", text: "Got a custom hoodie for my crew. Everyone was shocked at how premium it felt. The delivery was super fast too. Highly recommend!", stars: 5, avatar: "F" },
];

const STATS = [
  { value: "5K+", label: "Happy Customers", icon: "😊" },
  { value: "98%", label: "Satisfaction Rate", icon: "⭐" },
  { value: "48h", label: "Production Time", icon: "⚡" },
  { value: "64", label: "Districts Served", icon: "🚀" },
];

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
      setDisplay(current + suffix);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, target, duration]);

  return <div ref={ref}>{display}</div>;
}

export default function Home() {
  const { data: featuredData, isLoading } = useListProducts({ featured: true, limit: 8 });
  const featuredProducts = featuredData?.products || [];
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        {/* Layered background */}
        <div className="absolute inset-0 hero-gradient grid-pattern" />

        {/* Aurora orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-[120px] opacity-25"
            style={{ background: 'radial-gradient(ellipse, rgba(255,107,43,0.7) 0%, rgba(255,107,43,0.2) 50%, transparent 70%)' }} />
          <div className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-15 float-slow"
            style={{ background: 'radial-gradient(circle, rgba(255,152,64,0.6), transparent)' }} />
          <div className="absolute top-[60%] left-[-5%] w-[350px] h-[350px] rounded-full blur-[80px] opacity-10 float-delayed"
            style={{ background: 'radial-gradient(circle, rgba(255,107,43,0.5), transparent)' }} />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-28 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full luxury-badge text-sm font-bold mb-8"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Premium Custom Apparel · Bangladesh 🇧🇩
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-[clamp(3.5rem,9vw,6.5rem)] font-black font-display tracking-tighter leading-[0.9] mb-8"
              >
                You imagine,<br />
                <span className="text-gradient">we craft.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.25 }}
                className="text-xl text-foreground/50 mb-10 max-w-lg leading-relaxed font-medium"
              >
                Elevate your wardrobe with bespoke premium apparel. Your design, our craftsmanship — delivered with pride across Bangladesh.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35 }}
                className="flex flex-col sm:flex-row gap-4 mb-14"
              >
                <Link
                  href="/products"
                  className="btn-glow inline-flex items-center justify-center gap-2.5 px-8 py-4.5 rounded-2xl font-bold text-white text-lg group"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), rgba(255,152,64,1))', boxShadow: '0 12px 50px rgba(255,107,43,0.4), 0 4px 16px rgba(255,107,43,0.3)' }}
                >
                  Shop Collection
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/track"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4.5 rounded-2xl font-bold text-foreground/70 hover:text-foreground transition-all duration-300 hover:border-white/15"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
                >
                  Track Order
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.5 }}
                className="grid grid-cols-4 gap-4 pt-10 border-t border-white/5"
              >
                {STATS.map((s, i) => (
                  <motion.div key={s.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.08 }}
                  >
                    <div className="text-2xl md:text-3xl font-black text-gradient font-display">
                      <AnimatedCounter target={s.value} />
                    </div>
                    <div className="text-xs text-foreground/35 mt-1 font-semibold leading-tight">{s.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Right — 3D Showcase */}
            <motion.div
              initial={{ opacity: 0, x: 60, rotateY: -10 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="hidden lg:block relative perspective-deep"
              style={{ perspective: '1000px' }}
            >
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Main 3D card */}
                <motion.div
                  animate={{ y: [-8, 8, -8], rotateX: [1, -1, 1], rotateZ: [0.5, -0.5, 0.5] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-[2.5rem] overflow-hidden depth-card card-shine"
                  style={{
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'hsl(0 0% 8%)',
                    boxShadow: '0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,107,43,0.1), 0 20px 60px rgba(255,107,43,0.15)',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=700&h=700&fit=crop"
                    alt="Premium apparel"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 80%)' }} />
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold luxury-badge mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
                      Featured Collection
                    </div>
                    <p className="text-2xl font-black text-white leading-tight">Premium Hoodie Collection</p>
                    <div className="flex items-center gap-1 mt-2">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />)}
                      <span className="text-xs text-white/50 ml-1.5 font-medium">(248 reviews)</span>
                    </div>
                  </div>
                </motion.div>

                {/* Floating top-right badge */}
                <motion.div
                  animate={{ y: [-6, 6, -6], rotate: [-2, 2, -2] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-5 -right-5 px-5 py-3 rounded-2xl z-10"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--primary)), rgba(255,152,64,1))',
                    boxShadow: '0 12px 40px rgba(255,107,43,0.6), 0 4px 16px rgba(255,107,43,0.4)'
                  }}
                >
                  <p className="text-white text-xs font-black tracking-wide">🚚 FREE DELIVERY</p>
                  <p className="text-white/75 text-[10px] font-semibold">above ৳1,500</p>
                </motion.div>

                {/* Floating bottom-left card */}
                <motion.div
                  animate={{ y: [6, -6, 6], rotate: [1, -1, 1] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                  className="absolute -bottom-5 -left-5 px-5 py-4 rounded-2xl z-10 glass-dark"
                  style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.6)', minWidth: '180px' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'rgba(255,107,43,0.15)' }}>✨</div>
                    <div>
                      <p className="text-xs text-foreground/45 font-semibold">New Drop</p>
                      <p className="text-foreground font-black text-sm">Summer 2025 ✦</p>
                    </div>
                  </div>
                </motion.div>

                {/* Floating stars card */}
                <motion.div
                  animate={{ y: [4, -4, 4] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                  className="absolute top-1/3 -left-8 px-4 py-3 rounded-2xl z-10 glass-dark text-center"
                  style={{ boxShadow: '0 16px 40px rgba(0,0,0,0.5)' }}
                >
                  <div className="flex gap-0.5 mb-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="text-xs font-black text-foreground">5K+ Happy</p>
                  <p className="text-[10px] text-foreground/40 font-medium">Customers</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none" style={{ background: 'linear-gradient(to top, hsl(var(--background)), transparent)' }} />

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <div className="w-5 h-8 rounded-full border border-white/30 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-white scroll-indicator" />
          </div>
        </div>
      </section>

      {/* ── MARQUEE TICKER ──────────────────────────────────────── */}
      <div className="py-5 overflow-hidden relative" style={{ background: 'hsl(0 0% 5%)' }}>
        <div className="absolute inset-y-0 left-0 w-24 z-10 pointer-events-none" style={{ background: 'linear-gradient(90deg, hsl(0 0% 5%), transparent)' }} />
        <div className="absolute inset-y-0 right-0 w-24 z-10 pointer-events-none" style={{ background: 'linear-gradient(270deg, hsl(0 0% 5%), transparent)' }} />
        <div className="section-divider absolute top-0 left-0 right-0" />
        <div className="section-divider absolute bottom-0 left-0 right-0" />
        <div className="marquee-inner">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center gap-5 mx-5 text-xs font-black uppercase tracking-widest text-foreground/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURED PRODUCTS ────────────────────────────────────── */}
      <section className="py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16"
        >
          <div>
            <div className="section-eyebrow">
              <Sparkles className="w-3 h-3" />
              Featured Collection
            </div>
            <h2 className="text-[clamp(2.5rem,6vw,4rem)] font-black font-display tracking-tighter leading-tight">
              Bestsellers That<br />
              <span className="text-gradient">People Love</span>
            </h2>
          </div>
          <Link href="/products" className="inline-flex items-center gap-2 font-bold text-foreground/45 hover:text-primary transition-colors text-sm group shrink-0">
            View All Products
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {isLoading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
            {featuredProducts.length === 0 && (
              <div className="col-span-full py-20 text-center text-foreground/30">
                <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-semibold">Products loading...</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── WHY TRYNEX ────────────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="section-divider absolute top-0 left-0 right-0" />
        <div className="section-divider absolute bottom-0 left-0 right-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-18"
          >
            <div className="section-eyebrow mx-auto w-fit mb-4">
              <Award className="w-3 h-3" />
              Why TryNex
            </div>
            <h2 className="text-[clamp(2.5rem,6vw,4rem)] font-black font-display tracking-tighter">
              Crafted with care,<br />
              <span className="text-gradient">delivered with pride.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="p-8 rounded-3xl card-glow card-shine relative overflow-hidden group"
                  style={{ background: 'hsl(0 0% 6.5%)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  {/* Glow orb on hover */}
                  <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"
                    style={{ background: `radial-gradient(circle, ${f.color}20, transparent)` }} />

                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-7 relative"
                    style={{ background: `${f.color}12`, border: `1px solid ${f.color}25`, boxShadow: `0 8px 24px ${f.color}15` }}>
                    <Icon className="w-7 h-7" style={{ color: f.color }} />
                  </div>
                  <div className="inline-flex text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-4"
                    style={{ background: `${f.color}10`, border: `1px solid ${f.color}25`, color: f.color }}>
                    {f.badge}
                  </div>
                  <h3 className="text-xl font-black mb-3">{f.title}</h3>
                  <p className="text-foreground/40 leading-relaxed text-sm">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section className="py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-18"
        >
          <div className="section-eyebrow mx-auto w-fit mb-4">
            <Zap className="w-3 h-3" />
            How It Works
          </div>
          <h2 className="text-[clamp(2.2rem,5vw,3.5rem)] font-black font-display tracking-tighter">
            From idea to delivery,<br />
            <span className="text-gradient">3 simple steps.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-14 left-1/3 right-1/3 h-px" style={{ background: 'linear-gradient(90deg, rgba(255,107,43,0.4), rgba(255,107,43,0.1))' }} />

          {PROCESS.map((p, i) => (
            <motion.div
              key={p.step}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="relative text-center"
            >
              <div className="relative inline-flex mb-7">
                <div className="w-28 h-28 rounded-full flex flex-col items-center justify-center relative z-10"
                  style={{ background: 'hsl(0 0% 7%)', border: '1px solid rgba(255,107,43,0.2)', boxShadow: '0 8px 40px rgba(255,107,43,0.15)' }}>
                  <span className="text-3xl font-black text-gradient font-display">{p.step}</span>
                </div>
                {i < 2 && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full hidden md:flex items-center px-4">
                    <ArrowRight className="w-5 h-5 text-primary/40" />
                  </div>
                )}
              </div>
              <h3 className="text-lg font-black mb-3">{p.title}</h3>
              <p className="text-sm text-foreground/40 leading-relaxed max-w-xs mx-auto">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 text-center"
        >
          <Link href="/products"
            className="btn-glow inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-white text-base"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), rgba(255,152,64,1))', boxShadow: '0 8px 40px rgba(255,107,43,0.35)' }}
          >
            Start Your Custom Order
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden" style={{ background: 'hsl(0 0% 4%)' }}>
        <div className="absolute inset-0 grid-pattern-fine opacity-30" />
        <div className="section-divider absolute top-0 left-0 right-0" />
        <div className="section-divider absolute bottom-0 left-0 right-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="section-eyebrow mx-auto w-fit mb-4">
              <Star className="w-3 h-3 fill-primary" />
              Customer Love
            </div>
            <h2 className="text-[clamp(2.2rem,5vw,3.5rem)] font-black font-display tracking-tighter">
              What our customers<br />
              <span className="text-gradient">say about us.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                className="p-7 rounded-3xl card-shine relative"
                style={{ background: 'hsl(0 0% 6.5%)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex gap-1 mb-5">
                  {Array(t.stars).fill(0).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-foreground/60 leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm shrink-0"
                    style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), rgba(255,152,64,1))' }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-xs text-foreground/35">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────── */}
      <section className="py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative overflow-hidden rounded-[2.5rem] text-center py-24 px-8 aurora-bg noise"
          style={{
            background: 'linear-gradient(135deg, hsl(0 0% 7%) 0%, hsl(20 30% 7%) 50%, hsl(0 0% 6%) 100%)',
            border: '1px solid rgba(255,107,43,0.2)',
            boxShadow: '0 40px 120px rgba(0,0,0,0.5), 0 0 80px rgba(255,107,43,0.08)'
          }}
        >
          {/* Center glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[500px] h-[500px] rounded-full blur-[100px] opacity-25"
              style={{ background: 'radial-gradient(circle, rgba(255,107,43,0.9), rgba(255,107,43,0.2), transparent)' }} />
          </div>

          <div className="relative z-10">
            <div className="section-eyebrow mx-auto w-fit mb-6">
              <Palette className="w-3 h-3" />
              Custom Order
            </div>
            <h2 className="text-[clamp(2.5rem,7vw,5rem)] font-black font-display tracking-tighter mb-6 leading-tight">
              Have a design in mind?<br />
              <span className="text-gradient">Let's make it real.</span>
            </h2>
            <p className="text-foreground/45 text-lg max-w-lg mx-auto mb-12 leading-relaxed">
              Share your idea — we handle design, print and delivery. 100% unique, 100% yours. Starting from just ৳750.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="btn-glow inline-flex items-center gap-2.5 px-10 py-5 rounded-2xl font-bold text-white text-lg"
                style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), rgba(255,152,64,1))', boxShadow: '0 12px 50px rgba(255,107,43,0.5)' }}
              >
                Start Designing <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/track"
                className="inline-flex items-center gap-2.5 px-10 py-5 rounded-2xl font-bold text-foreground/60 hover:text-foreground transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Track Your Order
              </Link>
            </div>

            {/* Trust points */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-xs font-semibold text-foreground/35">
              {["Free shipping above ৳1,500", "48-hour production", "100% satisfaction guarantee", "Easy returns"].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-primary" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
