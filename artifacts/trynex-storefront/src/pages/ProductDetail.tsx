import { useParams } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Loader } from "@/components/ui/Loader";
import { useGetProduct } from "@workspace/api-client-react";
import { formatPrice, cn } from "@/lib/utils";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, ShoppingBag, ShieldCheck, Truck, Star, RotateCcw, ArrowLeft, Check, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

const COLOR_MAP: Record<string, string> = {
  'Black': '#1a1a1a', 'White': '#f5f5f5', 'Grey': '#6b7280', 'Gray': '#6b7280',
  'Navy': '#1e3a5f', 'Olive': '#4a5240', 'Charcoal': '#374151', 'Maroon': '#7f1d1d',
  'Red': '#dc2626', 'Blue': '#1d4ed8', 'Cream': '#fef3c7', 'Khaki': '#a18b52',
  'Burgundy': '#6b1a2a', 'Brown': '#7c4a2b', 'Yellow': '#eab308', 'Green': '#16a34a',
  'Orange': '#ea580c', 'Pink': '#ec4899', 'Purple': '#7c3aed', 'Teal': '#0d9488',
  'Sky Blue': '#0ea5e9', 'Lime': '#84cc16', 'Coral': '#f97316', 'Indigo': '#6366f1',
};

export default function ProductDetail() {
  const { id } = useParams();
  const productId = Number(id);
  const isValidId = !isNaN(productId) && productId > 0;

  const { data: product, isLoading, error } = useGetProduct(productId, {
    query: { enabled: isValidId, retry: 2, staleTime: 30000 }
  });

  const { addToCart } = useCart();
  const { toast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [customNote, setCustomNote] = useState("");
  const [activeImage, setActiveImage] = useState<string>("");
  const [addedToBag, setAddedToBag] = useState(false);

  if (isLoading) return <Loader fullScreen />;

  if (!isValidId) return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 py-20">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6"
            style={{ background: 'rgba(255,107,43,0.08)', border: '1px solid rgba(255,107,43,0.15)' }}>🔍</div>
          <h2 className="text-4xl font-black font-display tracking-tighter mb-3">Product Not Found</h2>
          <p className="text-foreground/40 mb-8 max-w-sm mx-auto">This product link is invalid or the product has been removed.</p>
          <Link href="/products" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-white text-base"
            style={{ background: 'hsl(var(--primary))', boxShadow: '0 8px 30px rgba(255,107,43,0.4)' }}>
            <ArrowLeft className="w-5 h-5" /> Browse All Products
          </Link>
        </motion.div>
      </div>
      <Footer />
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 py-20">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6"
            style={{ background: 'rgba(255,107,43,0.08)', border: '1px solid rgba(255,107,43,0.15)' }}>
            🔍
          </div>
          <h2 className="text-4xl font-black font-display tracking-tighter mb-3">Product Not Found</h2>
          <p className="text-foreground/40 mb-8 max-w-sm mx-auto">This product may have been removed or the link might be incorrect.</p>
          <Link href="/products"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-white text-base"
            style={{ background: 'hsl(var(--primary))', boxShadow: '0 8px 30px rgba(255,107,43,0.4)' }}>
            <ArrowLeft className="w-5 h-5" /> Browse All Products
          </Link>
        </motion.div>
      </div>
      <Footer />
    </div>
  );

  const images = product.images?.length ? product.images : [product.imageUrl || ''];
  const displayImage = activeImage || images[0];

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    if (product.sizes?.length && !selectedSize) {
      toast({ title: "Please select a size", variant: "destructive" });
      return;
    }
    if (product.colors?.length && !selectedColor) {
      toast({ title: "Please select a color", variant: "destructive" });
      return;
    }
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      quantity,
      imageUrl: product.imageUrl,
      size: selectedSize,
      color: selectedColor,
      customNote: customNote || undefined
    });
    setAddedToBag(true);
    setTimeout(() => setAddedToBag(false), 2000);
    toast({ title: `✓ Added to cart!`, description: `${quantity}× ${product.name}` });
  };

  const rating = product.rating ? parseFloat(String(product.rating)) : 4.9;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-foreground/30 mb-8 font-semibold uppercase tracking-wider">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="text-foreground/15">/</span>
            <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
            <span className="text-foreground/15">/</span>
            <span className="text-foreground/60 truncate max-w-[200px]">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Gallery */}
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={displayImage}
                  initial={{ opacity: 0.5, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0.5, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="aspect-square rounded-3xl overflow-hidden relative group"
                  style={{
                    background: 'hsl(0 0% 8%)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    boxShadow: '0 25px 80px rgba(0,0,0,0.6)'
                  }}
                >
                  {discount > 0 && (
                    <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-xl text-sm font-black text-white"
                      style={{ background: 'hsl(var(--primary))', boxShadow: '0 4px 15px rgba(255,107,43,0.5)' }}>
                      -{discount}% OFF
                    </div>
                  )}
                  {product.customizable && (
                    <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-xl text-xs font-black"
                      style={{ background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.3)', color: '#60a5fa' }}>
                      ✦ Customizable
                    </div>
                  )}
                  {displayImage && (
                    <img
                      src={displayImage}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={cn(
                        "w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-200",
                        displayImage === img
                          ? "border-primary scale-105 shadow-lg"
                          : "border-transparent opacity-50 hover:opacity-100 hover:scale-105"
                      )}
                      style={{ background: 'hsl(0 0% 9%)' }}
                    >
                      {img && <img src={img} alt="" className="w-full h-full object-cover" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-center lg:sticky lg:top-32 lg:self-start">
              {product.categoryName && (
                <p className="text-xs font-black uppercase tracking-widest text-primary mb-3">{product.categoryName}</p>
              )}

              <h1 className="text-4xl md:text-5xl font-black font-display tracking-tighter mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4 transition-colors",
                        i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-foreground/15"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-foreground/50">
                  {rating.toFixed(1)} ({product.reviewCount || 124} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-5xl font-black text-primary" style={{ textShadow: '0 0 30px rgba(255,107,43,0.3)' }}>
                  {formatPrice(product.discountPrice || product.price)}
                </span>
                {product.discountPrice && (
                  <span className="text-xl line-through text-foreground/25">{formatPrice(product.price)}</span>
                )}
              </div>

              {/* Stock badge */}
              <div className="flex items-center gap-3 mb-6">
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold",
                  product.stock > 0 ? "status-delivered" : "status-cancelled"
                )}>
                  {product.stock > 0 ? `✓ In Stock (${product.stock} left)` : "✗ Out of Stock"}
                </span>
                {product.stock > 0 && product.stock <= 10 && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400">
                    <Zap className="w-3.5 h-3.5" /> Low Stock — Order Soon
                  </span>
                )}
              </div>

              {product.description && (
                <p className="text-foreground/50 leading-relaxed mb-8 text-sm border-b border-white/5 pb-8">
                  {product.description}
                </p>
              )}

              {/* Options */}
              <div className="space-y-6 mb-8">
                {/* Colors */}
                {product.colors && product.colors.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-black uppercase tracking-wider text-foreground/40">Color</p>
                      {selectedColor && (
                        <motion.p
                          key={selectedColor}
                          initial={{ opacity: 0, x: 5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-xs font-bold px-3 py-1 rounded-lg"
                          style={{ background: `${COLOR_MAP[selectedColor] || '#555'}20`, color: COLOR_MAP[selectedColor] || '#aaa' }}
                        >
                          {selectedColor}
                        </motion.p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          title={color}
                          className={cn(
                            "w-10 h-10 rounded-full border-2 transition-all duration-200 relative",
                            selectedColor === color
                              ? "border-white scale-110 shadow-2xl"
                              : "border-white/10 hover:border-white/40 hover:scale-105"
                          )}
                          style={{
                            background: COLOR_MAP[color] || '#555',
                            boxShadow: selectedColor === color
                              ? `0 0 0 3px rgba(255,255,255,0.2), 0 4px 15px ${COLOR_MAP[color] || '#555'}60`
                              : undefined
                          }}
                        >
                          {selectedColor === color && (
                            <Check className="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow-md" strokeWidth={3} />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes */}
                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-black uppercase tracking-wider text-foreground/40">Size</p>
                      <button className="text-xs text-primary font-semibold hover:underline">Size Guide</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={cn(
                            "min-w-[3.5rem] h-12 px-4 rounded-xl font-bold text-sm border-2 transition-all duration-200",
                            selectedSize === size
                              ? "text-white scale-105"
                              : "border-white/10 text-foreground/60 hover:border-primary/50 hover:text-foreground"
                          )}
                          style={selectedSize === size
                            ? { background: 'hsl(var(--primary))', border: 'none', boxShadow: '0 4px 20px rgba(255,107,43,0.4)' }
                            : { background: 'hsl(0 0% 9%)' }}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Note */}
                {product.customizable && (
                  <div>
                    <p className="text-sm font-black uppercase tracking-wider text-foreground/40 mb-3">Custom Instructions</p>
                    <textarea
                      placeholder="Describe your custom design, text, colors, or special instructions..."
                      value={customNote}
                      onChange={(e) => setCustomNote(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl text-sm leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-foreground/25"
                      style={{ background: 'hsl(0 0% 9%)', border: '1px solid rgba(255,255,255,0.07)', color: 'hsl(var(--foreground))' }}
                    />
                  </div>
                )}
              </div>

              {/* Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <div className="flex items-center border border-white/10 rounded-xl h-14 shrink-0"
                  style={{ background: 'hsl(0 0% 9%)' }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-foreground/50 hover:text-foreground transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-black text-lg w-10 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="px-4 py-2 text-foreground/50 hover:text-foreground transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock < 1}
                  className="btn-glow flex-1 h-14 rounded-xl font-bold text-white flex items-center justify-center gap-2.5 text-base disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300"
                  style={{
                    background: product.stock > 0
                      ? (addedToBag ? 'rgba(74,222,128,0.8)' : 'hsl(var(--primary))')
                      : undefined,
                    boxShadow: product.stock > 0 ? '0 8px 30px rgba(255,107,43,0.4)' : undefined
                  }}
                >
                  {addedToBag ? (
                    <><Check className="w-5 h-5" /> Added to Bag!</>
                  ) : (
                    <><ShoppingBag className="w-5 h-5" />{product.stock > 0 ? "Add to Cart" : "Sold Out"}</>
                  )}
                </button>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Truck, label: "Nationwide Delivery", color: '#60a5fa' },
                  { icon: ShieldCheck, label: "Quality Guarantee", color: '#4ade80' },
                  { icon: RotateCcw, label: "Easy Returns", color: '#f59e0b' },
                ].map(({ icon: Icon, label, color }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl text-center transition-all hover:-translate-y-1 duration-200"
                    style={{ background: 'hsl(0 0% 8%)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                    <span className="text-xs font-semibold text-foreground/50 leading-tight">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
