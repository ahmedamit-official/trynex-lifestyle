import { useState } from "react";
import { X, Tag, Truck, Zap } from "lucide-react";

const ANNOUNCEMENTS = [
  { icon: "🎉", text: "FREE SHIPPING on orders above ৳1,500 — All 64 Districts of Bangladesh!" },
  { icon: "⚡", text: "LIMITED TIME: Use code TRYNEX10 for 10% off your first order!" },
  { icon: "🚀", text: "48-Hour Express Production Available — Order Today, Get It Fast!" },
  { icon: "💳", text: "Pay easily with bKash, Nagad, Rocket or Cash on Delivery!" },
  { icon: "✨", text: "Custom Corporate Gifts — Bulk orders with special pricing!" },
  { icon: "🎁", text: "New Collection Dropped — Premium 320GSM Hoodies Now Available!" },
];

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const doubled = [...ANNOUNCEMENTS, ...ANNOUNCEMENTS];

  return (
    <div className="announcement-bar relative z-50">
      <div className="overflow-hidden">
        <div className="animate-ticker flex items-center">
          {doubled.map((item, i) => (
            <span key={i} className="flex items-center gap-2 whitespace-nowrap px-10 text-white/95">
              <span>{item.icon}</span>
              <span>{item.text}</span>
              <span className="mx-4 opacity-40">•</span>
            </span>
          ))}
        </div>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Close announcement"
      >
        <X className="w-3.5 h-3.5 text-white/80" />
      </button>
    </div>
  );
}
