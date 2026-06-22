export interface DashboardSalesSummary {
  totalOrders: number;
  totalSales: number;
  totalProfit: number;
}

export interface DashboardOrderCounts {
  pendingOrders: number;
  deliveredOrders: number;
  returnedOrders: number;
}

export interface DashboardReport {
  todaySales: DashboardSalesSummary;
  monthlySales: DashboardSalesSummary;
  orderCounts: DashboardOrderCounts;
  topProducts: any[];
  topCustomers: any[];
  revenueGraph: any[];
}

export type ReportGroupBy = "day" | "week" | "month";

export interface SalesReportQuery {
  fromDate?: string;
  toDate?: string;
  groupBy?: ReportGroupBy;
}

export interface SalesReportRow {
  period: string;
  totalOrders: number;
  totalSales: number;
  totalProfit: number;
}

export interface ProductReportRow {
  productName: string;
  sku: string;
  size?: string;
  color?: string;
  totalQuantitySold: number;
  totalSales: number;
  purchaseCost: number;
  profit: number;
}

export interface CustomerReportRow {
  name: string;
  mobile: string;
  email?: string;
  totalOrders: number;
  deliveredOrders: number;
  returnedOrders: number;
  totalSpent: number;
  codAllowed: boolean;
  successRate: number;
}

export interface CourierReportRow {
  provider: string;
  totalShipments: number;
  delivered: number;
  returned: number;
  successRate: number;
}

export interface ProfitReport {
  totalOrders: number;
  subtotal: number;
  shippingCharge: number;
  totalDiscount: number;
  couponDiscount: number;
  offerDiscount: number;
  totalRevenue: number;
  totalPurchaseCost: number;
  totalProfit: number;
  profitMargin: number;
}
