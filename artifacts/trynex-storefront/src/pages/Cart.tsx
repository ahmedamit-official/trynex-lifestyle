import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
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
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Your Cart</p>
            <h1 className="text-5xl font-black font-display tracking-tighter">
              {items.length > 0 ? `${items.length} item${items.length > 1 ? 's' : ''}` : "Your bag is empty"}
            </h1>
          </div>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-28 rounded-3xl"
              style={{ background: 'hsl(0 0% 7%)', border: '1px dashed rgba(255,255,255,0.07)' }}
            >
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'hsl(0 0% 10%)' }}>
                <ShoppingBag className="w-10 h-10 text-foreground/20" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Nothing here yet</h2>
              <p className="text-foreground/40 mb-8">Add some amazing products to your cart</p>
              <Link
                href="/products"
                className="btn-glow inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white"
                style={{ background: 'hsl(var(--primary))' }}
              >
                Browse Collection <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Items */}
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
                      style={{ background: 'hsl(0 0% 7%)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      {/* Image */}
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0" style={{ background: 'hsl(0 0% 10%)' }}>
                        <img
                          src={item.imageUrl || `https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop`}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div className="flex justify-between items-start gap-3">
                          <div className="min-w-0">
                            <Link href={`/product/${item.productId}`} className="font-bold text-base leading-tight hover:text-primary transition-colors block truncate">
                              {item.name}
                            </Link>
                            <div className="flex flex-wrap gap-2 mt-1.5">
                              {item.size && (
                                <span className="text-xs px-2 py-0.5 rounded-md font-semibold" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                                  Size: {item.size}
                                </span>
                              )}
                              {item.color && (
                                <span className="text-xs px-2 py-0.5 rounded-md font-semibold capitalize" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                                  {item.color}
                                </span>
                              )}
                            </div>
                            {item.customNote && (
                              <p className="text-xs mt-2 italic text-foreground/35 border-l-2 border-primary/30 pl-2 pr-2 truncate">
                                "{item.customNote}"
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 rounded-lg transition-colors hover:bg-destructive/10 hover:text-destructive text-foreground/30 shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center rounded-xl border border-white/10 overflow-hidden" style={{ background: 'hsl(0 0% 9%)' }}>
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-2 text-foreground/40 hover:text-foreground transition-colors">
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-black w-8 text-center text-sm">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-2 text-foreground/40 hover:text-foreground transition-colors">
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="font-black text-base">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Summary */}
              <div className="lg:col-span-5">
                <div className="sticky top-28 rounded-3xl p-7" style={{ background: 'hsl(0 0% 7%)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <h3 className="text-xl font-bold font-display mb-6">Order Summary</h3>

                  <div className="space-y-3 mb-6 text-sm">
                    <div className="flex justify-between text-foreground/50">
                      <span>Subtotal</span>
                      <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-foreground/50">
                      <span>Shipping</span>
                      <span className={shippingCost === 0 ? "font-bold text-green-400" : "font-semibold text-foreground"}>
                        {shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}
                      </span>
                    </div>
                    {subtotal > 0 && subtotal < 1500 && (
                      <div className="flex items-center gap-2 p-3 rounded-xl text-xs font-semibold" style={{ background: 'rgba(255,107,43,0.08)', border: '1px solid rgba(255,107,43,0.15)', color: 'hsl(var(--primary))' }}>
                        <Tag className="w-3.5 h-3.5 shrink-0" />
                        Add {formatPrice(1500 - subtotal)} more for FREE shipping!
                      </div>
                    )}
                    <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                      <span className="font-bold text-lg">Total</span>
                      <span className="font-black text-3xl text-primary">{formatPrice(total)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setLocation("/checkout")}
                    className="btn-glow w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2.5 text-base mb-4"
                    style={{ background: 'hsl(var(--primary))' }}
                  >
                    Checkout <ArrowRight className="w-5 h-5" />
                  </button>

                  <Link
                    href="/products"
                    className="block text-center text-sm font-semibold text-foreground/40 hover:text-foreground transition-colors py-2"
                  >
                    ← Continue Shopping
                  </Link>

                  <div className="mt-6 flex items-center justify-center gap-2 text-xs text-foreground/30 font-medium">
                    <ShieldCheck className="w-4 h-4 text-primary/60" />
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
