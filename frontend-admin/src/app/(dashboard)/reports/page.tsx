"use client";
import { useState } from "react";
import { Download } from "lucide-react";
import {
  useSalesReport, useProductReport, useCustomerReport, useCourierReport, useReturnReport, useProfitReport,
} from "@/hooks/queries/useReports";
import { reportsService } from "@/services";
import { formatBDT, formatDate, cn } from "@/lib/utils";
import { LoadingTable } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";

type Tab = "sales" | "products" | "customers" | "couriers" | "returns" | "profit";

const TABS: { id: Tab; label: string }[] = [
  { id: "sales", label: "Sales" },
  { id: "products", label: "Products" },
  { id: "customers", label: "Customers" },
  { id: "couriers", label: "Couriers" },
  { id: "returns", label: "Returns" },
  { id: "profit", label: "Profit" },
];

export default function ReportsPage() {
  const [tab, setTab] = useState<Tab>("sales");
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("day");

  const sales = useSalesReport({ groupBy });
  const products = useProductReport();
  const customers = useCustomerReport();
  const couriers = useCourierReport();
  const returns = useReturnReport();
  const profit = useProfitReport();

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn("px-3.5 py-1.5 text-xs font-medium rounded-full border whitespace-nowrap transition-colors",
                tab === t.id ? "bg-brand-700 text-white border-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300")}
            >
              {t.label}
            </button>
          ))}
        </div>
        {tab !== "returns" && tab !== "profit" && (
          <a
            href={reportsService.exportUrl(tab as any)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-brand-300 hover:text-brand-700 transition-colors"
          >
            <Download size={14} /> Export CSV
          </a>
        )}
      </div>

      {tab === "sales" && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-gray-100">
            <span className="text-xs text-gray-400">Group by:</span>
            {(["day", "week", "month"] as const).map((g) => (
              <button key={g} onClick={() => setGroupBy(g)} className={cn("px-2.5 py-1 text-xs font-medium rounded-lg border capitalize", groupBy === g ? "bg-brand-50 text-brand-700 border-brand-200" : "border-gray-200 text-gray-500")}>
                {g}
              </button>
            ))}
          </div>
          {sales.isLoading && <LoadingTable rows={6} cols={4} />}
          {sales.isError && <div className="p-6"><ErrorState message="Couldn't load sales report." onRetry={() => sales.refetch()} /></div>}
          {!sales.isLoading && !sales.isError && (!sales.data || sales.data.length === 0) && (
            <div className="p-10"><EmptyState title="No sales data" description="Sales will appear here once orders come in." /></div>
          )}
          {!sales.isLoading && !sales.isError && sales.data && sales.data.length > 0 && (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Period</th><th className="px-5 py-3 font-medium">Orders</th><th className="px-5 py-3 font-medium">Sales</th><th className="px-5 py-3 font-medium">Profit</th>
              </tr></thead>
              <tbody>
                {sales.data.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="px-5 py-3 text-gray-700">{row.period}</td>
                    <td className="px-5 py-3 text-gray-600">{row.totalOrders}</td>
                    <td className="px-5 py-3 font-medium text-gray-800">{formatBDT(row.totalSales)}</td>
                    <td className="px-5 py-3 text-green-600 font-medium">{formatBDT(row.totalProfit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "products" && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden overflow-x-auto">
          {products.isLoading && <LoadingTable rows={6} cols={6} />}
          {products.isError && <div className="p-6"><ErrorState message="Couldn't load product report." onRetry={() => products.refetch()} /></div>}
          {!products.isLoading && !products.isError && (!products.data || products.data.length === 0) && (
            <div className="p-10"><EmptyState title="No product sales data" /></div>
          )}
          {!products.isLoading && !products.isError && products.data && products.data.length > 0 && (
            <table className="w-full text-sm min-w-[700px]">
              <thead><tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Product</th><th className="px-5 py-3 font-medium">SKU</th><th className="px-5 py-3 font-medium">Sold</th><th className="px-5 py-3 font-medium">Sales</th><th className="px-5 py-3 font-medium">Profit</th>
              </tr></thead>
              <tbody>
                {products.data.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="px-5 py-3 text-gray-700">{row.productName}{row.size ? ` (${row.size}${row.color ? ", " + row.color : ""})` : ""}</td>
                    <td className="px-5 py-3 text-gray-400 font-mono text-xs">{row.sku}</td>
                    <td className="px-5 py-3 text-gray-600">{row.totalQuantitySold}</td>
                    <td className="px-5 py-3 font-medium text-gray-800">{formatBDT(row.totalSales)}</td>
                    <td className="px-5 py-3 text-green-600 font-medium">{formatBDT(row.profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "customers" && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden overflow-x-auto">
          {customers.isLoading && <LoadingTable rows={6} cols={6} />}
          {customers.isError && <div className="p-6"><ErrorState message="Couldn't load customer report." onRetry={() => customers.refetch()} /></div>}
          {!customers.isLoading && !customers.isError && (!customers.data || customers.data.length === 0) && (
            <div className="p-10"><EmptyState title="No customer data" /></div>
          )}
          {!customers.isLoading && !customers.isError && customers.data && customers.data.length > 0 && (
            <table className="w-full text-sm min-w-[760px]">
              <thead><tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Customer</th><th className="px-5 py-3 font-medium">Orders</th><th className="px-5 py-3 font-medium">Delivered</th><th className="px-5 py-3 font-medium">Returned</th><th className="px-5 py-3 font-medium">Spent</th><th className="px-5 py-3 font-medium">Success Rate</th>
              </tr></thead>
              <tbody>
                {customers.data.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="px-5 py-3"><p className="text-gray-700 font-medium">{row.name}</p><p className="text-xs text-gray-400">{row.mobile}</p></td>
                    <td className="px-5 py-3 text-gray-600">{row.totalOrders}</td>
                    <td className="px-5 py-3 text-gray-600">{row.deliveredOrders}</td>
                    <td className="px-5 py-3 text-gray-600">{row.returnedOrders}</td>
                    <td className="px-5 py-3 font-medium text-gray-800">{formatBDT(row.totalSpent)}</td>
                    <td className="px-5 py-3"><span className={row.successRate < 60 ? "text-red-600 font-medium" : "text-gray-700"}>{row.successRate}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "couriers" && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          {couriers.isLoading && <LoadingTable rows={4} cols={4} />}
          {couriers.isError && <div className="p-6"><ErrorState message="Couldn't load courier report." onRetry={() => couriers.refetch()} /></div>}
          {!couriers.isLoading && !couriers.isError && (!couriers.data || couriers.data.length === 0) && (
            <div className="p-10"><EmptyState title="No courier data" /></div>
          )}
          {!couriers.isLoading && !couriers.isError && couriers.data && couriers.data.length > 0 && (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Provider</th><th className="px-5 py-3 font-medium">Shipments</th><th className="px-5 py-3 font-medium">Delivered</th><th className="px-5 py-3 font-medium">Returned</th><th className="px-5 py-3 font-medium">Success Rate</th>
              </tr></thead>
              <tbody>
                {couriers.data.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-700">{row.provider}</td>
                    <td className="px-5 py-3 text-gray-600">{row.totalShipments}</td>
                    <td className="px-5 py-3 text-green-600">{row.delivered}</td>
                    <td className="px-5 py-3 text-orange-600">{row.returned}</td>
                    <td className="px-5 py-3 text-gray-700">{row.successRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "returns" && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          {returns.isLoading && <LoadingTable rows={4} cols={3} />}
          {returns.isError && <ErrorState message="Couldn't load return report." onRetry={() => returns.refetch()} />}
          {!returns.isLoading && !returns.isError && (!returns.data || returns.data.length === 0) && <EmptyState title="No returns recorded" />}
          {!returns.isLoading && !returns.isError && returns.data && returns.data.length > 0 && (
            <pre className="text-xs bg-gray-50 rounded-xl p-4 overflow-x-auto">{JSON.stringify(returns.data, null, 2)}</pre>
          )}
        </div>
      )}

      {tab === "profit" && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          {profit.isLoading && <LoadingTable rows={4} cols={2} />}
          {profit.isError && <ErrorState message="Couldn't load profit report." onRetry={() => profit.refetch()} />}
          {!profit.isLoading && !profit.isError && profit.data && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Orders", value: profit.data.totalOrders },
                { label: "Total Revenue", value: formatBDT(profit.data.totalRevenue) },
                { label: "Total Cost", value: formatBDT(profit.data.totalPurchaseCost) },
                { label: "Total Profit", value: formatBDT(profit.data.totalProfit) },
                { label: "Coupon Discount", value: formatBDT(profit.data.couponDiscount) },
                { label: "Offer Discount", value: formatBDT(profit.data.offerDiscount) },
                { label: "Shipping Charges", value: formatBDT(profit.data.shippingCharge) },
                { label: "Profit Margin", value: `${profit.data.profitMargin}%` },
              ].map((s) => (
                <div key={s.label} className="bg-gray-50 rounded-xl p-4">
                  <p className="text-lg font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
