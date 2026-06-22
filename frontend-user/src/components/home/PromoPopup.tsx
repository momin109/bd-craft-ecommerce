"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

const POPUP_KEY = "shopora_promo_seen";

const PROMO = {
  image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&q=85",
  title: "Eid Special Sale",
  subtitle: "Up to 30% off on selected items",
  badge: "Limited Time",
  cta: "Shop Now",
  href: "/category/women",
};

export default function PromoPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show once per browser session
    const seen = sessionStorage.getItem(POPUP_KEY);
    if (!seen) {
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const close = () => {
    sessionStorage.setItem(POPUP_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm"
        onClick={close}
        style={{ animation: "fadeIn 0.3s ease" }}
      />

      {/* Popup */}
      <div
        className="fixed z-[100] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-sm rounded-2xl overflow-hidden shadow-2xl bg-white"
        style={{ animation: "popupIn 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        {/* Close button */}
        <button
          onClick={close}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition-all"
          aria-label="Close"
        >
          <X size={15} className="text-gray-700" />
        </button>

        {/* Image */}
        <div className="relative w-full" style={{ aspectRatio: "4/3" }}>
          <Image
            src={PROMO.image}
            alt={PROMO.title}
            fill
            sizes="380px"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Badge */}
          <span className="absolute top-4 left-4 px-3 py-1 bg-brand-600 text-white text-[10px] font-bold tracking-widest uppercase rounded-full">
            {PROMO.badge}
          </span>
        </div>

        {/* Content */}
        <div className="px-6 py-5 text-center bg-white">
          <h3 className="font-serif text-xl font-bold text-brand-900 mb-1">
            {PROMO.title}
          </h3>
          <p className="text-sm text-gray-500 mb-5">{PROMO.subtitle}</p>
          <Link
            href={PROMO.href}
            onClick={close}
            className="block w-full py-3 bg-brand-700 hover:bg-brand-800 text-white font-semibold text-sm tracking-widest uppercase rounded-xl transition-colors"
          >
            {PROMO.cta}
          </Link>
          <button
            onClick={close}
            className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2"
          >
            No thanks
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes popupIn {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.92); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  );
}
