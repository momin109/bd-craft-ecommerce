"use client";
import { useQuery } from "@tanstack/react-query";
import { reportsService } from "@/services";
import { queryKeys } from "@/lib/api/queryClient";
import { SalesReportQuery } from "@/types/api/reports";

export function useDashboardReport() {
  return useQuery({ queryKey: queryKeys.reports.dashboard, queryFn: () => reportsService.getDashboard() });
}

export function useSalesReport(params: SalesReportQuery = {}) {
  return useQuery({ queryKey: queryKeys.reports.sales(params), queryFn: () => reportsService.getSales(params) });
}

export function useProductReport() {
  return useQuery({ queryKey: queryKeys.reports.products, queryFn: () => reportsService.getProducts() });
}

export function useCustomerReport() {
  return useQuery({ queryKey: queryKeys.reports.customers, queryFn: () => reportsService.getCustomers() });
}

export function useCourierReport(provider?: string) {
  return useQuery({ queryKey: queryKeys.reports.couriers(provider), queryFn: () => reportsService.getCouriers(provider) });
}

export function useReturnReport() {
  return useQuery({ queryKey: queryKeys.reports.returns, queryFn: () => reportsService.getReturns() });
}

export function useProfitReport() {
  return useQuery({ queryKey: queryKeys.reports.profit, queryFn: () => reportsService.getProfit() });
}
