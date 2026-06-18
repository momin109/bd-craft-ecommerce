"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Package, Truck, CheckCircle2, MapPin, CreditCard, ChevronRight, Phone, Download } from "lucide-react";
import { formatPriceBDT } from "@/lib/utils";
import { cn } from "@/lib/utils";

const steps = [
  { label: "Order Placed", time: "June 12, 10:32 AM", done: true, icon: Package },
  { label: "Confirmed", time: "June 12, 11:05 AM", done: true, icon: CheckCircle2 },
  { label: "Processing", time: "June 12, 2:00 PM", done: true, icon: Package },
  { label: "Shipped", time: "June 13, 9:00 AM", done: false, icon: Truck },
  { label: "Delivered", time: "Expected June 15", done: false, icon: CheckCircle2 },
];

export default function OrderDetailPage() {
  const { id } = useParams();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
        <Link href="/account" className="hover:text-brand-600">Account</Link>
        <ChevronRight size={12} />
        <Link href="/account" className="hover:text-brand-600">Orders</Link>
        <ChevronRight size={12} />
        <span className="text-gray-700">#{id}</span>
      </nav>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Order #{id}</h1>
          <p className="text-gray-400 text-sm mt-1">Placed on June 12, 2024 • 3 items</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:border-brand-200 hover:text-brand-700 transition-colors">
          <Download size={14} /> Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 space-y-5">

          {/* Tracking */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Truck size={16} className="text-brand-600" /> Order Tracking
              </h3>
              <span className="text-xs text-gray-400 font-mono">STF-8829341</span>
            </div>

            <div className="relative">
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-100" />
              <div className="space-y-5">
                {steps.map((step, i) => {
                  const Icon = step.icon;
                  const isActive = i === steps.filter(s => s.done).length - 1 + (steps.some(s => !s.done) ? 1 : 0) - 1;
                  return (
                    <div key={step.label} className="flex items-start gap-4 relative">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10",
                        step.done ? "bg-brand-600" : isActive ? "bg-brand-100 border-2 border-brand-300" : "bg-gray-100"
                      )}>
                        <Icon size={14} className={step.done ? "text-white" : "text-gray-400"} />
                      </div>
                      <div className="pt-1">
                        <p className={cn("text-sm font-semibold", step.done ? "text-gray-800" : "text-gray-400")}>{step.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{step.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Order Items (3)</h3>
            <div className="space-y-4">
              {[
                { name: "Hand-Woven Muslin Saree", img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100", qty: 1, size: "Free Size", price: 4500 },
                { name: "Nakshi Kantha Kurti", img: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=100", qty: 1, size: "M", price: 1850 },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 pb-3 border-b border-gray-50 last:border-none last:pb-0">
                  <div className="relative w-14 h-18 rounded-xl overflow-hidden bg-brand-50 shrink-0" style={{ height: "72px" }}>
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Size: {item.size} · Qty: {item.qty}</p>
                  </div>
                  <span className="text-sm font-bold text-brand-700">{formatPriceBDT(item.price)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Order Summary</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatPriceBDT(6350)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Delivery</span><span className="text-green-600">FREE</span></div>
              <div className="flex justify-between font-bold text-gray-900 pt-2.5 border-t border-gray-100">
                <span>Total</span><span className="text-brand-700">{formatPriceBDT(6350)}</span>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-1.5"><MapPin size={14} className="text-brand-600" /> Delivery Address</h3>
            <p className="text-sm text-gray-700 font-medium">Momin Al Hasan</p>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">House 12, Road 5, Banani, Dhaka 1213</p>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1"><Phone size={10} /> 01700000000</p>
          </div>

          {/* Payment */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-1.5"><CreditCard size={14} className="text-brand-600" /> Payment</h3>
            <div className="flex items-center gap-2">
              <span className="text-xl">🟣</span>
              <div>
                <p className="text-sm font-medium text-gray-700">bKash</p>
                <p className="text-xs text-green-600 font-medium">✓ Payment Confirmed</p>
              </div>
            </div>
          </div>

          <button className="w-full py-3 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors">
            Cancel Order
          </button>
        </div>
      </div>
    </div>
  );
}
