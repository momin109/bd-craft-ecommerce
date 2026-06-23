import { Request, Response } from "express";

import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { httpStatus } from "../../constants/httpStatus.js";

import { OfferService } from "./offer.service.js";

const createOffer = catchAsync(async (req: Request, res: Response) => {
  const result = await OfferService.createOffer(req.user!.userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Offer created successfully",
    data: result,
  });
});

const getAllOffers = catchAsync(async (req: Request, res: Response) => {
  const result = await OfferService.getAllOffers(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Offers retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getActivePublicOffers = catchAsync(
  async (_req: Request, res: Response) => {
    const result = await OfferService.getActivePublicOffers();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Active offers retrieved successfully",
      data: result,
    });
  },
);

const updateOffer = catchAsync(async (req: Request, res: Response) => {
  const result = await OfferService.updateOffer(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Offer updated successfully",
    data: result,
  });
});

const deleteOffer = catchAsync(async (req: Request, res: Response) => {
  const result = await OfferService.deleteOffer(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Offer deleted successfully",
    data: result,
  });
});

const previewCartOffers = catchAsync(async (req: Request, res: Response) => {
  const result = await OfferService.previewCartOffers(req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart offers calculated successfully",
    data: result,
  });
});

export const OfferController = {
  createOffer,
  getAllOffers,
  getActivePublicOffers,
  updateOffer,
  deleteOffer,
  previewCartOffers,
};
