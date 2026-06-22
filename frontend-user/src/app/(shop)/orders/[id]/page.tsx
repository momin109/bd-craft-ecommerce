"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Package, Truck, CheckCircle2, MapPin, CreditCard, ChevronRight, Phone } from "lucide-react";
import { formatPriceBDT, cn } from "@/lib/utils";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useMyOrders } from "@/hooks/queries/useOrders";
import { getOrderId } from "@/types/api/order";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";

const STEP_ORDER = ["PENDING", "APPROVED", "PROCESSING", "SHIPPED", "DELIVERED"];
const STEP_LABELS: Record<string, string> = {
  PENDING: "Order Placed", APPROVED: "Approved", PROCESSING: "Processing", SHIPPED: "Shipped", DELIVERED: "Delivered",
};

function OrderDetailContent() {
  const { id } = useParams<{ id: string }>();
  const { data: orders, isLoading } = useMyOrders();
  const order = orders?.find((o) => getOrderId(o) === id || o.orderNumber === id);

  if (isLoading) return <LoadingState label="Loading order..." />;
  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20">
        <EmptyState title="Order not found" description="We couldn't find this order in your account." action={<Link href="/account" className="text-brand-600 hover:underline text-sm">Back to Orders</Link>} />
      </div>
    );
  }

  const currentStepIdx = STEP_ORDER.indexOf(order.orderStatus);
  const totalDiscount = order.discount + (order.couponDiscount ?? 0) + (order.offerDiscount ?? 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
        <Link href="/account" className="hover:text-brand-600">Account</Link>
        <ChevronRight size={12} />
        <Link href="/account" className="hover:text-brand-600">Orders</Link>
        <ChevronRight size={12} />
        <span className="text-gray-700">#{order.orderNumber}</span>
      </nav>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
          <p className="text-gray-400 text-sm mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 space-y-5">
          {order.orderStatus !== "RETURNED" && order.orderStatus !== "CANCELLED" && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Truck size={16} className="text-brand-600" /> Order Tracking</h3>
              </div>
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
                        <div className="pt-1">
                          <p className={cn("text-sm font-semibold", done ? "text-gray-800" : "text-gray-400")}>{STEP_LABELS[s]}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Order Items ({order.items.length})</h3>
            <div className="space-y-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 pb-3 border-b border-gray-50 last:border-none last:pb-0">
                  <div className="relative w-14 shrink-0 rounded-xl overflow-hidden bg-brand-50" style={{ height: "72px" }}>
                    {item.image && <Image src={item.image} alt={item.productName} fill sizes="56px" className="object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.productName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.size ? `Size: ${item.size} · ` : ""}{item.color ? `${item.color} · ` : ""}Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-bold text-brand-700">{formatPriceBDT(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Order Summary</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatPriceBDT(order.subtotal)}</span></div>
              {totalDiscount > 0 && <div className="flex justify-between text-green-600"><span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span><span>-{formatPriceBDT(totalDiscount)}</span></div>}
              <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{formatPriceBDT(order.shippingCharge)}</span></div>
              <div className="flex justify-between font-bold text-gray-900 pt-2.5 border-t border-gray-100"><span>Total</span><span className="text-brand-700">{formatPriceBDT(order.totalPayable)}</span></div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-1.5"><MapPin size={14} className="text-brand-600" /> Delivery Address</h3>
            <p className="text-sm text-gray-700 font-medium">{order.shippingAddress.fullName}</p>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">{order.shippingAddress.addressLine}, {order.shippingAddress.city}, {order.shippingAddress.district}</p>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1"><Phone size={10} /> {order.shippingAddress.mobile}</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-1.5"><CreditCard size={14} className="text-brand-600" /> Payment</h3>
            <p className="text-sm font-medium text-gray-700">{order.paymentMethod}</p>
            <p className={cn("text-xs font-medium mt-0.5", order.paymentStatus === "PAID" ? "text-green-600" : "text-amber-600")}>
              {order.paymentStatus === "PAID" ? "✓ Payment Confirmed" : order.paymentStatus}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return <ProtectedRoute><OrderDetailContent /></ProtectedRoute>;
}
