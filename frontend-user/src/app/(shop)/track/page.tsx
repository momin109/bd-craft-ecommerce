"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, Package, Truck, CheckCircle2, MapPin } from "lucide-react";
import { useTrackOrder } from "@/hooks/queries/useOrders";
import { formatPriceBDT, cn } from "@/lib/utils";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";

const STEP_ORDER = ["PENDING", "APPROVED", "PROCESSING", "SHIPPED", "DELIVERED"];
const STEP_LABELS: Record<string, string> = {
  PENDING: "Order Placed", APPROVED: "Approved", PROCESSING: "Processing", SHIPPED: "Shipped", DELIVERED: "Delivered",
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [mobile, setMobile] = useState("");
  const [searched, setSearched] = useState<{ orderNumber: string; mobile: string } | null>(null);

  const { data: order, isLoading, isError, refetch } = useTrackOrder(searched?.orderNumber ?? "", searched?.mobile ?? "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumber.trim() && mobile.trim()) setSearched({ orderNumber: orderNumber.trim(), mobile: mobile.trim() });
  };

  const currentStepIdx = order ? STEP_ORDER.indexOf(order.orderStatus) : -1;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <Package size={48} className="text-brand-300 mx-auto mb-4" />
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
        <p className="text-gray-400 text-sm">Enter your order number and mobile number to see its current status</p>
      </div>

      <form onSubmit={handleSearch} className="space-y-3 mb-10">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g. ORD-20260617-123456"
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-400 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <input
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="Mobile number used for the order"
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-400 text-sm"
          />
          <button type="submit" className="px-6 py-3 bg-brand-700 hover:bg-brand-800 text-white font-semibold rounded-xl text-sm transition-colors">
            Track
          </button>
        </div>
      </form>

      {isLoading && <LoadingState label="Looking up your order..." />}
      {isError && <ErrorState message="Order not found. Please check the order number and mobile number." onRetry={() => refetch()} />}

      {order && (
        <div className="space-y-5 animate-fade-in">
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-gray-800">Order #{order.orderNumber}</h3>
              <span className="text-sm font-bold text-brand-700">{formatPriceBDT(order.totalPayable)}</span>
            </div>
            <p className="text-xs text-gray-400">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>

          {order.orderStatus !== "RETURNED" && order.orderStatus !== "CANCELLED" && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2"><Truck size={16} className="text-brand-600" /> Tracking Status</h3>
              <div className="relative">
                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-100" />
                <div className="space-y-5">
                  {STEP_ORDER.map((s, i) => {
                    const done = i <= currentStepIdx;
                    return (
                      <div key={s} className="flex items-start gap-4 relative">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10", done ? "bg-brand-600" : "bg-gray-100")}>
                          {done ? <CheckCircle2 size={14} className="text-white" /> : <Package size={14} className="text-gray-400" />}
                        </div>
                        <p className={cn("text-sm font-semibold pt-1", done ? "text-gray-800" : "text-gray-400")}>{STEP_LABELS[s]}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-1.5"><MapPin size={14} className="text-brand-600" /> Delivery Address</h3>
            <p className="text-sm text-gray-700">{order.shippingAddress.city}, {order.shippingAddress.district}</p>
          </div>

          <p className="text-center text-xs text-gray-400">
            Need help? <Link href="/" className="text-brand-600 hover:underline">Contact support</Link>
          </p>
        </div>
      )}
    </div>
  );
}
