import { Request, Response } from "express";

import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { httpStatus } from "../../constants/httpStatus.js";

import { ReferralService } from "./referral.service.js";

const getMyReferralDashboard = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ReferralService.getMyReferralDashboard(
      req.user!.userId,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Referral dashboard retrieved successfully",
      data: result,
    });
  },
);

const getReferralReportForAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ReferralService.getReferralReportForAdmin(req.query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Referral report retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);

export const ReferralController = {
  getMyReferralDashboard,
  getReferralReportForAdmin,
};
