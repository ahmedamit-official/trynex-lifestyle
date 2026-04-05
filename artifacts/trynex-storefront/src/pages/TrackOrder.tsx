import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useTrackOrder } from "@workspace/api-client-react";
import {
  Package, Search, Clock, CheckCircle2, Truck, MapPin,
  XCircle, AlertTriangle, RefreshCw, Box, Star, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice, cn, getApiUrl } from "@/lib/utils";

const inputClass = "w-full px-4 py-3.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-foreground/25";
const inputStyle = { background: 'hsl(0 0% 9%)', border: '1px solid rgba(255,255,255,0.07)', color: 'hsl(var(--foreground))' };

const PAYMENT_STATUSES: Record<string, { label: string; color: string; bg: string; border: string; icon: any; desc: string }> = {
  pending: {
    label: 'Not Paid', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)',
    icon: XCircle, desc: 'Payment not yet received'
  },
  not_paid: {
    label: 'Not Paid', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)',
    icon: XCircle, desc: 'Payment not yet received'
  },
  submitted: {
    label: 'Under Review', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)',
    icon: RefreshCw, desc: 'Your payment is being verified by admin'
  },
  verified: {
    label: 'Payment Confirmed', color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)',
    icon: CheckCircle2, desc: 'Payment received and confirmed!'
  },
  wrong: {
    label: 'Payment Issue', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)',
    icon: AlertTriangle, desc: 'Issue with payment — contact us on WhatsApp'
  },
  cod: {
    label: 'Cash on Delivery', color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)',
    icon: CheckCircle2, desc: 'Pay when you receive your order'
  },
};

const ORDER_STEPS = [
  { key: 'pending', icon: Clock, label: 'Order Placed', desc: 'Your order has been received' },
  { key: 'processing', icon: Package, label: 'Processing', desc: 'Order is being prepared' },
  { key: 'shipped', icon: Box, label: 'Shipped', desc: 'Sent to delivery partner' },
  { key: 'ongoing', icon: Truck, label: 'On the Way', desc: 'Your order is in transit' },
  { key: 'delivered', icon: CheckCircle2, label: 'Delivered', desc: 'Successfully delivered!' },
];

function getOrderStepIndex(status: string): number {
  const map: Record<string, number> = {
    pending: 0,
    processing: 1,
    shipped: 2,
    ongoing: 3,
    delivered: 4,
    cancelled: -1,
  };
  return map[status] ?? 0;
}

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [liveOrderData, setLiveOrderData] = useState<any>(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { mutateAsync: track, data: order, isPending, error, reset } = useTrackOrder();

  useEffect(() => {
    if (order) {
      setLiveOrderData(order);
    }
  }, [order]);

  useEffect(() => {
    if (liveOrderData && liveOrderData.orderNumber) {
      setIsPolling(true);
      const poll = async () => {
        try {
          const res = await fetch(getApiUrl('/api/orders/track'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderNumber: liveOrderData.orderNumber, email: email || liveOrderData.customerEmail })
          });
          if (res.ok) {
            const data = await res.json();
            setLiveOrderData(data);
          }
        } catch {}
      };
      pollingRef.current = setInterval(poll, 30000);
      return () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setIsPolling(false);
      };
    }
  }, [liveOrderData?.orderNumber]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    setLiveOrderData(null);
    if (pollingRef.current) clearInterval(pollingRef.current);
    await track({ data: { orderNumber, email: email || 'noemail@trynex.com' } }).catch(() => {});
  };

  const displayOrder = liveOrderData;
  const stepIdx = displayOrder ? getOrderStepIndex(displayOrder.status) : -1;
  const paymentInfo = displayOrder ? PAYMENT_STATUSES[displayOrder.paymentStatus] || PAYMENT_STATUSES.pending : null;
  const PayIcon = paymentInfo?.icon;

  const TRYNEX_NUMBER = "+8801747292277";

  const paymentMethodLabel: Record<string, string> = {
    cod: 'Cash on Delivery', bkash: 'bKash', nagad: 'Nagad', rocket: 'Rocket'
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-28 pb-24 flex flex-col items-center">
        <div className="max-w-2xl w-full px-4 sm:px-6">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex w-20 h-20 rounded-3xl items-center justify-center mb-6"
              style={{
                background: 'rgba(255,107,43,0.1)',
                border: '1px solid rgba(255,107,43,0.2)',
                boxShadow: '0 0 40px rgba(255,107,43,0.1)'
              }}>
              <MapPin className="w-9 h-9 text-primary" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-primary mb-3">Live Tracking</p>
            <h1 className="text-5xl font-black font-display tracking-tighter mb-4">Track Your Order</h1>
            <p className="text-foreground/45 text-base">Real-time updates on your TryNex order status.</p>
          </motion.div>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-7 rounded-3xl mb-8"
            style={{ background: 'hsl(0 0% 7%)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <form onSubmit={handleTrack} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-foreground/40 mb-2">
                    Order Number *
                  </label>
                  <input
                    required
                    placeholder="e.g. TN250325XXXX"
                    value={orderNumber}
                    onChange={e => setOrderNumber(e.target.value.toUpperCase())}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-foreground/40 mb-2">
                    Email Address (used at checkout)
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isPending || !orderNumber}
                className="btn-glow w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2.5 text-base disabled:opacity-50"
                style={{ background: 'hsl(var(--primary))' }}
              >
                {isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Searching...</> : <><Search className="w-5 h-5" /> Track Order</>}
              </button>
            </form>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {hasSearched && !isPending && error && !displayOrder && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center p-6 rounded-2xl text-sm font-semibold mb-6"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
              >
                <XCircle className="w-6 h-6 mx-auto mb-2 opacity-70" />
                Order not found. Please check your Order Number and Email, then try again.
                <p className="text-xs text-foreground/30 mt-2">Need help? WhatsApp: {TRYNEX_NUMBER}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Order Result */}
          <AnimatePresence>
            {displayOrder && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Main Card */}
                <div className="rounded-3xl overflow-hidden"
                  style={{ background: 'hsl(0 0% 7%)', border: '1px solid rgba(255,255,255,0.08)' }}>

                  {/* Status Header */}
                  <div className="p-6 sm:p-8"
                    style={{ background: 'linear-gradient(135deg, hsl(0 0% 8%) 0%, hsl(0 0% 6%) 100%)' }}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-foreground/30 mb-1">Order Reference</p>
                        <p className="text-2xl font-black font-mono text-primary">{displayOrder.orderNumber}</p>
                      </div>
                      {isPolling && (
                        <div className="flex items-center gap-1.5 text-xs text-foreground/30">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Live</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-foreground/30 mb-8">
                      Placed on {displayOrder.createdAt ? new Date(displayOrder.createdAt).toLocaleString('en-BD', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                    </p>

                    {/* Order Progress Steps */}
                    {displayOrder.status !== 'cancelled' ? (
                      <div className="relative">
                        <div className="absolute top-5 left-5 right-5 h-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
                        {stepIdx > 0 && (
                          <div
                            className="absolute top-5 left-5 h-0.5 rounded-full transition-all duration-1000"
                            style={{
                              background: 'linear-gradient(90deg, hsl(var(--primary)), rgba(255,107,43,0.5))',
                              width: `${(stepIdx / (ORDER_STEPS.length - 1)) * (100 - 12)}%`,
                              maxWidth: 'calc(100% - 40px)'
                            }}
                          />
                        )}
                        <div className="relative flex justify-between">
                          {ORDER_STEPS.map((step, i) => {
                            const isActive = stepIdx >= i;
                            const isCurrent = stepIdx === i;
                            const Icon = step.icon;
                            return (
                              <div key={step.key} className="flex flex-col items-center gap-2 z-10">
                                <motion.div
                                  animate={isCurrent ? { scale: [1, 1.15, 1] } : {}}
                                  transition={{ repeat: Infinity, duration: 2 }}
                                  className="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500"
                                  style={{
                                    background: isActive ? 'hsl(var(--primary))' : 'hsl(0 0% 10%)',
                                    borderColor: isActive ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.08)',
                                    color: isActive ? 'white' : 'rgba(255,255,255,0.3)',
                                    boxShadow: isCurrent ? '0 0 20px rgba(255,107,43,0.5)' : undefined
                                  }}
                                >
                                  <Icon className="w-4 h-4" />
                                </motion.div>
                                <span className={cn("text-[10px] font-black text-center hidden sm:block", isActive ? "text-foreground" : "text-foreground/25")}>
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-4 rounded-2xl"
                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <XCircle className="w-6 h-6 text-red-400" />
                        <div>
                          <p className="font-black text-red-400">Order Cancelled</p>
                          <p className="text-xs text-foreground/40">Contact us if you need assistance</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment Status */}
                  {paymentInfo && displayOrder.paymentMethod !== 'cod' && (
                    <div className="px-6 sm:px-8 py-5 border-t border-white/5">
                      <p className="text-xs font-black uppercase tracking-widest text-foreground/30 mb-3">Payment Status</p>
                      <div className="flex items-center gap-4 p-4 rounded-2xl"
                        style={{ background: paymentInfo.bg, border: `1px solid ${paymentInfo.border}` }}>
                        {PayIcon && <PayIcon className="w-6 h-6 shrink-0" style={{ color: paymentInfo.color }} />}
                        <div className="flex-1">
                          <p className="font-black text-sm" style={{ color: paymentInfo.color }}>{paymentInfo.label}</p>
                          <p className="text-xs text-foreground/40 mt-0.5">{paymentInfo.desc}</p>
                        </div>
                        {displayOrder.paymentStatus === 'verified' && (
                          <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                        )}
                      </div>
                      {displayOrder.paymentStatus === 'submitted' && (
                        <p className="text-xs text-foreground/30 mt-2 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" /> Verification takes 5–30 minutes. This page refreshes automatically.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Customer Info */}
                  <div className="px-6 sm:px-8 py-5 border-t border-white/5">
                    <p className="text-xs font-black uppercase tracking-widest text-foreground/30 mb-3">Delivery Details</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl" style={{ background: 'hsl(0 0% 9%)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-1">Customer</p>
                        <p className="font-bold text-sm">{displayOrder.customerName}</p>
                      </div>
                      <div className="p-3 rounded-xl" style={{ background: 'hsl(0 0% 9%)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-1">Payment</p>
                        <p className="font-bold text-sm">{paymentMethodLabel[displayOrder.paymentMethod] || displayOrder.paymentMethod}</p>
                      </div>
                      {displayOrder.shippingDistrict && (
                        <div className="col-span-2 p-3 rounded-xl" style={{ background: 'hsl(0 0% 9%)', border: '1px solid rgba(255,255,255,0.04)' }}>
                          <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-1">Shipping District</p>
                          <p className="font-bold text-sm">{displayOrder.shippingDistrict}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="px-6 sm:px-8 py-5 border-t border-white/5">
                    <p className="text-xs font-black uppercase tracking-widest text-foreground/30 mb-4">Items Ordered</p>
                    <div className="space-y-3">
                      {displayOrder.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0"
                            style={{ background: 'hsl(0 0% 10%)' }}>
                            {item.productImage && (
                              <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm leading-snug">{item.productName}</p>
                            <p className="text-xs text-foreground/35 mt-0.5">
                              Qty: {item.quantity}
                              {item.size ? ` · Size: ${item.size}` : ''}
                              {item.color ? ` · Color: ${item.color}` : ''}
                            </p>
                          </div>
                          <span className="font-bold text-primary text-sm shrink-0">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 pt-4 border-t border-white/5 space-y-2">
                      <div className="flex justify-between text-sm text-foreground/40">
                        <span>Subtotal</span><span>{formatPrice(displayOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-foreground/40">
                        <span>Shipping</span>
                        <span>{displayOrder.shippingCost === 0 ? "FREE" : formatPrice(displayOrder.shippingCost)}</span>
                      </div>
                      <div className="flex justify-between font-black text-lg pt-2 border-t border-white/5">
                        <span>Total</span><span className="text-primary">{formatPrice(displayOrder.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Help Box */}
                <div className="p-5 rounded-2xl text-center"
                  style={{ background: 'rgba(255,107,43,0.05)', border: '1px solid rgba(255,107,43,0.1)' }}>
                  <p className="text-sm text-foreground/50">
                    Questions? WhatsApp us at{' '}
                    <a
                      href={`https://wa.me/${TRYNEX_NUMBER.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-black text-primary hover:underline"
                    >
                      {TRYNEX_NUMBER}
                    </a>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
