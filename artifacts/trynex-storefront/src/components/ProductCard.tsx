import { useLocation } from "wouter";
import { ShoppingCart, Star, Eye, Zap, Check } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useTilt } from "@/hooks/use-tilt";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const COLOR_MAP: Record<string, string> = {
  'Black': '#1a1a1a', 'White': '#f5f5f5', 'Grey': '#6b7280', 'Gray': '#6b7280',
  'Navy': '#1e3a5f', 'Olive': '#4a5240', 'Charcoal': '#374151', 'Maroon': '#7f1d1d',
  'Red': '#dc2626', 'Blue': '#1d4ed8', 'Cream': '#fef3c7', 'Khaki': '#a18b52',
  'Burgundy': '#6b1a2a', 'Brown': '#7c4a2b', 'Yellow': '#eab308', 'Green': '#16a34a',
  'Orange': '#ea580c', 'Pink': '#ec4899', 'Purple': '#7c3aed', 'Teal': '#0d9488',
};

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [, navigate] = useLocation();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { ref, onMouseMove, onMouseLeave } = useTilt(6);
  const [isAdding, setIsAdding] = useState(false);
  const [hovered, setHovered] = useState(false);

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const rating = product.rating ? parseFloat(String(product.rating)) : 4.9;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdding) return;
    setIsAdding(true);
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    });
    toast({ title: "✓ Added to cart", description: product.name });
    setTimeout(() => setIsAdding(false), 1200);
  };

  const handleViewDetail = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${product.id}`);
  };

  const goToDetail = () => navigate(`/product/${product.id}`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseLeave={(e) => { onMouseLeave(); setHovered(false); }}
        onMouseEnter={() => setHovered(true)}
        className="perspective-card rounded-2xl overflow-hidden group relative cursor-pointer select-none"
        onClick={goToDetail}
        style={{
          background: 'hsl(0 0% 6.5%)',
          border: hovered ? '1px solid rgba(255,107,43,0.22)' : '1px solid rgba(255,255,255,0.07)',
          boxShadow: hovered
            ? '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(255,107,43,0.08)'
            : '0 8px 40px rgba(0,0,0,0.4)',
          transition: 'box-shadow 0.4s ease, border-color 0.4s ease'
        }}
      >
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden" style={{ background: 'hsl(0 0% 10%)' }}>
          {/* Badges */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
            {discount > 0 && (
              <div className="px-2.5 py-1 rounded-lg text-xs font-black text-white shadow-lg"
                style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), rgba(255,152,64,1))', boxShadow: '0 4px 12px rgba(255,107,43,0.4)' }}>
                -{discount}%
              </div>
            )}
            {product.stock > 0 && product.stock <= 10 && (
              <div className="px-2.5 py-1 rounded-lg text-[10px] font-black" style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}>
                Only {product.stock} left!
              </div>
            )}
          </div>

          {product.customizable && (
            <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-lg text-xs font-bold luxury-badge">
              ✦ Custom
            </div>
          )}

          <img
            src={product.imageUrl || `https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop`}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            draggable="false"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 80%)' }} />

          {/* Quick actions — use buttons, NOT links, to avoid nested anchor tags */}
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex gap-2"
            onClick={e => e.stopPropagation()}>
            <button
              onClick={handleQuickAdd}
              className="flex-1 py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
              style={{
                background: isAdding ? 'rgba(74,222,128,0.9)' : 'rgba(255,107,43,0.92)',
                backdropFilter: 'blur(16px)',
                color: 'white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
              }}
            >
              {isAdding ? <><Check className="w-3.5 h-3.5" /> Added!</> : <><ShoppingCart className="w-3.5 h-3.5" /> Quick Add</>}
            </button>
            <button
              onClick={handleViewDetail}
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors"
              style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(16px)', color: 'white' }}
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Shine */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%)' }} />
        </div>

        {/* Info */}
        <div className="p-4 pt-4" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/25">
              {product.categoryName || 'Apparel'}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-primary text-primary" />
              <span className="text-[11px] font-bold text-foreground/40">{rating.toFixed(1)}</span>
            </div>
          </div>

          <button className="w-full text-left mb-3" onClick={goToDetail}>
            <h3 className="font-bold text-sm text-foreground leading-snug line-clamp-1 hover:text-primary transition-colors duration-200">
              {product.name}
            </h3>
          </button>

          {/* Color dots */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              {product.colors.slice(0, 5).map((color, i) => (
                <div
                  key={i}
                  className="w-3.5 h-3.5 rounded-full border border-white/15 shrink-0"
                  style={{ background: COLOR_MAP[color] || '#555', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
                  title={color}
                />
              ))}
              {product.colors.length > 5 && (
                <span className="text-[10px] text-foreground/30 font-semibold">+{product.colors.length - 5}</span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              {product.discountPrice ? (
                <>
                  <span className="font-black text-primary text-base">{formatPrice(product.discountPrice)}</span>
                  <span className="text-xs line-through text-foreground/25">{formatPrice(product.price)}</span>
                </>
              ) : (
                <span className="font-black text-foreground text-base">{formatPrice(product.price)}</span>
              )}
            </div>

            <button
              onClick={handleQuickAdd}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
              style={{
                background: isAdding ? 'rgba(74,222,128,0.15)' : 'rgba(255,107,43,0.1)',
                border: isAdding ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(255,107,43,0.2)',
                color: isAdding ? '#4ade80' : 'hsl(var(--primary))',
              }}
            >
              {isAdding ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
