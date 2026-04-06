import { useLocation } from "wouter";
import { ShoppingCart, Star, Heart, Check, Eye } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const COLOR_MAP: Record<string, string> = {
  'Black': '#1a1a1a', 'White': '#f0f0f0', 'Grey': '#6b7280', 'Gray': '#6b7280',
  'Navy': '#1e3a5f', 'Olive': '#4a5240', 'Charcoal': '#374151', 'Maroon': '#7f1d1d',
  'Red': '#dc2626', 'Blue': '#1d4ed8', 'Cream': '#fef3c7', 'Khaki': '#a18b52',
  'Burgundy': '#6b1a2a', 'Brown': '#7c4a2b', 'Yellow': '#eab308', 'Green': '#16a34a',
  'Orange': '#ea580c', 'Pink': '#ec4899', 'Purple': '#7c3aed', 'Teal': '#0d9488',
  'Sky Blue': '#0ea5e9', 'Lime': '#84cc16', 'Coral': '#f97316', 'Indigo': '#6366f1',
};

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [, navigate] = useLocation();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [hovered, setHovered] = useState(false);

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const rating = product.rating ? parseFloat(String(product.rating)) : 4.9;
  const wishlisted = isWishlisted(product.id);

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

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      imageUrl: product.imageUrl,
    });
  };

  const goToDetail = () => navigate(`/product/${product.id}`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={goToDetail}
        className="rounded-2xl overflow-hidden group cursor-pointer select-none bg-white"
        style={{
          border: hovered ? '1.5px solid #fbd5b4' : '1.5px solid #f0e8e0',
          boxShadow: hovered
            ? '0 12px 40px rgba(232,93,4,0.1), 0 4px 12px rgba(0,0,0,0.07)'
            : '0 2px 12px rgba(0,0,0,0.05)',
          transform: hovered ? 'translateY(-4px)' : 'none',
          transition: 'all 0.3s cubic-bezier(0.25,0.46,0.45,0.94)',
        }}
      >
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden" style={{ background: '#f9f5f2' }}>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              {product.name.toLowerCase().includes('hoodie') ? '🧥' :
               product.name.toLowerCase().includes('mug') ? '☕' :
               product.name.toLowerCase().includes('cap') ? '🧢' : '👕'}
            </div>
          )}

          {/* Discount / Stock Badges */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-black text-white"
                style={{ background: 'linear-gradient(135deg, #E85D04, #FB8500)', boxShadow: '0 2px 8px rgba(232,93,4,0.4)' }}>
                -{discount}%
              </span>
            )}
            {product.stock > 0 && product.stock <= 10 && (
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-black text-amber-700"
                style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.35)' }}>
                Only {product.stock} left
              </span>
            )}
            {product.stock === 0 && (
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-black text-red-600"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                Sold Out
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
            style={{
              background: wishlisted ? '#fff1f0' : 'rgba(255,255,255,0.92)',
              border: wishlisted ? '1.5px solid #fecaca' : '1px solid rgba(0,0,0,0.08)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Heart className="w-3.5 h-3.5"
              style={{ color: wishlisted ? '#E85D04' : '#9ca3af', fill: wishlisted ? '#E85D04' : 'none' }} />
          </button>

          {/* Quick view on hover */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-3 left-3 right-3 z-20"
          >
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToDetail(); }}
              className="w-full py-2 rounded-xl font-bold text-sm text-gray-700 flex items-center justify-center gap-2 transition-all"
              style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', border: '1px solid rgba(0,0,0,0.08)' }}
            >
              <Eye className="w-3.5 h-3.5" /> Quick View
            </button>
          </motion.div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, j) => (
              <Star key={j} className="w-3 h-3"
                style={{ fill: j < Math.floor(rating) ? '#FB8500' : '#e5e7eb', color: j < Math.floor(rating) ? '#FB8500' : '#e5e7eb' }} />
            ))}
            <span className="text-xs text-gray-400 ml-1 font-semibold">{rating}</span>
          </div>

          {/* Name */}
          <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2.5 line-clamp-2 group-hover:text-orange-600 transition-colors">
            {product.name}
          </h3>

          {/* Color dots */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              {product.colors.slice(0, 5).map((color, i) => (
                <div
                  key={i}
                  className="w-3.5 h-3.5 rounded-full shrink-0"
                  style={{
                    background: COLOR_MAP[color] || '#ccc',
                    border: color === 'White' ? '1.5px solid #d1d5db' : '1.5px solid rgba(0,0,0,0.1)',
                  }}
                  title={color}
                />
              ))}
              {product.colors.length > 5 && (
                <span className="text-[10px] text-gray-400 font-semibold">+{product.colors.length - 5}</span>
              )}
            </div>
          )}

          {/* Price + Cart */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              {product.discountPrice ? (
                <>
                  <span className="font-black text-orange-600 text-base">{formatPrice(product.discountPrice)}</span>
                  <span className="text-xs line-through text-gray-400">{formatPrice(product.price)}</span>
                </>
              ) : (
                <span className="font-black text-gray-900 text-base">{formatPrice(product.price)}</span>
              )}
            </div>

            <button
              onClick={handleQuickAdd}
              disabled={product.stock === 0}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: isAdding
                  ? 'rgba(22,163,74,0.1)'
                  : 'linear-gradient(135deg, #E85D04, #FB8500)',
                border: isAdding ? '1px solid rgba(22,163,74,0.3)' : 'none',
                boxShadow: isAdding ? 'none' : '0 2px 8px rgba(232,93,4,0.3)',
                color: isAdding ? '#16a34a' : 'white',
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
