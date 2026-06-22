"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, MapPin, CreditCard, Package, Truck, Loader2 } from "lucide-react";
import { useAdminOrder, useUpdateOrderStatus } from "@/hooks/queries/useOrders";
import { useCourierByOrder, useBookCourier, useSyncShipment } from "@/hooks/queries/useCourier";
import { OrderStatus } from "@/types/api/order";
import { formatBDT, formatDateTime } from "@/lib/utils";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import StatusBadge from "@/components/ui/StatusBadge";
import { getErrorMessage } from "@/lib/api/client";
import toast from "react-hot-toast";

const STATUS_FLOW: OrderStatus[] = ["PENDING", "APPROVED", "PROCESSING", "SHIPPED", "DELIVERED"];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError, refetch } = useAdminOrder(id);

  const updateStatusMutation = useUpdateOrderStatus();
  const { data: shipment } = useCourierByOrder(id);
  const bookCourierMutation = useBookCourier();
  const syncMutation = useSyncShipment();

  const [note, setNote] = useState("");
  const [courierProvider, setCourierProvider] = useState<"STEADFAST" | "PATHAO">("STEADFAST");

  if (isLoading) return <LoadingState label="Loading order..." />;
  if (isError) return <ErrorState message="Couldn't load this order." onRetry={() => refetch()} />;
  if (!order) {
    return <div className="p-10"><EmptyState title="Order not found" description="This order could not be located." /></div>;
  }

  const currentIdx = STATUS_FLOW.indexOf(order.orderStatus);
  const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;
  const isTerminal = order.orderStatus === "DELIVERED" || order.orderStatus === "RETURNED" || order.orderStatus === "CANCELLED";

  const advanceStatus = (status: OrderStatus) => {
    updateStatusMutation.mutate({ orderId: id, payload: { status, note: note || undefined } }, {
      onSuccess: () => { toast.success(`Order marked as ${status}`); setNote(""); refetch(); },
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  };

  const totalDiscount = (order.discount ?? 0) + (order.couponDiscount ?? 0) + (order.offerDiscount ?? 0);

  return (
    <div className="animate-fade-in max-w-5xl">
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
        <Link href="/orders" className="hover:text-brand-600">Orders</Link>
        <ChevronRight size={12} />
        <span className="text-gray-700">#{order.orderNumber}</span>
      </nav>

      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h2>
          <p className="text-sm text-gray-400 mt-1">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={order.orderStatus} />
          <StatusBadge status={order.paymentStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 space-y-5">
          {/* Status update */}
          {!isTerminal && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Package size={16} className="text-brand-600" /> Update Status</h3>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note for this status change"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 mb-3"
              />
              <div className="flex gap-2 flex-wrap">
                {nextStatus && (
                  <button
                    onClick={() => advanceStatus(nextStatus)}
                    disabled={updateStatusMutation.isPending}
                    className="px-4 py-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                  >
                    {updateStatusMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                    Mark as {nextStatus}
                  </button>
                )}
                <button
                  onClick={() => advanceStatus("RETURNED")}
                  disabled={updateStatusMutation.isPending}
                  className="px-4 py-2 border border-orange-200 text-orange-600 text-sm font-semibold rounded-lg hover:bg-orange-50 transition-colors"
                >
                  Mark as Returned
                </button>
                <button
                  onClick={() => advanceStatus("CANCELLED")}
                  disabled={updateStatusMutation.isPending}
                  className="px-4 py-2 border border-red-200 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors"
                >
                  Cancel Order
                </button>
              </div>
            </div>
          )}

          {/* Courier */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Truck size={16} className="text-brand-600" /> Courier</h3>
            {shipment ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Provider</span><span className="font-medium">{shipment.provider}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Tracking Code</span><span className="font-mono text-xs">{shipment.trackingCode ?? shipment.consignmentId ?? "—"}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Status</span><StatusBadge status={shipment.status} /></div>
                <button
                  onClick={() => {
                    const shipmentId = (shipment as any)._id ?? (shipment as any).id;
                    syncMutation.mutate(shipmentId, {
                      onSuccess: () => toast.success("Shipment status synced"),
                      onError: (err) => toast.error(getErrorMessage(err)),
                    });
                  }}
                  disabled={syncMutation.isPending}
                  className="mt-2 text-xs text-brand-600 hover:underline flex items-center gap-1"
                >
                  {syncMutation.isPending && <Loader2 size={12} className="animate-spin" />} Sync Status
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <select value={courierProvider} onChange={(e) => setCourierProvider(e.target.value as any)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                  <option value="STEADFAST">Steadfast</option>
                  <option value="PATHAO">Pathao</option>
                </select>
                <button
                  onClick={() => bookCourierMutation.mutate({ orderId: id, payload: { provider: courierProvider, itemWeight: 1, itemDescription: "Ecommerce parcel" } }, {
                    onSuccess: () => toast.success("Courier booked"),
                    onError: (err) => toast.error(getErrorMessage(err)),
                  })}
                  disabled={bookCourierMutation.isPending}
                  className="px-4 py-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  {bookCourierMutation.isPending && <Loader2 size={14} className="animate-spin" />} Book Courier
                </button>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Order Items ({order.items.length})</h3>
            <div className="space-y-3">
              {order.items.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-3 pb-3 border-b border-gray-50 last:border-none last:pb-0">
                  <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-brand-50 shrink-0">
                    {item.image && <Image src={item.image} alt={item.productName} fill sizes="48px" className="object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.productName}</p>
                    <p className="text-xs text-gray-400">{item.size ? `${item.size} · ` : ""}{item.color ? `${item.color} · ` : ""}Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-brand-700">{formatBDT(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatBDT(order.subtotal)}</span></div>
              {totalDiscount > 0 && <div className="flex justify-between text-green-600"><span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span><span>-{formatBDT(totalDiscount)}</span></div>}
              <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{formatBDT(order.shippingCharge)}</span></div>
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100"><span>Total</span><span className="text-brand-700">{formatBDT(order.totalPayable)}</span></div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-1.5"><MapPin size={14} className="text-brand-600" /> Delivery Address</h3>
            <p className="text-sm text-gray-700 font-medium">{order.shippingAddress.fullName}</p>
            <p className="text-xs text-gray-400 mt-1">{order.shippingAddress.mobile}</p>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">{order.shippingAddress.addressLine}, {order.shippingAddress.area}, {order.shippingAddress.city}, {order.shippingAddress.district}</p>
            {order.shippingAddress.note && <p className="text-xs text-amber-600 mt-2 bg-amber-50 px-2 py-1.5 rounded-lg">Note: {order.shippingAddress.note}</p>}
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-1.5"><CreditCard size={14} className="text-brand-600" /> Payment</h3>
            <p className="text-sm font-medium text-gray-700">{order.paymentMethod}</p>
            {order.customerNote && <p className="text-xs text-gray-400 mt-2">Customer note: {order.customerNote}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
