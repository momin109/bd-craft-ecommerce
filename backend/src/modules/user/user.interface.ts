export type TUserRole = "SUPER_ADMIN" | "ADMIN" | "CUSTOMER";

export type TUserStatus = "ACTIVE" | "BLOCKED" | "DELETED";

export interface IUserAddress {
  district?: string;
  city?: string;
  area?: string;
  addressLine?: string;
}

export interface IUser {
  name: string;
  mobile: string;
  email?: string;
  password: string;

  avatar?: string;

  role: TUserRole;
  status: TUserStatus;

  isMobileVerified: boolean;

  address?: IUserAddress;

  orderStats: {
    totalOrders: number;
    deliveredOrders: number;
    returnedOrders: number;
    cancelledOrders: number;
    successRate: number;
  };

  codAllowed: boolean;

  referralCode?: string;
  referredBy?: string;

  referralStats: {
    totalReferred: number;
    totalRewarded: number;
    totalRewardAmount: number;
  };

  adminNote?: string;

  comparePassword(candidatePassword: string): Promise<boolean>;
}
