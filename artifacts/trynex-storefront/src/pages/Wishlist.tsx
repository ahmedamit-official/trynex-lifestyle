import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/SEOHead";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Heart, ShoppingCart, ArrowRight, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function Wishlist() {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (item: typeof items[0]) => {
    addToCart({ productId: item.id, name: item.name, price: item.discountPrice || item.price, quantity: 1, imageUrl: item.imageUrl });
    toast({ title: "✓ Added to cart!", description: item.name });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SEOHead title="My Wishlist" description="Your saved items at TryNex Lifestyle." noindex />
      <Navbar />
      <main className="flex-1 pt-header pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="mb-10">
            <span className="section-eyebrow mb-4">
              <Heart className="w-3 h-3" /> My Wishlist
            </span>
            <h1 className="text-4xl font-black font-display tracking-tight text-gray-900 mt-3">
              Saved Items <span className="text-gray-400 font-normal">({items.length})</span>
            </h1>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'linear-gradient(135deg, #fff1f0, #ffe4d6)', border: '2px solid #fed7c3' }}>
                <Heart className="w-9 h-9 text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Your wishlist is empty</h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">Save your favourite items here to come back to them later.</p>
              <Link href="/products" className="btn-primary inline-flex">
                Browse Products <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">🛍️</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{item.name}</h3>
                      <div className="flex items-center gap-2 mb-4">
                        {item.discountPrice ? (
                          <>
                            <span className="font-black text-orange-600">{formatPrice(item.discountPrice)}</span>
                            <span className="text-sm line-through text-gray-400">{formatPrice(item.price)}</span>
                          </>
                        ) : (
                          <span className="font-black text-gray-900">{formatPrice(item.price)}</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
                          style={{ background: 'linear-gradient(135deg, #E85D04, #FB8500)' }}
                        >
                          <ShoppingCart className="w-4 h-4" /> Add to Cart
                        </button>
                        <button
                          onClick={() => removeFromWishlist(item.id)}
                          className="p-2.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all border border-gray-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
