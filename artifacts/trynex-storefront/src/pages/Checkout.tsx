import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { useCart } from "@/context/CartContext";
import { useCreateOrder, CreateOrderRequestPaymentMethod } from "@workspace/api-client-react";
import { formatPrice, getApiUrl } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2, ChevronRight, CreditCard, Banknote,
  ShieldCheck, Copy, Check, ArrowRight,
  Smartphone, Info, Tag, MapPin, MessageCircle, Phone, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().min(11, "Valid phone number required"),
  shippingAddress: z.string().min(10, "Full address required"),
  shippingDistrict: z.string().min(2, "District is required"),
  notes: z.string().optional()
});
type CheckoutFormData = z.infer<typeof checkoutSchema>;

const DISTRICTS = [
  "Dhaka","Chittagong","Sylhet","Rajshahi","Khulna","Barisal",
  "Rangpur","Mymensingh","Comilla","Narayanganj","Gazipur","Tangail",
  "Faridpur","Jessore","Bogra","Dinajpur","Pabna","Sirajganj","Noakhali",
  "Feni","Lakshmipur","Chandpur","Brahmanbaria","Narsingdi","Munshiganj",
  "Manikganj","Shariatpur","Madaripur","Gopalganj","Kishoreganj",
  "Netrokona","Jamalpur","Sherpur","Sunamganj","Habiganj","Moulvibazar",
  "Chapainawabganj","Natore","Joypurhat","Naogaon","Nawabganj",
  "Kurigram","Gaibandha","Nilphamari","Lalmonirhat","Thakurgaon",
  "Panchagarh","Chuadanga","Kushtia","Meherpur","Magura","Jhenaidah",
  "Narail","Satkhira","Bagerhat","Pirojpur","Jhalokati","Bhola",
  "Patuakhali","Barguna","Bandarban","Rangamati","Khagrachhari","Other"
];

// Local BD number — no +88 prefix; bKash/Nagad/Upay don't support international format
const PAYMENT_NUMBER_LOCAL = "01747292277";
// WhatsApp support (different number for customer support)
const WHATSAPP_NUMBER_LOCAL = "01903426915";
const WHATSAPP_NUMBER_INTL = "+8801903426915";

const inputClass = "w-full px-4 py-3.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-foreground/25";
const inputStyle = { background: 'hsl(0 0% 9%)', border: '1px solid rgba(255,255,255,0.07)', color: 'hsl(var(--foreground))' };

type CheckoutStep = 'form' | 'gateway' | 'success';
type MobileMethod = 'bkash' | 'nagad' | 'rocket';

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, subtotal, clearCart } = useCart();
  const { toast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState<CreateOrderRequestPaymentMethod>('cod');
  // For COD: which mobile method to use for the 15% advance
  const [codAdvanceMethod, setCodAdvanceMethod] = useState<MobileMethod>('bkash');
  const [step, setStep] = useState<CheckoutStep>('form');
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [lastFour, setLastFour] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Use refs for snapshot amounts — updated synchronously before any state changes
  // This avoids React batching issues when cart is cleared
  const snapshotRef = useRef({ total: 0, advance: 0, shipping: 0 });

  const { mutateAsync: createOrder, isPending } = useCreateOrder();

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { shippingDistrict: 'Dhaka' }
  });

  // Compute live totals from cart items directly (not from context computed value)
  // so snapshot captured in onSubmit is always accurate
  const liveSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = liveSubtotal > 0 && liveSubtotal < 1500 ? 100 : 0;
  const total = liveSubtotal + shippingCost;
  const advanceAmount = Math.ceil(total * 0.15);

  // Gateway display values always come from the ref snapshot (set before cart is cleared)
  const displayTotal = step === 'form' ? total : snapshotRef.current.total;
  const displayAdvance = step === 'form' ? advanceAmount : snapshotRef.current.advance;
  const displayShipping = step === 'form' ? shippingCost : snapshotRef.current.shipping;
  const displayRemaining = displayTotal - displayAdvance;

  if (items.length === 0 && step === 'form') {
    setLocation("/cart");
    return null;
  }

  // The effective mobile payment method — direct or COD advance method
  const effectiveGatewayMethod: MobileMethod =
    paymentMethod === 'cod' ? codAdvanceMethod : (paymentMethod as MobileMethod);

  const isMobilePayment = paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket';

  const onSubmit = async (data: CheckoutFormData) => {
    // Compute snapshot from items directly — guaranteed accurate before cart is cleared
    const snapSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const snapShipping = snapSubtotal > 0 && snapSubtotal < 1500 ? 100 : 0;
    const snapTotal = snapSubtotal + snapShipping;
    const snapAdvance = Math.ceil(snapTotal * 0.15);

    // Write to ref FIRST — synchronous, no batching issues
    snapshotRef.current = { total: snapTotal, advance: snapAdvance, shipping: snapShipping };

    try {
      const order = await createOrder({
        data: {
          ...data,
          paymentMethod,
          items: items.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            size: i.size,
            color: i.color,
            customNote: i.customNote
          }))
        }
      });

      setCreatedOrder(order);
      clearCart();

      // All orders (including COD) go to gateway to pay 15% advance
      setStep('gateway');
    } catch {
      toast({ title: "Failed to place order", description: "Please check your details and try again.", variant: "destructive" });
    }
  };

  const handlePaymentSubmit = async () => {
    if (!lastFour || lastFour.length < 4) {
      toast({ title: "Please enter last 4 digits", description: "Enter the last 4 digits of your sending number.", variant: "destructive" });
      return;
    }
    setIsSubmittingPayment(true);
    try {
      await fetch(getApiUrl(`/api/orders/${createdOrder.id}/payment-info`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastFourDigits: lastFour, promoCode: promoCode || undefined })
      });
      setStep('success');
    } catch {
      toast({ title: "Submission failed", description: "Please screenshot this page and contact us on WhatsApp.", variant: "destructive" });
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const copyNumber = async () => {
    await navigator.clipboard.writeText(PAYMENT_NUMBER_LOCAL);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 3000);
  };

  const gatewayTheme = {
    bkash: {
      name: 'bKash',
      primary: '#e2136e',
      light: 'rgba(226,19,110,0.12)',
      border: 'rgba(226,19,110,0.3)',
      glow: '0 0 60px rgba(226,19,110,0.15)',
      badge: 'linear-gradient(135deg, #e2136e 0%, #c0105c 100%)',
      logo: <span className="text-4xl font-black" style={{ color: '#e2136e' }}>bKash</span>,
    },
    nagad: {
      name: 'Nagad',
      primary: '#f7941d',
      light: 'rgba(247,148,29,0.12)',
      border: 'rgba(247,148,29,0.3)',
      glow: '0 0 60px rgba(247,148,29,0.15)',
      badge: 'linear-gradient(135deg, #f7941d 0%, #e07800 100%)',
      logo: <span className="text-4xl font-black" style={{ color: '#f7941d' }}>Nagad</span>,
    },
    rocket: {
      name: 'Rocket',
      primary: '#7c3aed',
      light: 'rgba(124,58,237,0.12)',
      border: 'rgba(124,58,237,0.3)',
      glow: '0 0 60px rgba(124,58,237,0.15)',
      badge: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
      logo: <span className="text-4xl font-black" style={{ color: '#7c3aed' }}>Rocket</span>,
    },
  };

  const theme = gatewayTheme[effectiveGatewayMethod];

  /* ─── SUCCESS SCREEN ─── */
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 20 }}
          className="max-w-md w-full rounded-3xl p-8 text-center"
          style={{ background: 'hsl(0 0% 7%)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 30px 80px rgba(0,0,0,0.5)' }}
        >
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2, damping: 15 }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(74,222,128,0.1)', border: '2px solid rgba(74,222,128,0.3)', boxShadow: '0 0 30px rgba(74,222,128,0.2)' }}
          >
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </motion.div>

          <h1 className="text-4xl font-black font-display mb-2">Order Confirmed!</h1>
          <p className="text-foreground/45 mb-6 leading-relaxed text-sm">
            Your payment info was submitted. Our team will verify and confirm your order shortly.
          </p>

          <div className="p-5 rounded-2xl mb-4" style={{ background: 'hsl(0 0% 9%)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs font-bold text-foreground/30 uppercase tracking-widest mb-1">Order Reference</p>
            <p className="text-2xl font-black tracking-wider text-primary font-mono">{createdOrder?.orderNumber}</p>
            <p className="text-xs text-foreground/25 mt-1">Save this number to track your order</p>
          </div>

          <div className="p-4 rounded-2xl mb-4 text-left" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <p className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> Payment Under Verification
            </p>
            <div className="text-xs text-foreground/50 space-y-1">
              <p>Advance paid: <strong className="text-foreground">{formatPrice(snapshotRef.current.advance)}</strong></p>
              <p>Remaining on delivery: <strong className="text-foreground">{formatPrice(snapshotRef.current.total - snapshotRef.current.advance)}</strong></p>
            </div>
          </div>

          {/* WhatsApp Support */}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER_INTL.replace('+', '')}?text=Hi TryNex! My order number is ${createdOrder?.orderNumber}. I need help.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-white text-sm mb-2"
            style={{ background: '#25D366', boxShadow: '0 4px 20px rgba(37,211,102,0.3)' }}
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp — {WHATSAPP_NUMBER_LOCAL}
          </a>
          <a
            href={`tel:${WHATSAPP_NUMBER_INTL}`}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm mb-3"
            style={{ background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)', color: '#4ade80' }}
          >
            <Phone className="w-4 h-4" /> Call Us — {WHATSAPP_NUMBER_LOCAL}
          </a>

          <button onClick={() => setLocation(`/track`)}
            className="btn-glow w-full py-4 rounded-xl font-bold text-white text-base mb-3"
            style={{ background: 'hsl(var(--primary))' }}>
            Track My Order
          </button>
          <button onClick={() => setLocation("/")}
            className="w-full py-3.5 rounded-xl font-semibold text-sm text-foreground/50 hover:text-foreground transition-colors"
            style={{ background: 'hsl(0 0% 9%)', border: '1px solid rgba(255,255,255,0.06)' }}>
            Continue Shopping
          </button>
        </motion.div>
      </div>
    );
  }

  /* ─── PAYMENT GATEWAY SCREEN ─── */
  if (step === 'gateway') {
    const snapTotal = snapshotRef.current.total;
    const snapAdvance = snapshotRef.current.advance;
    const snapRemaining = snapTotal - snapAdvance;

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-4"
        >
          {/* Gateway Card */}
          <div className="rounded-3xl overflow-hidden"
            style={{ background: 'hsl(0 0% 7%)', border: `1px solid ${theme.border}`, boxShadow: theme.glow }}>

            {/* Header */}
            <div className="p-6 text-center" style={{ background: theme.light, borderBottom: `1px solid ${theme.border}` }}>
              <div className="mb-2">{theme.logo}</div>
              <p className="text-xs font-black uppercase tracking-widest text-foreground/40 mb-1">Payment Gateway</p>
              <p className="text-sm text-foreground/60">
                {paymentMethod === 'cod'
                  ? 'Pay 15% advance via mobile banking — rest on delivery'
                  : 'Complete your 15% advance payment below'}
              </p>
            </div>

            <div className="p-6 space-y-5">

              {/* For COD: let user switch method on gateway screen */}
              {paymentMethod === 'cod' && (
                <div className="p-3 rounded-xl" style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)' }}>
                  <p className="text-xs font-black text-green-400 mb-2 flex items-center gap-1.5">
                    <Banknote className="w-3.5 h-3.5" /> Cash on Delivery — 15% Advance Required
                  </p>
                  <p className="text-xs text-foreground/40 mb-3">
                    Choose how to send the 15% advance. The rest ({formatPrice(snapRemaining)}) will be collected when we deliver your order.
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['bkash', 'nagad', 'rocket'] as MobileMethod[]).map(m => (
                      <button
                        key={m}
                        onClick={() => setCodAdvanceMethod(m)}
                        className="py-2 px-3 rounded-lg font-black text-xs transition-all"
                        style={{
                          background: codAdvanceMethod === m ? gatewayTheme[m].light : 'rgba(255,255,255,0.04)',
                          border: codAdvanceMethod === m ? `1px solid ${gatewayTheme[m].border}` : '1px solid rgba(255,255,255,0.06)',
                          color: codAdvanceMethod === m ? gatewayTheme[m].primary : 'rgba(255,255,255,0.4)',
                        }}
                      >
                        {m === 'bkash' ? 'bKash' : m === 'nagad' ? 'Nagad' : 'Rocket'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Order info row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl" style={{ background: 'hsl(0 0% 9%)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p className="text-[10px] font-black uppercase text-foreground/30 mb-1">Order #</p>
                  <p className="font-black text-sm font-mono text-primary">{createdOrder?.orderNumber}</p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'hsl(0 0% 9%)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p className="text-[10px] font-black uppercase text-foreground/30 mb-1">Full Order Total</p>
                  <p className="font-black text-sm">{formatPrice(snapTotal)}</p>
                </div>
              </div>

              {/* ADVANCE AMOUNT — BIG HERO */}
              <div className="rounded-2xl p-5 text-center" style={{ background: theme.light, border: `2px solid ${theme.border}` }}>
                <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: theme.primary }}>
                  Send This Amount (15% Advance)
                </p>
                <p className="text-6xl font-black font-display" style={{ color: theme.primary }}>
                  {formatPrice(snapAdvance)}
                </p>
                <div className="mt-3 pt-3 border-t" style={{ borderColor: `${theme.border}` }}>
                  <p className="text-xs font-semibold text-foreground/50">
                    Remaining <strong className="text-foreground text-sm">{formatPrice(snapRemaining)}</strong> paid on delivery
                  </p>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-3">
                <p className="text-xs font-black uppercase tracking-widest text-foreground/30">How to Pay</p>
                {[
                  `Open your ${theme.name} app`,
                  `Go to "Send Money"`,
                  `Enter number: ${PAYMENT_NUMBER_LOCAL}`,
                  `Send exactly ${formatPrice(snapAdvance)}`,
                  'Enter your sending number last 4 digits below',
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5"
                      style={{ background: theme.light, color: theme.primary, border: `1px solid ${theme.border}` }}>
                      {i + 1}
                    </div>
                    <span className="text-sm text-foreground/65 leading-relaxed">{s}</span>
                  </div>
                ))}
              </div>

              {/* SEND MONEY TO — local number, easy to copy & dial */}
              <div className="rounded-2xl p-4" style={{ background: 'hsl(0 0% 9%)', border: `1px solid ${theme.border}` }}>
                <p className="text-xs font-black uppercase tracking-widest text-foreground/30 mb-3">Send Money To</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-foreground/30 mb-1">{theme.name} Personal Number</p>
                    {/* Local format — directly dialable & pasteable in bKash/Nagad/Upay */}
                    <p className="text-3xl font-black tracking-widest font-mono" style={{ color: theme.primary }}>
                      {PAYMENT_NUMBER_LOCAL}
                    </p>
                    <p className="text-[10px] text-foreground/25 mt-1">Tap COPY then paste directly in {theme.name} app</p>
                  </div>
                  <button
                    onClick={copyNumber}
                    className="flex flex-col items-center gap-1 w-14 h-14 rounded-xl justify-center transition-all duration-300 shrink-0"
                    style={{
                      background: copiedNumber ? 'rgba(74,222,128,0.15)' : theme.light,
                      border: copiedNumber ? '1px solid rgba(74,222,128,0.3)' : `1px solid ${theme.border}`,
                      color: copiedNumber ? '#4ade80' : theme.primary,
                    }}
                  >
                    {copiedNumber ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    <span className="text-[8px] font-black">{copiedNumber ? 'COPIED' : 'COPY'}</span>
                  </button>
                </div>
                {copiedNumber && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-green-400 font-bold mt-2 flex items-center gap-1.5"
                  >
                    <Check className="w-3 h-3" /> {PAYMENT_NUMBER_LOCAL} copied! Paste directly in {theme.name} app.
                  </motion.p>
                )}
              </div>

              {/* Last 4 digits input */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-foreground/40 mb-2">
                  Your Sending Number — Last 4 Digits *
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="e.g. 5678"
                  value={lastFour}
                  onChange={e => setLastFour(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className={inputClass}
                  style={{ ...inputStyle, letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.5rem', fontWeight: 900 }}
                />
                <p className="text-xs text-foreground/30 mt-1.5">
                  Enter the last 4 digits of the {theme.name} number you're sending FROM
                </p>
              </div>

              {/* Promo code */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-foreground/40 mb-2 flex items-center gap-1.5">
                  <Tag className="w-3 h-3" /> Promo Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Enter promo code if you have one"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value.toUpperCase())}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              {/* Submit button */}
              <button
                onClick={handlePaymentSubmit}
                disabled={isSubmittingPayment || lastFour.length < 4}
                className="w-full py-4 rounded-xl font-black text-white text-base flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-40"
                style={{
                  background: lastFour.length >= 4 && !isSubmittingPayment ? theme.badge : 'rgba(255,255,255,0.07)',
                  boxShadow: lastFour.length >= 4 ? `0 8px 30px ${theme.light}` : 'none',
                }}
              >
                {isSubmittingPayment ? (
                  <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                ) : (
                  <>I've Sent the Payment <ArrowRight className="w-5 h-5" /></>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-foreground/25">
                <ShieldCheck className="w-3.5 h-3.5" />
                Your payment info is secure & encrypted
              </div>
            </div>
          </div>

          {/* WhatsApp / Call Support Card */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'hsl(0 0% 8%)', border: '1px solid rgba(37,211,102,0.25)' }}>
            <div className="p-4">
              <p className="text-xs font-black uppercase tracking-widest text-green-400 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Need Help? Contact Us
              </p>
              <p className="text-xs text-foreground/40 mb-4 leading-relaxed">
                Having trouble? Wrong amount? Contact us immediately — we're here for you.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER_INTL.replace('+', '')}?text=Hi! I need help with my ${theme.name} payment for order ${createdOrder?.orderNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm"
                  style={{ background: '#25D366', boxShadow: '0 4px 15px rgba(37,211,102,0.3)' }}
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
                <a
                  href={`tel:${WHATSAPP_NUMBER_INTL}`}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm"
                  style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.25)', color: '#4ade80' }}
                >
                  <Phone className="w-4 h-4" /> Call Us
                </a>
              </div>
              <p className="text-center text-xs text-foreground/30 mt-2">{WHATSAPP_NUMBER_LOCAL}</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ─── CHECKOUT FORM SCREEN ─── */
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-28 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex items-center gap-2 text-xs font-bold text-foreground/30 uppercase tracking-wider mb-10">
            <span>Cart</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary">Checkout</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form */}
            <div className="lg:col-span-7 space-y-6">
              <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Delivery Details */}
                <div className="p-7 rounded-3xl" style={{ background: 'hsl(0 0% 7%)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h2 className="text-xl font-black font-display flex items-center gap-3 mb-6">
                    <span className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(255,107,43,0.15)', color: 'hsl(var(--primary))' }}>
                      <MapPin className="w-4 h-4" />
                    </span>
                    Delivery Details
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-foreground/40 mb-2">Full Name *</label>
                      <input {...register("customerName")} className={inputClass} style={inputStyle} placeholder="Your full name" />
                      {errors.customerName && <p className="text-destructive text-xs mt-1.5">{errors.customerName.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-foreground/40 mb-2">Email *</label>
                      <input type="email" {...register("customerEmail")} className={inputClass} style={inputStyle} placeholder="you@example.com" />
                      {errors.customerEmail && <p className="text-destructive text-xs mt-1.5">{errors.customerEmail.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-foreground/40 mb-2">Phone *</label>
                      <input {...register("customerPhone")} className={inputClass} style={inputStyle} placeholder="01XXXXXXXXX" />
                      {errors.customerPhone && <p className="text-destructive text-xs mt-1.5">{errors.customerPhone.message}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-foreground/40 mb-2">Street Address *</label>
                      <textarea {...register("shippingAddress")} rows={3} className={`${inputClass} resize-none`} style={inputStyle} placeholder="House / Road / Area / Thana" />
                      {errors.shippingAddress && <p className="text-destructive text-xs mt-1.5">{errors.shippingAddress.message}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-foreground/40 mb-2">District *</label>
                      <select {...register("shippingDistrict")} className={inputClass} style={{ ...inputStyle, appearance: 'none' }}>
                        {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-foreground/40 mb-2">Order Notes (Optional)</label>
                      <input {...register("notes")} className={inputClass} style={inputStyle} placeholder="Any special instructions..." />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="p-7 rounded-3xl" style={{ background: 'hsl(0 0% 7%)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h2 className="text-xl font-black font-display flex items-center gap-3 mb-6">
                    <span className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(255,107,43,0.15)', color: 'hsl(var(--primary))' }}>
                      <CreditCard className="w-4 h-4" />
                    </span>
                    Payment Method
                  </h2>

                  {/* 15% Advance notice — always shown */}
                  <div className="mb-4 p-3 rounded-xl flex items-start gap-2.5"
                    style={{ background: 'rgba(255,107,43,0.06)', border: '1px solid rgba(255,107,43,0.2)' }}>
                    <AlertCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs text-foreground/55 leading-relaxed">
                      <strong className="text-primary">15% advance is required for all orders</strong> — this lets us confirm and dispatch your order. The remaining balance is collected on delivery.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {[
                      {
                        id: 'cod', name: 'Cash on Delivery', desc: 'Pay 15% advance via bKash/Nagad, rest on delivery',
                        icon: <Banknote className="w-5 h-5 text-green-400" />,
                        tag: '15% Advance', tagColor: 'rgba(255,107,43,0.12)', tagBorder: 'rgba(255,107,43,0.3)', tagText: 'hsl(var(--primary))'
                      },
                      {
                        id: 'bkash', name: 'bKash', desc: `15% advance via Send Money to ${PAYMENT_NUMBER_LOCAL}`,
                        icon: <span className="font-black text-pink-400 text-sm">bKash</span>,
                        tag: 'Popular', tagColor: 'rgba(226,19,110,0.12)', tagBorder: 'rgba(226,19,110,0.25)', tagText: '#e2136e'
                      },
                      {
                        id: 'nagad', name: 'Nagad', desc: `15% advance via Send Money to ${PAYMENT_NUMBER_LOCAL}`,
                        icon: <span className="font-black text-orange-400 text-sm">Nagad</span>,
                        tag: null
                      },
                      {
                        id: 'rocket', name: 'Rocket (DBBL)', desc: `15% advance via Send Money to ${PAYMENT_NUMBER_LOCAL}`,
                        icon: <span className="font-black text-purple-400 text-sm">Rocket</span>,
                        tag: null
                      },
                    ].map(method => (
                      <label
                        key={method.id}
                        className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200"
                        style={{
                          background: paymentMethod === method.id ? 'rgba(255,107,43,0.08)' : 'hsl(0 0% 9%)',
                          border: paymentMethod === method.id ? '1px solid rgba(255,107,43,0.35)' : '1px solid rgba(255,255,255,0.06)',
                          boxShadow: paymentMethod === method.id ? '0 4px 20px rgba(255,107,43,0.1)' : 'none',
                        }}
                      >
                        <input type="radio" name="payment" value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={() => setPaymentMethod(method.id as CreateOrderRequestPaymentMethod)}
                          className="hidden" />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${paymentMethod === method.id ? 'border-primary' : 'border-white/20'}`}>
                          {paymentMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: 'hsl(0 0% 12%)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          {method.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-sm">{method.name}</p>
                            {method.tag && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                                style={{ background: method.tagColor, border: `1px solid ${method.tagBorder}`, color: method.tagText }}>
                                {method.tag}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-foreground/40 truncate mt-0.5">{method.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* COD: pick advance method sub-panel */}
                  <AnimatePresence>
                    {paymentMethod === 'cod' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 overflow-hidden"
                      >
                        <div className="p-4 rounded-xl" style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.2)' }}>
                          <p className="text-xs font-bold text-green-400 mb-2 flex items-center gap-1.5">
                            <Smartphone className="w-3.5 h-3.5" /> Choose mobile banking for 15% advance:
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {(['bkash', 'nagad', 'rocket'] as MobileMethod[]).map(m => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => setCodAdvanceMethod(m)}
                                className="py-2.5 rounded-xl font-black text-xs transition-all"
                                style={{
                                  background: codAdvanceMethod === m ? gatewayTheme[m].light : 'rgba(255,255,255,0.04)',
                                  border: codAdvanceMethod === m ? `1px solid ${gatewayTheme[m].border}` : '1px solid rgba(255,255,255,0.08)',
                                  color: codAdvanceMethod === m ? gatewayTheme[m].primary : 'rgba(255,255,255,0.35)',
                                }}
                              >
                                {m === 'bkash' ? 'bKash' : m === 'nagad' ? 'Nagad' : 'Rocket'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Mobile payment advance breakdown */}
                  <AnimatePresence>
                    {isMobilePayment && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 overflow-hidden"
                      >
                        <div className="p-4 rounded-xl" style={{ background: 'rgba(255,107,43,0.06)', border: '1px solid rgba(255,107,43,0.2)' }}>
                          <div className="flex items-start gap-2">
                            <Smartphone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <div>
                              <p className="font-bold text-sm text-primary mb-1">15% Advance Required</p>
                              <p className="text-xs text-foreground/50 leading-relaxed">
                                You'll pay <strong className="text-white">{formatPrice(advanceAmount)}</strong> (15% of {formatPrice(total)}) now via Send Money.
                                The remaining <strong className="text-white">{formatPrice(total - advanceAmount)}</strong> is paid on delivery.
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </form>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-5">
              <div className="sticky top-28 rounded-3xl p-7" style={{ background: 'hsl(0 0% 7%)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <h3 className="text-lg font-black font-display mb-6">Order Summary</h3>

                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 mb-6 hide-scrollbar">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/5"
                        style={{ background: 'hsl(0 0% 10%)' }}>
                        {item.imageUrl && <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm leading-tight truncate">{item.name}</p>
                        <p className="text-xs text-foreground/35 mt-0.5">
                          Qty: {item.quantity}
                          {item.size ? ` · ${item.size}` : ''}
                          {item.color ? ` · ${item.color}` : ''}
                        </p>
                      </div>
                      <p className="font-bold text-sm text-primary shrink-0">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/5 pt-4 space-y-2.5 mb-6 text-sm">
                  <div className="flex justify-between text-foreground/50">
                    <span>Subtotal</span>
                    <span className="font-semibold text-foreground">{formatPrice(liveSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-foreground/50">
                    <span>Shipping</span>
                    <span className={shippingCost === 0 ? "font-bold text-green-400" : "font-semibold text-foreground"}>
                      {shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-white/5">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-black text-2xl text-primary">{formatPrice(total)}</span>
                  </div>

                  {/* Always show 15% advance breakdown */}
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between items-center p-3 rounded-xl"
                      style={{ background: 'rgba(255,107,43,0.08)', border: '1px solid rgba(255,107,43,0.2)' }}>
                      <span className="text-xs font-bold text-primary">
                        Pay Now (15% Advance
                        {paymentMethod === 'cod' ? ` via ${codAdvanceMethod === 'bkash' ? 'bKash' : codAdvanceMethod === 'nagad' ? 'Nagad' : 'Rocket'}` : ''})
                      </span>
                      <span className="font-black text-primary">{formatPrice(advanceAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl"
                      style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)' }}>
                      <span className="text-xs font-bold text-green-400">Remaining (Paid on Delivery)</span>
                      <span className="font-black text-green-400">{formatPrice(total - advanceAmount)}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isPending}
                  className="btn-glow w-full py-4 rounded-xl font-bold text-white text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:transform-none"
                  style={{ background: 'hsl(var(--primary))', boxShadow: '0 8px 30px rgba(255,107,43,0.35)' }}
                >
                  {isPending ? (
                    <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Placing Order...</>
                  ) : paymentMethod === 'cod' ? (
                    <>Proceed to Pay Advance <ArrowRight className="w-5 h-5" /></>
                  ) : (
                    <>Proceed to {paymentMethod === 'bkash' ? 'bKash' : paymentMethod === 'nagad' ? 'Nagad' : 'Rocket'} Payment <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-foreground/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary/50" />
                  Secure · All 64 Districts · Free Shipping ৳1500+
                </div>

                {/* Quick WhatsApp Help */}
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER_INTL.replace('+', '')}?text=Hi TryNex! I need help with my order.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl font-semibold text-xs transition-all"
                  style={{ background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.15)', color: '#4ade80' }}
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Any questions? WhatsApp us — {WHATSAPP_NUMBER_LOCAL}
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
