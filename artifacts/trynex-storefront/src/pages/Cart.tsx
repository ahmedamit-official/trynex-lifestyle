import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/SEOHead";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, ShieldCheck, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, subtotal } = useCart();
  const [, setLocation] = useLocation();

  const shippingCost = subtotal > 0 && subtotal < 1500 ? 100 : 0;
  const total = subtotal + shippingCost;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEOHead title="Your Cart" description="Review your shopping cart at TryNex Lifestyle." noindex />
      <Navbar />

      <main className="flex-1 pt-header pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-2">Your Cart</p>
            <h1 className="text-5xl font-black font-display tracking-tighter text-gray-900">
              {items.length > 0 ? `${items.length} item${items.length > 1 ? 's' : ''}` : "Your bag is empty"}
            </h1>
          </div>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-28 rounded-3xl"
              style={{ background: 'white', border: '1px dashed #e5e7eb' }}
            >
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: '#f3f4f6' }}>
                <ShoppingBag className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-gray-900">Nothing here yet</h2>
              <p className="text-gray-400 mb-8">Add some amazing products to your cart</p>
              <Link
                href="/products"
                className="btn-glow inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #E85D04, #FB8500)' }}
              >
                Browse Collection <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-7 space-y-4">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -30, height: 0 }}
                      className="flex gap-5 p-4 rounded-2xl"
                      style={{ background: 'white', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                    >
                      {/* Image */}
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0" style={{ background: '#f3f4f6' }}>
                        <img
                          src={item.imageUrl || `https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop`}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div className="flex justify-between items-start gap-3">
                          <div className="min-w-0">
                            <Link href={`/product/${item.productId}`} className="font-bold text-base leading-tight hover:text-orange-600 transition-colors block truncate text-gray-900">
                              {item.name}
                            </Link>
                            <div className="flex flex-wrap gap-2 mt-1.5">
                              {item.size && (
                                <span className="text-xs px-2 py-0.5 rounded-md font-semibold" style={{ background: '#f3f4f6', color: '#6b7280' }}>
                                  Size: {item.size}
                                </span>
                              )}
                              {item.color && (
                                <span className="text-xs px-2 py-0.5 rounded-md font-semibold capitalize" style={{ background: '#f3f4f6', color: '#6b7280' }}>
                                  {item.color}
                                </span>
                              )}
                            </div>
                            {item.customNote && (
                              <p className="text-xs mt-2 italic text-gray-400 border-l-2 border-orange-200 pl-2 pr-2 truncate">
                                "{item.customNote}"
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 rounded-lg transition-colors hover:bg-red-50 hover:text-red-500 text-gray-300 shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden" style={{ background: '#f9fafb' }}>
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-2 text-gray-400 hover:text-gray-700 transition-colors">
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-black w-8 text-center text-sm text-gray-900">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-2 text-gray-400 hover:text-gray-700 transition-colors">
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="font-black text-base text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="lg:col-span-5">
                <div className="sticky top-28 rounded-3xl p-7" style={{ background: 'white', border: '1px solid #e5e7eb' }}>
                  <h3 className="text-xl font-bold font-display mb-6 text-gray-900">Order Summary</h3>

                  <div className="space-y-3 mb-6 text-sm">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal</span>
                      <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Shipping</span>
                      <span className={shippingCost === 0 ? "font-bold text-green-600" : "font-semibold text-gray-900"}>
                        {shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}
                      </span>
                    </div>
                    {subtotal > 0 && subtotal < 1500 && (
                      <div className="flex items-center gap-2 p-3 rounded-xl text-xs font-semibold"
                        style={{ background: 'rgba(232,93,4,0.06)', border: '1px solid rgba(232,93,4,0.15)', color: '#E85D04' }}>
                        <Tag className="w-3.5 h-3.5 shrink-0" />
                        Add {formatPrice(1500 - subtotal)} more for FREE shipping!
                      </div>
                    )}
                    <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                      <span className="font-bold text-lg text-gray-900">Total</span>
                      <span className="font-black text-3xl text-orange-600">{formatPrice(total)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setLocation("/checkout")}
                    className="btn-glow w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2.5 text-base mb-4"
                    style={{ background: 'linear-gradient(135deg, #E85D04, #FB8500)', boxShadow: '0 6px 24px rgba(232,93,4,0.35)' }}
                  >
                    Checkout <ArrowRight className="w-5 h-5" />
                  </button>

                  <Link
                    href="/products"
                    className="block text-center text-sm font-semibold text-gray-400 hover:text-gray-700 transition-colors py-2"
                  >
                    ← Continue Shopping
                  </Link>

                  <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
                    <ShieldCheck className="w-4 h-4 text-orange-400" />
                    Secure & encrypted checkout
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
