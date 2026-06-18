import { Types } from "mongoose";

import { AppError } from "../../errors/AppError.js";
import { httpStatus } from "../../constants/httpStatus.js";

import { Cart } from "../cart/cart.model.js";

import {
  IAppliedOffer,
  IOfferCampaign,
  TOfferType,
} from "./offer.interface.js";

import { OfferCampaign, OfferRedemption } from "./offer.model.js";

type TOfferCartItem = {
  product: Types.ObjectId;
  variantId: Types.ObjectId;
  quantity: number;
  unitPrice: number;
  itemTotal: number;
};

type TCalculateOfferPayload = {
  userId: string;
  subtotal: number;
  items: TOfferCartItem[];
};

const normalizeOfferCode = (code: string) => {
  return code.trim().toUpperCase();
};

const getActiveOfferFilter = () => {
  const now = new Date();

  return {
    status: "ACTIVE",
    startDate: {
      $lte: now,
    },
    endDate: {
      $gte: now,
    },
    $or: [
      {
        usageLimit: {
          $exists: false,
        },
      },
      {
        $expr: {
          $lt: ["$usedCount", "$usageLimit"],
        },
      },
    ],
  };
};

const getActiveCampaigns = async (type?: TOfferType) => {
  const filter: Record<string, unknown> = getActiveOfferFilter();

  if (type) {
    filter.type = type;
  }

  const campaigns = await OfferCampaign.find(filter).sort({
    priority: -1,
    createdAt: -1,
  });

  return campaigns;
};

const getItemKey = (product: unknown, variantId?: unknown) => {
  return `${String(product)}:${String(variantId || "")}`;
};

const calculateFlashSaleOffers = async (
  campaigns: IOfferCampaign[],
  items: TOfferCartItem[],
) => {
  const appliedOffers: IAppliedOffer[] = [];
  const flashDiscountedKeys = new Set<string>();

  for (const item of items) {
    let bestOffer: {
      campaign: IOfferCampaign;
      flashItem: any;
      eligibleQuantity: number;
      discountAmount: number;
      offerUnitPrice: number;
    } | null = null;

    for (const campaign of campaigns) {
      for (const flashItem of campaign.flashSaleItems) {
        const productMatched =
          String(flashItem.product) === String(item.product);

        const variantMatched =
          !flashItem.variantId ||
          String(flashItem.variantId) === String(item.variantId);

        if (!productMatched || !variantMatched) {
          continue;
        }

        if (flashItem.flashPrice >= item.unitPrice) {
          continue;
        }

        let eligibleQuantity = item.quantity;

        if (flashItem.stockLimit) {
          const remaining = flashItem.stockLimit - flashItem.soldCount;

          if (remaining <= 0) {
            continue;
          }

          eligibleQuantity = Math.min(item.quantity, remaining);
        }

        const discountAmount =
          (item.unitPrice - flashItem.flashPrice) * eligibleQuantity;

        if (!bestOffer || discountAmount > bestOffer.discountAmount) {
          bestOffer = {
            campaign,
            flashItem,
            eligibleQuantity,
            discountAmount,
            offerUnitPrice: flashItem.flashPrice,
          };
        }
      }
    }

    if (bestOffer) {
      appliedOffers.push({
        offer: bestOffer.campaign._id,
        code: bestOffer.campaign.code,
        title: bestOffer.campaign.title,
        type: "FLASH_SALE",
        discountAmount: bestOffer.discountAmount,
        items: [
          {
            product: item.product,
            variantId: item.variantId,
            quantity: bestOffer.eligibleQuantity,
            regularUnitPrice: item.unitPrice,
            offerUnitPrice: bestOffer.offerUnitPrice,
            discountAmount: bestOffer.discountAmount,
          },
        ],
      });

      flashDiscountedKeys.add(getItemKey(item.product, item.variantId));
    }
  }

  return {
    appliedOffers,
    flashDiscountedKeys,
  };
};

const calculateBundleDiscountAmount = (
  campaign: IOfferCampaign,
  bundleSubtotal: number,
) => {
  if (!campaign.bundle) {
    return 0;
  }

  let discountAmount = 0;

  if (campaign.bundle.discountType === "PERCENTAGE") {
    discountAmount = Math.floor(
      (bundleSubtotal * campaign.bundle.discountValue) / 100,
    );

    if (campaign.bundle.maxDiscount) {
      discountAmount = Math.min(discountAmount, campaign.bundle.maxDiscount);
    }
  }

  if (campaign.bundle.discountType === "FIXED") {
    discountAmount = campaign.bundle.discountValue;
  }

  discountAmount = Math.min(discountAmount, bundleSubtotal);

  return discountAmount;
};

const calculateBundleOffers = async (
  campaigns: IOfferCampaign[],
  items: TOfferCartItem[],
  flashDiscountedKeys: Set<string>,
) => {
  const appliedOffers: IAppliedOffer[] = [];

  const itemMap = new Map<string, TOfferCartItem>();

  for (const item of items) {
    itemMap.set(getItemKey(item.product, item.variantId), item);
  }

  for (const campaign of campaigns) {
    if (!campaign.bundle || campaign.bundle.items.length === 0) {
      continue;
    }

    let canApply = true;
    let bundleCount = Infinity;
    let bundleSubtotal = 0;

    const appliedItems = [];

    for (const requiredItem of campaign.bundle.items) {
      const exactKey = getItemKey(requiredItem.product, requiredItem.variantId);
      const productOnlyKey = getItemKey(requiredItem.product, "");

      const cartItem =
        itemMap.get(exactKey) ||
        Array.from(itemMap.values()).find((item) => {
          return (
            String(item.product) === String(requiredItem.product) &&
            !requiredItem.variantId
          );
        });

      if (!cartItem) {
        canApply = false;
        break;
      }

      const itemKey = getItemKey(cartItem.product, cartItem.variantId);

      if (
        flashDiscountedKeys.has(itemKey) ||
        flashDiscountedKeys.has(productOnlyKey)
      ) {
        canApply = false;
        break;
      }

      const possibleBundleCount = Math.floor(
        cartItem.quantity / requiredItem.quantity,
      );

      if (possibleBundleCount <= 0) {
        canApply = false;
        break;
      }

      bundleCount = Math.min(bundleCount, possibleBundleCount);

      appliedItems.push({
        cartItem,
        requiredQuantity: requiredItem.quantity,
      });
    }

    if (!canApply || bundleCount === Infinity || bundleCount <= 0) {
      continue;
    }

    const finalAppliedItems = appliedItems.map((item) => {
      const quantity = item.requiredQuantity * bundleCount;
      const itemSubtotal = item.cartItem.unitPrice * quantity;
      bundleSubtotal += itemSubtotal;

      return {
        product: item.cartItem.product,
        variantId: item.cartItem.variantId,
        quantity,
        regularUnitPrice: item.cartItem.unitPrice,
        discountAmount: 0,
      };
    });

    const discountAmount = calculateBundleDiscountAmount(
      campaign,
      bundleSubtotal,
    );

    if (discountAmount <= 0) {
      continue;
    }

    appliedOffers.push({
      offer: campaign._id,
      code: campaign.code,
      title: campaign.title,
      type: "BUNDLE",
      discountAmount,
      items: finalAppliedItems,
    });
  }

  return appliedOffers;
};

const calculateOfferDiscount = async (payload: TCalculateOfferPayload) => {
  if (!payload.items.length) {
    return {
      offerDiscount: 0,
      appliedOffers: [],
    };
  }

  const [flashCampaigns, bundleCampaigns] = await Promise.all([
    getActiveCampaigns("FLASH_SALE"),
    getActiveCampaigns("BUNDLE"),
  ]);

  const flashResult = await calculateFlashSaleOffers(
    flashCampaigns,
    payload.items,
  );

  const bundleOffers = await calculateBundleOffers(
    bundleCampaigns,
    payload.items,
    flashResult.flashDiscountedKeys,
  );

  const appliedOffers = [...flashResult.appliedOffers, ...bundleOffers];

  const offerDiscount = appliedOffers.reduce((sum, offer) => {
    return sum + offer.discountAmount;
  }, 0);

  return {
    offerDiscount,
    appliedOffers,
  };
};

const previewCartOffers = async (userId: string) => {
  const cart = await Cart.findOne({
    user: userId,
  });

  if (!cart || cart.items.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Cart is empty");
  }

  const result = await calculateOfferDiscount({
    userId,
    subtotal: cart.subtotal,
    items: cart.items.map((item) => ({
      product: item.product,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      itemTotal: item.itemTotal,
    })),
  });

  return {
    subtotal: cart.subtotal,
    offerDiscount: result.offerDiscount,
    totalAfterOffer: cart.subtotal - result.offerDiscount,
    appliedOffers: result.appliedOffers,
  };
};

const recordOfferUsage = async (payload: {
  customerId: string;
  orderId: string;
  appliedOffers: IAppliedOffer[];
}) => {
  if (!payload.appliedOffers.length) {
    return [];
  }

  const redemptions = [];

  for (const appliedOffer of payload.appliedOffers) {
    const redemption = await OfferRedemption.create({
      offer: appliedOffer.offer,
      code: appliedOffer.code,
      type: appliedOffer.type,
      customer: payload.customerId,
      order: payload.orderId,
      discountAmount: appliedOffer.discountAmount,
      items: appliedOffer.items,
      usedAt: new Date(),
    });

    await OfferCampaign.findByIdAndUpdate(appliedOffer.offer, {
      $inc: {
        usedCount: 1,
      },
    });

    if (appliedOffer.type === "FLASH_SALE") {
      const offer = await OfferCampaign.findById(appliedOffer.offer);

      if (offer) {
        for (const appliedItem of appliedOffer.items) {
          const flashItem = offer.flashSaleItems.find((item) => {
            const productMatched =
              String(item.product) === String(appliedItem.product);

            const variantMatched =
              !item.variantId ||
              String(item.variantId) === String(appliedItem.variantId);

            return productMatched && variantMatched;
          });

          if (flashItem) {
            flashItem.soldCount += appliedItem.quantity;
          }
        }

        await offer.save();
      }
    }

    redemptions.push(redemption);
  }

  return redemptions;
};

const releaseOfferUsageByOrder = async (orderId: string) => {
  const redemptions = await OfferRedemption.find({
    order: orderId,
    releasedAt: {
      $exists: false,
    },
  });

  for (const redemption of redemptions) {
    await OfferCampaign.findByIdAndUpdate(redemption.offer, {
      $inc: {
        usedCount: -1,
      },
    });

    if (redemption.type === "FLASH_SALE") {
      const offer = await OfferCampaign.findById(redemption.offer);

      if (offer) {
        for (const redeemedItem of redemption.items) {
          const flashItem = offer.flashSaleItems.find((item) => {
            const productMatched =
              String(item.product) === String(redeemedItem.product);

            const variantMatched =
              !item.variantId ||
              String(item.variantId) === String(redeemedItem.variantId);

            return productMatched && variantMatched;
          });

          if (flashItem) {
            flashItem.soldCount = Math.max(
              0,
              flashItem.soldCount - redeemedItem.quantity,
            );
          }
        }

        await offer.save();
      }
    }

    redemption.releasedAt = new Date();
    await redemption.save();
  }

  return redemptions;
};

const createOffer = async (
  adminId: string,
  payload: Partial<IOfferCampaign>,
) => {
  const code = normalizeOfferCode(String(payload.code));

  const existing = await OfferCampaign.findOne({
    code,
  });

  if (existing) {
    throw new AppError(httpStatus.CONFLICT, "Offer code already exists");
  }

  if (
    new Date(String(payload.endDate)) <= new Date(String(payload.startDate))
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "End date must be greater than start date",
    );
  }

  if (
    payload.type === "BUNDLE" &&
    payload.bundle?.discountType === "PERCENTAGE" &&
    Number(payload.bundle.discountValue) > 100
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Percentage discount cannot be more than 100",
    );
  }

  const offer = await OfferCampaign.create({
    ...payload,
    code,
    createdBy: adminId,
  });

  return offer;
};

const getAllOffers = async (query: {
  type?: TOfferType;
  status?: string;
  search?: string;
  page?: string;
  limit?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};

  if (query.type) {
    filter.type = query.type;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.search) {
    filter.$or = [
      {
        code: new RegExp(query.search, "i"),
      },
      {
        title: new RegExp(query.search, "i"),
      },
    ];
  }

  const [offers, total] = await Promise.all([
    OfferCampaign.find(filter)
      .populate("createdBy", "name mobile")
      .populate("flashSaleItems.product", "name slug images")
      .populate("bundle.items.product", "name slug images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    OfferCampaign.countDocuments(filter),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: offers,
  };
};

const getActivePublicOffers = async () => {
  const offers = await OfferCampaign.find(getActiveOfferFilter())
    .populate("flashSaleItems.product", "name slug images baseSellingPrice")
    .populate("bundle.items.product", "name slug images baseSellingPrice")
    .sort({
      priority: -1,
      createdAt: -1,
    });

  return offers;
};

const updateOffer = async (id: string, payload: Partial<IOfferCampaign>) => {
  const updateData = {
    ...payload,
  };

  delete updateData.code;
  delete updateData.type;
  delete updateData.usedCount;
  delete updateData.createdBy;

  const offer = await OfferCampaign.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!offer) {
    throw new AppError(httpStatus.NOT_FOUND, "Offer not found");
  }

  return offer;
};

const deleteOffer = async (id: string) => {
  const offer = await OfferCampaign.findByIdAndUpdate(
    id,
    {
      status: "INACTIVE",
    },
    {
      new: true,
    },
  );

  if (!offer) {
    throw new AppError(httpStatus.NOT_FOUND, "Offer not found");
  }

  return offer;
};

export const OfferService = {
  createOffer,
  getAllOffers,
  getActivePublicOffers,
  updateOffer,
  deleteOffer,
  previewCartOffers,
  calculateOfferDiscount,
  recordOfferUsage,
  releaseOfferUsageByOrder,
};
