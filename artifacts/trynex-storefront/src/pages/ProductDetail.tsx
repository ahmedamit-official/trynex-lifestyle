import { useParams, Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Loader } from "@/components/ui/Loader";
import { useGetProduct, useListProducts } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { formatPrice, cn, getApiUrl } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { trackViewContent, trackAddToCart } from "@/lib/tracking";
import { useToast } from "@/hooks/use-toast";
import {
  Minus, Plus, ShoppingBag, ShieldCheck, Truck, Star,
  RotateCcw, ArrowLeft, ArrowRight, Check, Heart, Share2, Ruler, MessageCircle, Sparkles,
  Upload, Image as ImageIcon, X as XIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const COLOR_MAP: Record<string, string> = {
  'Black': '#1a1a1a', 'White': '#f0f0f0', 'Grey': '#6b7280', 'Gray': '#6b7280',
  'Navy': '#1e3a5f', 'Olive': '#4a5240', 'Charcoal': '#374151', 'Maroon': '#7f1d1d',
  'Red': '#dc2626', 'Blue': '#1d4ed8', 'Cream': '#fef3c7', 'Khaki': '#a18b52',
  'Burgundy': '#6b1a2a', 'Brown': '#7c4a2b', 'Yellow': '#eab308', 'Green': '#16a34a',
  'Orange': '#ea580c', 'Pink': '#ec4899', 'Purple': '#7c3aed', 'Teal': '#0d9488',
  'Sky Blue': '#0ea5e9', 'Lime': '#84cc16', 'Coral': '#f97316', 'Indigo': '#6366f1',
};

const SIZE_GUIDE = [
  { size: "S", chest: "36-38", length: "27", sleeve: "32" },
  { size: "M", chest: "38-40", length: "28", sleeve: "33" },
  { size: "L", chest: "40-42", length: "29", sleeve: "34" },
  { size: "XL", chest: "42-44", length: "30", sleeve: "35" },
  { size: "2XL", chest: "44-46", length: "31", sleeve: "36" },
  { size: "3XL", chest: "46-48", length: "32", sleeve: "37" },
];

const REVIEW_SAMPLES = [
  { name: "Rakib H.", rating: 5, text: "Amazing quality! The print is sharp and fabric is premium. Delivery was super fast.", date: "2 days ago", location: "Dhaka" },
  { name: "Priya M.", rating: 5, text: "Exactly what I ordered. The color is vibrant and the stitching is perfect.", date: "1 week ago", location: "Chittagong" },
  { name: "Tanvir A.", rating: 4, text: "Good quality product. Would recommend TryNex to everyone!", date: "2 weeks ago", location: "Sylhet" },
];

export default function ProductDetail() {
  const { id } = useParams();
  const productId = Number(id);
  const isValidId = !isNaN(productId) && productId > 0;

  const { data: product, isLoading, error } = useGetProduct(productId, {
    query: { enabled: isValidId, retry: 2, staleTime: 30000 }
  });

  const { data: relatedData } = useListProducts(
    { limit: 4, category: product?.category || undefined },
    { query: { enabled: !!product, staleTime: 60000 } }
  );
  const relatedProducts = (relatedData?.products || []).filter(p => p.id !== productId).slice(0, 4);

  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { toast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [customNote, setCustomNote] = useState("");
  const [customImages, setCustomImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [addedToBag, setAddedToBag] = useState(false);
  const [activeImage, setActiveImage] = useState<string>("");
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "reviews">("details");

  useEffect(() => {
    if (product) {
      trackViewContent({
        id: product.id,
        name: product.name,
        price: product.discountPrice || product.price,
      });
    }
  }, [product?.id]);

  if (isLoading) return <Loader fullScreen />;

  const NotFound = (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 py-20">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-4xl font-black font-display tracking-tight text-gray-900 mb-3">Product Not Found</h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">This product may have been removed or the link is incorrect.</p>
          <Link href="/products" className="btn-primary inline-flex">
            <ArrowLeft className="w-5 h-5" /> Browse All Products
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );

  if (!isValidId || error || !product) return NotFound;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImage(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) {
          toast({ title: "File too large", description: "Max 10MB per image", variant: "destructive" });
          continue;
        }
        const metaRes = await fetch(getApiUrl('/api/storage/uploads/request-url'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
        });
        if (!metaRes.ok) throw new Error('Upload failed');
        const { uploadURL, objectPath } = await metaRes.json();
        const putRes = await fetch(uploadURL, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
        if (!putRes.ok) throw new Error('File upload failed');
        const imageUrl = getApiUrl(`/api${objectPath}`);
        setCustomImages(prev => [...prev, imageUrl]);
      }
      toast({ title: "Image uploaded!", description: "Your design reference has been attached." });
    } catch {
      toast({ title: "Upload failed", description: "Please try again or share via WhatsApp.", variant: "destructive" });
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleAddToCart = () => {
    if (product.stock < 1) return;
    const itemPrice = product.discountPrice || product.price;
    addToCart({
      productId: product.id,
      name: product.name,
      price: itemPrice,
      quantity,
      imageUrl: product.imageUrl,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      customNote: customNote || undefined,
      customImages: customImages.length > 0 ? customImages : undefined,
    });
    trackAddToCart({ id: product.id, name: product.name, price: itemPrice, quantity });
    setAddedToBag(true);
    toast({ title: "✓ Added to cart!", description: `${product.name} × ${quantity}` });
    setTimeout(() => setAddedToBag(false), 2000);
  };

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const displayImage = activeImage || product.imageUrl || "";
  const wishlisted = isWishlisted(product.id);
  const rating = product.rating ? parseFloat(String(product.rating)) : 4.9;

  const handleShare = async () => {
    try {
      await navigator.share({ title: product.name, url: window.location.href });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied!", description: "Share it with your friends." });
    }
  };

  const handleWhatsAppOrder = () => {
    const itemPrice = product.discountPrice || product.price;
    const totalPrice = itemPrice * quantity;
    const lines = [
      `Assalamu Alaikum, TryNex!`,
      ``,
      `I'd like to place an order:`,
      ``,
      `🛍️ *Product:* ${product.name}`,
      `💰 *Price:* ${formatPrice(itemPrice)}${product.discountPrice ? ` (was ${formatPrice(product.price)})` : ``}`,
      `📦 *Quantity:* ${quantity}`,
      `💵 *Total:* ${formatPrice(totalPrice)}`,
    ];
    if (selectedSize) lines.push(`📏 *Size:* ${selectedSize}`);
    if (selectedColor) lines.push(`🎨 *Color:* ${selectedColor}`);
    if (customNote) lines.push(`✏️ *Custom Note:* ${customNote}`);
    lines.push(``);
    lines.push(`🔗 *Product Link:* ${window.location.href}`);
    lines.push(``);
    lines.push(`Please confirm availability and delivery details. Thank you!`);
    const msg = lines.join('\n');
    window.open(`https://wa.me/8801903426915?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SEOHead
        title={product.name}
        description={product.description || `Buy ${product.name} from TryNex Lifestyle. Premium quality, fast delivery across Bangladesh.`}
        canonical={`/product/${product.id}`}
        ogImage={product.imageUrl || undefined}
        ogType="product"
        keywords={`${product.name}, buy ${product.name} bangladesh, trynex ${product.name}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.name,
          "description": product.description || `Premium ${product.name} from TryNex Lifestyle`,
          "image": product.imageUrl || "",
          "brand": { "@type": "Brand", "name": "TryNex Lifestyle" },
          "offers": {
            "@type": "Offer",
            "priceCurrency": "BDT",
            "price": product.discountPrice || product.price,
            "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": { "@type": "Organization", "name": "TryNex Lifestyle" },
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": rating,
            "reviewCount": 128,
          },
        }}
      />
      <Navbar />

      <main className="flex-1 pt-header pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-8 font-medium">
            <Link href="/" className="hover:text-orange-600 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-orange-600 transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-gray-700 line-clamp-1">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Images */}
            <div className="space-y-4">
              <motion.div
                className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm"
                layoutId={`product-image-${product.id}`}
              >
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl bg-orange-50">
                    {product.name.toLowerCase().includes('hoodie') ? '🧥' :
                     product.name.toLowerCase().includes('mug') ? '☕' :
                     product.name.toLowerCase().includes('cap') ? '🧢' : '👕'}
                  </div>
                )}
                {discount > 0 && (
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl font-black text-white text-sm"
                    style={{ background: 'linear-gradient(135deg, #E85D04, #FB8500)' }}>
                    -{discount}% OFF
                  </div>
                )}
                {product.stock > 0 && product.stock <= 10 && (
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl font-bold text-amber-700 text-xs"
                    style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.4)' }}>
                    Only {product.stock} left!
                  </div>
                )}
              </motion.div>
            </div>

            {/* Product Info */}
            <div>
              {/* Category + Actions */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-widest text-orange-500">
                  {product.customizable ? "✨ Customizable" : "Ready Made"}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleWishlist({ id: product.id, name: product.name, price: product.price, discountPrice: product.discountPrice, imageUrl: product.imageUrl })}
                    className="p-2.5 rounded-xl transition-all"
                    style={{
                      background: wishlisted ? '#fff1f0' : '#f9fafb',
                      border: `1px solid ${wishlisted ? '#fecaca' : '#e5e7eb'}`
                    }}
                  >
                    <Heart className="w-4.5 h-4.5" style={{ width: '1.1rem', height: '1.1rem', color: wishlisted ? '#E85D04' : '#9ca3af', fill: wishlisted ? '#E85D04' : 'none' }} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 hover:text-gray-700 transition-all"
                  >
                    <Share2 className="w-4.5 h-4.5" style={{ width: '1.1rem', height: '1.1rem' }} />
                  </button>
                </div>
              </div>

              <h1 className="text-3xl font-black font-display tracking-tight text-gray-900 mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-4 h-4"
                      style={{ fill: j < Math.floor(rating) ? '#FB8500' : '#e5e7eb', color: j < Math.floor(rating) ? '#FB8500' : '#e5e7eb' }} />
                  ))}
                </div>
                <span className="font-bold text-sm text-gray-700">{rating}</span>
                <span className="text-sm text-gray-400">(128 reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-4 mb-8 p-5 rounded-2xl" style={{ background: '#fff8f5', border: '1px solid #fde4d0' }}>
                {product.discountPrice ? (
                  <>
                    <span className="text-4xl font-black text-orange-600">{formatPrice(product.discountPrice)}</span>
                    <span className="text-xl line-through text-gray-400">{formatPrice(product.price)}</span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black text-white"
                      style={{ background: '#E85D04' }}>Save {discount}%</span>
                  </>
                ) : (
                  <span className="text-4xl font-black text-gray-900">{formatPrice(product.price)}</span>
                )}
              </div>

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-gray-900 text-sm">Size</p>
                    <button
                      onClick={() => setShowSizeGuide(!showSizeGuide)}
                      className="flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
                    >
                      <Ruler className="w-3.5 h-3.5" /> Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size === selectedSize ? "" : size)}
                        className={cn(
                          "px-4 py-2.5 rounded-xl font-bold text-sm transition-all",
                          selectedSize === size
                            ? "text-white shadow-md"
                            : "bg-white text-gray-700 border border-gray-200 hover:border-orange-400 hover:text-orange-600"
                        )}
                        style={selectedSize === size ? {
                          background: 'linear-gradient(135deg, #E85D04, #FB8500)',
                          border: '1px solid transparent',
                          boxShadow: '0 4px 12px rgba(232,93,4,0.3)'
                        } : undefined}
                      >
                        {size}
                      </button>
                    ))}
                  </div>

                  {/* Size Guide Table */}
                  <AnimatePresence>
                    {showSizeGuide && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-4"
                      >
                        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                          <p className="font-bold text-sm text-gray-900 mb-3">Size Chart (inches)</p>
                          <table className="w-full text-xs text-center">
                            <thead>
                              <tr className="border-b border-gray-100">
                                {["Size", "Chest", "Length", "Sleeve"].map(h => (
                                  <th key={h} className="py-2 font-black text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {SIZE_GUIDE.map((row, i) => (
                                <tr key={row.size} className={cn("border-b border-gray-50", i % 2 === 0 ? "bg-gray-50" : "bg-white")}>
                                  <td className="py-2 font-black text-orange-600">{row.size}</td>
                                  <td className="py-2 text-gray-600">{row.chest}</td>
                                  <td className="py-2 text-gray-600">{row.length}</td>
                                  <td className="py-2 text-gray-600">{row.sleeve}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <p className="font-bold text-gray-900 text-sm mb-3">
                    Color {selectedColor && <span className="text-orange-600 font-normal">— {selectedColor}</span>}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color === selectedColor ? "" : color)}
                        title={color}
                        className="relative"
                      >
                        <div
                          className="w-9 h-9 rounded-xl transition-all hover:scale-110"
                          style={{
                            background: COLOR_MAP[color] || '#aaa',
                            border: selectedColor === color
                              ? '3px solid #E85D04'
                              : color === 'White' ? '2px solid #d1d5db' : '2px solid transparent',
                            boxShadow: selectedColor === color ? '0 0 0 2px white, 0 0 0 4px #E85D04' : '0 2px 6px rgba(0,0,0,0.15)',
                          }}
                        />
                        {selectedColor === color && (
                          <Check className="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.customizable && (
                <div className="mb-6 space-y-4">
                  <label className="block font-bold text-gray-900 text-sm mb-2">
                    <Sparkles className="inline w-4 h-4 mr-1.5 text-orange-500" />
                    Customize Your Design
                  </label>

                  <textarea
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="Describe your design idea, text, placement, or any instructions..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl text-sm font-medium focus:outline-none bg-white border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none text-gray-800 placeholder-gray-400"
                  />

                  <div className="p-4 rounded-2xl border-2 border-dashed border-gray-200 hover:border-orange-300 transition-colors"
                    style={{ background: '#fffaf5' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <ImageIcon className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="font-bold text-sm text-gray-900">Upload Design / Logo</p>
                        <p className="text-xs text-gray-400">PNG, JPG, or SVG — Max 10MB each</p>
                      </div>
                    </div>
                    <label className={cn(
                      "flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold cursor-pointer transition-all",
                      uploadingImage
                        ? "bg-gray-100 text-gray-400 cursor-wait"
                        : "bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-400"
                    )}>
                      <Upload className="w-4 h-4" />
                      {uploadingImage ? "Uploading..." : "Choose Files"}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                    {customImages.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {customImages.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img src={img} alt={`Design ${idx + 1}`}
                              className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
                            <button
                              onClick={() => setCustomImages(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <XIcon className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quantity + Add to Cart */}
              <div className="flex gap-3 mb-6">
                <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors font-bold"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-5 font-black text-gray-900 text-lg min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(quantity + 1, product.stock))}
                    className="px-4 py-3 text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock < 1}
                  className="flex-1 h-14 rounded-xl font-bold text-white flex items-center justify-center gap-2.5 text-base disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
                  style={{
                    background: product.stock > 0
                      ? (addedToBag ? '#16a34a' : 'linear-gradient(135deg, #E85D04, #FB8500)')
                      : '#e5e7eb',
                    boxShadow: product.stock > 0 ? '0 6px 24px rgba(232,93,4,0.35)' : 'none',
                    color: product.stock === 0 ? '#9ca3af' : 'white',
                  }}
                >
                  {addedToBag ? (
                    <><Check className="w-5 h-5" /> Added to Bag!</>
                  ) : (
                    <><ShoppingBag className="w-5 h-5" />{product.stock > 0 ? "Add to Bag" : "Sold Out"}</>
                  )}
                </button>
              </div>

              {/* WhatsApp Order */}
              <button
                onClick={handleWhatsAppOrder}
                className="w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2.5 text-sm transition-all hover:-translate-y-0.5 mb-6"
                style={{ background: '#25D366', color: 'white', boxShadow: '0 4px 16px rgba(37,211,102,0.3)' }}
              >
                <MessageCircle className="w-4.5 h-4.5" style={{ width: '1.1rem', height: '1.1rem' }} />
                Order via WhatsApp
              </button>

              {/* Trust Guarantees */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Truck, label: "Nationwide Delivery", color: '#2563eb', bg: '#eff6ff' },
                  { icon: ShieldCheck, label: "Quality Guarantee", color: '#16a34a', bg: '#f0fdf4' },
                  { icon: RotateCcw, label: "Easy Returns", color: '#d97706', bg: '#fffbeb' },
                ].map(({ icon: Icon, label, color, bg }) => (
                  <div key={label}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl text-center"
                    style={{ background: bg }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                    <span className="text-xs font-semibold text-gray-600 leading-tight">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs: Details & Reviews */}
          <div className="mt-16">
            <div className="flex gap-1 border-b border-gray-200 mb-8">
              {[
                { id: "details", label: "Product Details" },
                { id: "reviews", label: "Customer Reviews (128)" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "details" | "reviews")}
                  className={cn(
                    "px-6 py-3 font-bold text-sm transition-all border-b-2 -mb-px",
                    activeTab === tab.id
                      ? "text-orange-600 border-orange-500"
                      : "text-gray-500 border-transparent hover:text-gray-700"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "details" ? (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                  <div>
                    <h3 className="font-black text-gray-900 mb-4">Description</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {product.description || "Premium quality product from TryNex Lifestyle. Crafted with care using the finest materials, designed to last and impress. Perfect for custom designs, corporate gifts, or personal style."}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 mb-4">Specifications</h3>
                    <div className="space-y-3">
                      {[
                        { label: "Material", value: "230-320 GSM Premium Cotton" },
                        { label: "Print Method", value: "DTF / Screen Print / Sublimation" },
                        { label: "Available Sizes", value: product.sizes?.join(", ") || "S, M, L, XL, 2XL" },
                        { label: "Available Colors", value: product.colors?.join(", ") || "Multiple" },
                        { label: "Production Time", value: "48 hours" },
                        { label: "Delivery", value: "3-7 business days (all BD)" },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-start gap-3 py-2 border-b border-gray-100">
                          <span className="font-bold text-sm text-gray-500 w-36 shrink-0">{label}</span>
                          <span className="text-sm text-gray-800 font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  {/* Rating Summary */}
                  <div className="flex items-center gap-8 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">
                    <div className="text-center">
                      <div className="text-5xl font-black text-gray-900">{rating}</div>
                      <div className="flex justify-center mt-2">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} className="w-4 h-4"
                            style={{ fill: j < Math.floor(rating) ? '#FB8500' : '#e5e7eb', color: j < Math.floor(rating) ? '#FB8500' : '#e5e7eb' }} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">128 reviews</p>
                    </div>
                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map((stars) => (
                        <div key={stars} className="flex items-center gap-3">
                          <span className="text-xs font-bold text-gray-500 w-4">{stars}</span>
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full"
                              style={{ width: `${stars === 5 ? 75 : stars === 4 ? 18 : stars === 3 ? 5 : stars === 2 ? 1 : 1}%`, background: '#FB8500' }} />
                          </div>
                          <span className="text-xs text-gray-400 w-8 text-right">{stars === 5 ? "96" : stars === 4 ? "23" : stars === 3 ? "6" : stars === 2 ? "2" : "1"}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {REVIEW_SAMPLES.map((review, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm"
                            style={{ background: 'linear-gradient(135deg, #E85D04, #FB8500)' }}>
                            {review.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{review.name}</p>
                            <p className="text-xs text-gray-400">{review.location} · {review.date}</p>
                          </div>
                        </div>
                        <div className="flex">
                          {Array.from({ length: review.rating }).map((_, j) => (
                            <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{review.text}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {relatedProducts.length > 0 && (
        <section className="py-16 px-4 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-3"
                  style={{ background: '#fff4ee', color: '#E85D04' }}>
                  <Sparkles className="w-3 h-3" /> You may also like
                </span>
                <h2 className="text-2xl font-black font-display tracking-tight text-gray-900">Related Products</h2>
              </div>
              <Link href="/products" className="flex items-center gap-1.5 font-bold text-sm text-orange-600 hover:text-orange-700 transition-colors">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
