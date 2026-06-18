export type TUserRole = "SUPER_ADMIN" | "ADMIN" | "CUSTOMER";

export type TUserStatus = "ACTIVE" | "BLOCKED" | "DELETED";

export interface IUser {
  name: string;
  mobile: string;
  email?: string;
  password: string;

  role: TUserRole;
  status: TUserStatus;

  isMobileVerified: boolean;

  orderStats: {
    totalOrders: number;
    deliveredOrders: number;
    returnedOrders: number;
    cancelledOrders: number;
    successRate: number;
  };

  codAllowed: boolean;

  comparePassword(candidatePassword: string): Promise<boolean>;
}
