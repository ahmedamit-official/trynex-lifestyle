import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

const ANNOUNCEMENTS = [
  {
    icon: "🔥",
    text: "Only 12 hoodies left at this price — order now before they're gone!",
  },
  {
    icon: "⭐",
    text: "5,000+ happy customers across Bangladesh — join the TryNex family today.",
  },
  {
    icon: "🎁",
    text: "Free shipping on orders above ৳1,500 — delivered to your doorstep anywhere in BD.",
  },
  {
    icon: "⚡",
    text: "Your design, ready in 48 hours — the fastest custom apparel in Bangladesh.",
  },
  {
    icon: "💳",
    text: "Use code TRYNEX10 for 10% off your first order — bKash, Nagad & COD accepted.",
  },
  {
    icon: "🏆",
    text: "Premium 320GSM fabric. Print that never fades. Quality you can feel with every wear.",
  },
];

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHeight = () => {
      const h = visible && barRef.current ? barRef.current.offsetHeight : 0;
      document.documentElement.style.setProperty('--announcement-height', `${h}px`);
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [visible]);

  if (!visible) return null;

  const doubled = [...ANNOUNCEMENTS, ...ANNOUNCEMENTS];

  return (
    <div ref={barRef} className="announcement-bar fixed top-0 left-0 right-0 z-50">
      <div className="overflow-hidden">
        <div className="animate-ticker flex items-center">
          {doubled.map((item, i) => (
            <span key={i} className="flex items-center gap-2 whitespace-nowrap px-10 text-white/95 text-[13px] font-semibold">
              <span>{item.icon}</span>
              <span>{item.text}</span>
              <span className="mx-6 opacity-30">◆</span>
            </span>
          ))}
        </div>
      </div>
      <button
        onClick={() => {
          setVisible(false);
          document.documentElement.style.setProperty('--announcement-height', '0px');
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Close announcement"
      >
        <X className="w-3.5 h-3.5 text-white/80" />
      </button>
    </div>
  );
}
