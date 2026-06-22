import { AuthUser } from "./auth";
import { ApiOrder } from "./order";

export type CustomerStatus = "ACTIVE" | "BLOCKED";

export interface AdminCustomerListItem extends AuthUser {
  totalOrders?: number;
  deliveredOrders?: number;
  returnedOrders?: number;
  successRate?: number;
  status?: CustomerStatus;
}

export interface AdminCustomerQuery {
  search?: string;
  codAllowed?: boolean;
  minSuccessRate?: number;
  maxSuccessRate?: number;
  status?: CustomerStatus;
  page?: number;
}

export interface AdminCustomerDetail {
  profile: AdminCustomerListItem;
  orderStats: {
    totalOrders: number;
    deliveredOrders: number;
    returnedOrders: number;
    successRate: number;
  };
  codAllowed: boolean;
  adminNote?: string;
  recentOrders: ApiOrder[];
  orderSummary?: Record<string, number>;
  topPurchasedProducts?: any[];
}

export interface SetCodPayload {
  codAllowed: boolean;
  adminNote?: string;
}

export interface SetCustomerStatusPayload {
  status: CustomerStatus;
  adminNote?: string;
}

export interface AddCustomerNotePayload {
  adminNote: string;
}
