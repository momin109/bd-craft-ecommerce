import { Request, Response } from "express";

import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { httpStatus } from "../../constants/httpStatus.js";

import { UserService } from "./user.service.js";

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getMyProfile(req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile retrieved successfully",
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.updateMyProfile(req.user!.userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.changePassword(req.user!.userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password changed successfully",
    data: result,
  });
});

const getAllCustomersForAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const result = await UserService.getAllCustomersForAdmin(req.query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Customers retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);

const getCustomerDetailsForAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const result = await UserService.getCustomerDetailsForAdmin(
      req.params.customerId as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Customer details retrieved successfully",
      data: result,
    });
  },
);

const getCustomerOrdersForAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const result = await UserService.getCustomerOrdersForAdmin(
      req.params.customerId as string,
      req.query,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Customer orders retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);

const updateCustomerCodAccess = catchAsync(
  async (req: Request, res: Response) => {
    const result = await UserService.updateCustomerCodAccess(
      req.params.customerId as string,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Customer COD access updated successfully",
      data: result,
    });
  },
);

const updateCustomerStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.updateCustomerStatus(
    req.params.customerId as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Customer status updated successfully",
    data: result,
  });
});

const updateCustomerNote = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.updateCustomerNote(
    req.params.customerId as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Customer note updated successfully",
    data: result,
  });
});

const updateCustomerByAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const result = await UserService.updateCustomerByAdmin(
      req.params.customerId as string,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Customer updated successfully",
      data: result,
    });
  },
);

const softDeleteCustomer = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.softDeleteCustomer(
    req.params.customerId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Customer deleted successfully",
    data: result,
  });
});

export const UserController = {
  getMyProfile,
  updateMyProfile,
  changePassword,
  getAllCustomersForAdmin,
  getCustomerDetailsForAdmin,
  getCustomerOrdersForAdmin,
  updateCustomerCodAccess,
  updateCustomerStatus,
  updateCustomerNote,
  updateCustomerByAdmin,
  softDeleteCustomer,
};
