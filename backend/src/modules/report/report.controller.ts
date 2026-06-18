import { Request, Response } from "express";

import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { httpStatus } from "../../constants/httpStatus.js";

import { ReportService } from "./report.service.js";

const getDashboardSummary = catchAsync(async (_req: Request, res: Response) => {
  const result = await ReportService.getDashboardSummary();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dashboard summary retrieved successfully",
    data: result,
  });
});

const getSalesReport = catchAsync(async (req: Request, res: Response) => {
  const result = await ReportService.getSalesReport(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sales report retrieved successfully",
    data: result,
  });
});

const getProductWiseSalesReport = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ReportService.getProductWiseSalesReport(req.query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Product-wise sales report retrieved successfully",
      data: result,
    });
  },
);

const getCustomerWiseSalesReport = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ReportService.getCustomerWiseSalesReport(req.query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Customer-wise sales report retrieved successfully",
      data: result,
    });
  },
);

const getCourierWiseReport = catchAsync(async (req: Request, res: Response) => {
  const result = await ReportService.getCourierWiseReport(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Courier-wise report retrieved successfully",
    data: result,
  });
});

const getReturnReport = catchAsync(async (req: Request, res: Response) => {
  const result = await ReportService.getReturnReport(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Return report retrieved successfully",
    data: result,
  });
});

const getProfitReport = catchAsync(async (req: Request, res: Response) => {
  const result = await ReportService.getProfitReport(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profit report retrieved successfully",
    data: result,
  });
});

const exportReportToCsv = catchAsync(async (req: Request, res: Response) => {
  const type = req.params.type as
    | "sales"
    | "products"
    | "customers"
    | "couriers"
    | "profit";

  const csv = await ReportService.exportReportToCsv(type, req.query);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${type}-report.csv"`,
  );

  res.status(httpStatus.OK).send(csv);
});

export const ReportController = {
  getDashboardSummary,
  getSalesReport,
  getProductWiseSalesReport,
  getCustomerWiseSalesReport,
  getCourierWiseReport,
  getReturnReport,
  getProfitReport,
  exportReportToCsv,
};
