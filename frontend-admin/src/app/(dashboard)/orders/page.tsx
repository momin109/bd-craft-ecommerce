"use client";
import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useAdminOrders } from "@/hooks/queries/useOrders";
import { getOrderId, OrderStatus } from "@/types/api/order";
import { formatBDT, formatDate } from "@/lib/utils";
import { LoadingTable } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import StatusBadge from "@/components/ui/StatusBadge";

const STATUS_FILTERS: { label: string; value?: OrderStatus }[] = [
  { label: "All" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Returned", value: "RETURNED" },
  { label: "Cancelled", value: "CANCELLED" },
];

function normalizeOrders(raw: any): any[] {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.items)) return raw.items;
  return [];
}

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(undefined);
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, refetch } = useAdminOrders({ status: statusFilter, search: search || undefined });
  const orders = normalizeOrders(data);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by mobile, order #..."
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-full border whitespace-nowrap transition-colors ${
              statusFilter === f.value ? "bg-brand-700 text-white border-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden overflow-x-auto">
        {isLoading && <LoadingTable rows={6} cols={6} />}
        {isError && <div className="p-6"><ErrorState message="Couldn't load orders." onRetry={() => refetch()} /></div>}
        {!isLoading && !isError && orders.length === 0 && (
          <div className="p-10"><EmptyState title="No orders found" description="Try a different filter or search term." /></div>
        )}
        {!isLoading && !isError && orders.length > 0 && (
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Order #</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Payment</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const id = getOrderId(order);
                return (
                  <tr key={id} className="border-b border-gray-50 hover:bg-gray-25 cursor-pointer">
                    <td className="px-5 py-3">
                      <Link href={`/orders/${id}`} className="font-medium text-brand-700 hover:underline">#{order.orderNumber}</Link>
                    </td>
                    <td className="px-5 py-3 text-gray-700">
                      <p>{order.shippingAddress?.fullName}</p>
                      <p className="text-xs text-gray-400">{order.shippingAddress?.mobile}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{formatDate(order.createdAt)}</td>
                    <td className="px-5 py-3 font-medium text-gray-800">{formatBDT(order.totalPayable)}</td>
                    <td className="px-5 py-3"><StatusBadge status={order.paymentStatus} /></td>
                    <td className="px-5 py-3"><StatusBadge status={order.orderStatus} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
