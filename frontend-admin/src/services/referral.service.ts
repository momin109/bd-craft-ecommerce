import { apiClient, unwrap } from "@/lib/api/client";

/* =========================
   TYPES
========================= */

export type ReferralStats = {
  totalReferred: number;
  totalRewarded: number;
  totalRewardAmount: number;
};

export type Referral = {
  id?: string;
  name?: string;
  mobile?: string;
  status?: string;
};

export type ReferralDashboard = {
  referralCode: string;
  referralStats: ReferralStats;
  referrals: Referral[];
};

export type ReferralAdminReportQuery = {
  status?: "PENDING" | "REWARDED" | "CANCELLED";
};

/* =========================
   SERVICE
========================= */

export const referralService = {
  // 👤 Customer referral dashboard
  getMyDashboard: async () => {
    const res = await apiClient.get("/referrals/my-dashboard");
    return unwrap<ReferralDashboard>(res);
  },

  // 🧑‍💼 Admin referral report
  getAdminReport: async (params: ReferralAdminReportQuery = {}) => {
    const res = await apiClient.get("/referrals/admin/report", {
      params,
    });

    return unwrap<ReferralDashboard[]>(res);
  },
};
