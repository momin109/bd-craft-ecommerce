import { Request, Response } from "express";

import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { httpStatus } from "../../constants/httpStatus.js";

import { InvoiceService } from "./invoice.service.js";

const generateInvoiceForOrder = catchAsync(
  async (req: Request, res: Response) => {
    const result = await InvoiceService.generateInvoiceForOrder(
      req.params.orderId,
      {
        forceRegenerate: req.query.force === "true",
      },
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Invoice generated successfully",
      data: result,
    });
  },
);

const emailInvoiceToCustomer = catchAsync(
  async (req: Request, res: Response) => {
    const result = await InvoiceService.emailInvoiceToCustomer(
      req.params.orderId,
      {
        forceRegenerate: req.query.force === "true",
      },
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Invoice email processed successfully",
      data: result,
    });
  },
);

const getMyOrderInvoice = catchAsync(async (req: Request, res: Response) => {
  const result = await InvoiceService.getInvoiceByOrderForCustomer(
    req.user!.userId,
    req.params.orderId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Invoice retrieved successfully",
    data: result,
  });
});

const getAllInvoicesForAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const result = await InvoiceService.getAllInvoicesForAdmin(req.query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Invoices retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);

const downloadInvoice = catchAsync(async (req: Request, res: Response) => {
  const invoice = await InvoiceService.getInvoiceByNumber(
    req.params.invoiceNumber,
  );

  res.download(invoice.pdfPath, `${invoice.invoiceNumber}.pdf`);
});

export const InvoiceController = {
  generateInvoiceForOrder,
  emailInvoiceToCustomer,
  getMyOrderInvoice,
  getAllInvoicesForAdmin,
  downloadInvoice,
};
