"use client";
import { TrendingUp, ShoppingBag, Clock, CheckCircle2, RotateCcw, DollarSign } from "lucide-react";
import { useDashboardReport } from "@/hooks/queries/useReports";
import { formatBDT } from "@/lib/utils";
import { LoadingCards } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboardReport();

  if (isLoading) return <LoadingCards count={6} />;
  if (isError || !data) return <ErrorState message="Couldn't load dashboard data." onRetry={() => refetch()} />;

  const statCards = [
    { label: "Today's Orders", value: data.todaySales.totalOrders, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Today's Sales", value: formatBDT(data.todaySales.totalSales), icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
    { label: "Today's Profit", value: formatBDT(data.todaySales.totalProfit), icon: TrendingUp, color: "text-brand-600", bg: "bg-brand-50" },
    { label: "Pending Orders", value: data.orderCounts.pendingOrders, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Delivered Orders", value: data.orderCounts.deliveredOrders, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    { label: "Returned Orders", value: data.orderCounts.returnedOrders, icon: RotateCcw, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Today stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.bg}`}>
              <s.icon size={16} className={s.color} />
            </div>
            <div className="text-xl font-bold text-gray-900 mb-0.5">{s.value}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Monthly summary */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <h3 className="font-semibold text-gray-800 mb-4">This Month</h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-2xl font-bold text-gray-900">{data.monthlySales.totalOrders}</p>
            <p className="text-xs text-gray-400 mt-1">Total Orders</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-700">{formatBDT(data.monthlySales.totalSales)}</p>
            <p className="text-xs text-gray-400 mt-1">Total Sales</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{formatBDT(data.monthlySales.totalProfit)}</p>
            <p className="text-xs text-gray-400 mt-1">Total Profit</p>
          </div>
        </div>
      </div>

      {/* Revenue graph */}
      {data.revenueGraph?.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.revenueGraph}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f0ee" />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <Tooltip />
              <Line type="monotone" dataKey="totalSales" stroke="#c8831e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top products & customers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Top Products</h3>
          {data.topProducts?.length ? (
            <div className="space-y-2">
              {data.topProducts.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-none">
                  <span className="text-sm text-gray-700">{p.productName ?? p.name}</span>
                  <span className="text-sm font-semibold text-brand-700">{formatBDT(p.totalSales ?? p.revenue ?? 0)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No data yet.</p>
          )}
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Top Customers</h3>
          {data.topCustomers?.length ? (
            <div className="space-y-2">
              {data.topCustomers.map((c: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-none">
                  <span className="text-sm text-gray-700">{c.name}</span>
                  <span className="text-sm font-semibold text-brand-700">{formatBDT(c.totalSpent ?? 0)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
