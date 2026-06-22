"use client";
import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useAdminCustomers } from "@/hooks/queries/useAdminCustomers";
import { formatBDT } from "@/lib/utils";
import { LoadingTable } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import StatusBadge from "@/components/ui/StatusBadge";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [codFilter, setCodFilter] = useState<"all" | "true" | "false">("all");
  const { data: customers, isLoading, isError, refetch } = useAdminCustomers({
    search: search || undefined,
    codAllowed: codFilter === "all" ? undefined : codFilter === "true",
  });

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or mobile..."
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"
          />
        </div>
        <select value={codFilter} onChange={(e) => setCodFilter(e.target.value as any)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white">
          <option value="all">All COD Status</option>
          <option value="true">COD Allowed</option>
          <option value="false">COD Restricted</option>
        </select>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden overflow-x-auto">
        {isLoading && <LoadingTable rows={6} cols={6} />}
        {isError && <div className="p-6"><ErrorState message="Couldn't load customers." onRetry={() => refetch()} /></div>}
        {!isLoading && !isError && (!customers || customers.length === 0) && (
          <div className="p-10"><EmptyState title="No customers found" description="Try a different search or filter." /></div>
        )}
        {!isLoading && !isError && customers && customers.length > 0 && (
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Orders</th>
                <th className="px-5 py-3 font-medium">Success Rate</th>
                <th className="px-5 py-3 font-medium">COD</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => {
                const id = c._id ?? c.id ?? "";
                return (
                  <tr key={id} className="border-b border-gray-50 hover:bg-gray-25">
                    <td className="px-5 py-3">
                      <Link href={`/customers/${id}`} className="font-medium text-brand-700 hover:underline">{c.name}</Link>
                      <p className="text-xs text-gray-400">{c.mobile}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{c.totalOrders ?? 0} ({c.deliveredOrders ?? 0} delivered)</td>
                    <td className="px-5 py-3">
                      <span className={(c.successRate ?? 100) < 60 ? "text-red-600 font-medium" : "text-gray-700"}>{c.successRate ?? 100}%</span>
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={c.codAllowed ? "ACTIVE" : "BLOCKED"} /></td>
                    <td className="px-5 py-3"><StatusBadge status={c.status ?? "ACTIVE"} /></td>
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
