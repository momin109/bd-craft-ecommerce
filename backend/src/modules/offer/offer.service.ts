import mongoose, { Types } from "mongoose";
import type { ClientSession, QueryFilter } from "mongoose";

import { AppError } from "../../errors/AppError.js";
import { httpStatus } from "../../constants/httpStatus.js";

import { Cart } from "../cart/cart.model.js";

import {
  IAppliedOffer,
  IOfferCampaign,
  TOfferStatus,
  TOfferType,
} from "./offer.interface.js";

import { OfferCampaign, OfferRedemption } from "./offer.model.js";

type TOfferCartItem = {
  product: Types.ObjectId;
  variantId?: Types.ObjectId;
  quantity: number;
  unitPrice: number;
  itemTotal: number;
};

type TCalculateOfferPayload = {
  userId: string;
  subtotal: number;
  items: TOfferCartItem[];
};

type TFlashSaleItemWithRules = IOfferCampaign["flashSaleItems"][number] & {
  regularPrice?: number;
  perUserLimit?: number;
  status?: "ACTIVE" | "INACTIVE";
};

const ACTIVE_CONFLICT_STATUSES: readonly TOfferStatus[] = [
  "ACTIVE",
  "SCHEDULED",
];

const OFFER_STATUSES: readonly TOfferStatus[] = [
  "DRAFT",
  "SCHEDULED",
  "ACTIVE",
  "PAUSED",
  "EXPIRED",
  "INACTIVE",
];

const isOfferStatus = (status: unknown): status is TOfferStatus => {
  return (
    typeof status === "string" &&
    OFFER_STATUSES.includes(status as TOfferStatus)
  );
};

const normalizeOfferCode = (code: string) => {
  return code.trim().toUpperCase();
};

const parseDateOrThrow = (value: unknown, fieldName: string) => {
  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    throw new AppError(httpStatus.BAD_REQUEST, `${fieldName} is invalid`);
  }

  return date;
};

const getItemKey = (product: unknown, variantId?: unknown) => {
  return `${String(product)}:${String(variantId || "")}`;
};

const isActiveConflictStatus = (status: unknown): status is TOfferStatus => {
  return (
    typeof status === "string" &&
    ACTIVE_CONFLICT_STATUSES.includes(status as TOfferStatus)
  );
};

const getActiveOfferFilter = (): QueryFilter<IOfferCampaign> => {
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
  const filter: QueryFilter<IOfferCampaign> = getActiveOfferFilter();

  if (type) {
    filter.type = type;
  }

  const campaigns = await OfferCampaign.find(filter).sort({
    priority: -1,
    createdAt: -1,
  });

  return campaigns;
};

const validateOfferDateRange = (startDate: Date, endDate: Date) => {
  if (endDate <= startDate) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "End date must be greater than start date",
    );
  }
};

const validateFlashSaleItemsBasicRules = (
  flashSaleItems: TFlashSaleItemWithRules[],
) => {
  if (!flashSaleItems.length) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Flash sale needs at least one product",
    );
  }

  const itemKeys = new Set<string>();

  for (const item of flashSaleItems) {
    if (!item.product) {
      throw new AppError(httpStatus.BAD_REQUEST, "Product is required");
    }

    if (Number(item.flashPrice) <= 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Flash price must be greater than 0",
      );
    }

    if (
      typeof item.regularPrice === "number" &&
      item.regularPrice > 0 &&
      item.flashPrice >= item.regularPrice
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Flash price must be lower than regular price",
      );
    }

    if (
      item.stockLimit &&
      item.perUserLimit &&
      item.perUserLimit > item.stockLimit
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Per user limit cannot be greater than stock limit",
      );
    }

    const key = getItemKey(item.product, item.variantId);

    if (itemKeys.has(key)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Duplicate product/variant found in flash sale items",
      );
    }

    itemKeys.add(key);
  }
};

const ensureNoOverlappingFlashSale = async (payload: {
  flashSaleItems: TFlashSaleItemWithRules[];
  startDate: Date;
  endDate: Date;
  excludeOfferId?: string;
}) => {
  for (const item of payload.flashSaleItems) {
    if (item.status === "INACTIVE") {
      continue;
    }

    const elemMatch: Record<string, unknown> = {
      product: item.product,
      status: {
        $ne: "INACTIVE",
      },
    };

    if (item.variantId) {
      elemMatch.$or = [
        {
          variantId: item.variantId,
        },
        {
          variantId: {
            $exists: false,
          },
        },
        {
          variantId: null,
        },
      ];
    }

    const filter: QueryFilter<IOfferCampaign> = {
      type: "FLASH_SALE",
      status: {
        $in: ACTIVE_CONFLICT_STATUSES,
      },
      startDate: {
        $lt: payload.endDate,
      },
      endDate: {
        $gt: payload.startDate,
      },
      flashSaleItems: {
        $elemMatch: elemMatch,
      },
    };

    if (payload.excludeOfferId) {
      filter._id = {
        $ne: new Types.ObjectId(payload.excludeOfferId),
      };
    }

    const existingOffer = await OfferCampaign.findOne(filter).select(
      "code title startDate endDate",
    );

    if (existingOffer) {
      throw new AppError(
        httpStatus.CONFLICT,
        `This product already exists in another active/scheduled flash sale: ${existingOffer.code}`,
      );
    }
  }
};

const getCustomerFlashItemUsedQty = async (payload: {
  customerId: string;
  offerId: Types.ObjectId;
  productId: Types.ObjectId;
  variantId?: Types.ObjectId;
  session?: ClientSession;
}) => {
  const itemMatch: Record<string, unknown> = {
    "items.product": payload.productId,
  };

  if (payload.variantId) {
    itemMatch["items.variantId"] = payload.variantId;
  }

  const aggregate = OfferRedemption.aggregate([
    {
      $match: {
        offer: payload.offerId,
        customer: new Types.ObjectId(payload.customerId),
        type: "FLASH_SALE",
        releasedAt: {
          $exists: false,
        },
      },
    },
    {
      $unwind: "$items",
    },
    {
      $match: itemMatch,
    },
    {
      $group: {
        _id: null,
        totalQty: {
          $sum: "$items.quantity",
        },
      },
    },
  ]);

  if (payload.session) {
    aggregate.session(payload.session);
  }

  const result = await aggregate;

  return result[0]?.totalQty || 0;
};

const calculateFlashSaleOffers = async (
  userId: string,
  campaigns: IOfferCampaign[],
  items: TOfferCartItem[],
) => {
  const appliedOffers: IAppliedOffer[] = [];
  const flashDiscountedKeys = new Set<string>();

  for (const item of items) {
    let bestOffer: {
      campaign: IOfferCampaign;
      flashItem: TFlashSaleItemWithRules;
      eligibleQuantity: number;
      discountAmount: number;
      offerUnitPrice: number;
    } | null = null;

    for (const campaign of campaigns) {
      for (const rawFlashItem of campaign.flashSaleItems) {
        const flashItem = rawFlashItem as TFlashSaleItemWithRules;

        if (flashItem.status === "INACTIVE") {
          continue;
        }

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

          eligibleQuantity = Math.min(eligibleQuantity, remaining);
        }

        if (flashItem.perUserLimit) {
          const alreadyUsedQty = await getCustomerFlashItemUsedQty({
            customerId: userId,
            offerId: campaign._id,
            productId: item.product,
            variantId: flashItem.variantId ? item.variantId : undefined,
          });

          const userRemainingQty = flashItem.perUserLimit - alreadyUsedQty;

          if (userRemainingQty <= 0) {
            continue;
          }

          eligibleQuantity = Math.min(eligibleQuantity, userRemainingQty);
        }

        const discountAmount =
          (item.unitPrice - flashItem.flashPrice) * eligibleQuantity;

        if (discountAmount <= 0) {
          continue;
        }

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

    const appliedItems: {
      cartItem: TOfferCartItem;
      requiredQuantity: number;
    }[] = [];

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
    payload.userId,
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
    totalAfterOffer: Math.max(0, cart.subtotal - result.offerDiscount),
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

  const session = await mongoose.startSession();

  try {
    const redemptions: unknown[] = [];

    await session.withTransaction(async () => {
      const now = new Date();

      for (const appliedOffer of payload.appliedOffers) {
        const offer = await OfferCampaign.findById(appliedOffer.offer).session(
          session,
        );

        if (!offer) {
          throw new AppError(httpStatus.NOT_FOUND, "Offer not found");
        }

        if (offer.status !== "ACTIVE") {
          throw new AppError(httpStatus.BAD_REQUEST, "Offer is not active");
        }

        if (offer.startDate > now || offer.endDate < now) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            "Offer is not valid at this time",
          );
        }

        if (offer.usageLimit && offer.usedCount >= offer.usageLimit) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            "Offer usage limit exceeded",
          );
        }

        if (appliedOffer.type === "FLASH_SALE") {
          for (const appliedItem of appliedOffer.items) {
            const flashItem = offer.flashSaleItems.find((rawItem) => {
              const item = rawItem as TFlashSaleItemWithRules;

              const productMatched =
                String(item.product) === String(appliedItem.product);

              const variantMatched =
                !item.variantId ||
                String(item.variantId) === String(appliedItem.variantId);

              return productMatched && variantMatched;
            }) as TFlashSaleItemWithRules | undefined;

            if (!flashItem) {
              throw new AppError(
                httpStatus.BAD_REQUEST,
                "Flash sale item not found",
              );
            }

            if (flashItem.status === "INACTIVE") {
              throw new AppError(
                httpStatus.BAD_REQUEST,
                "Flash sale item is inactive",
              );
            }

            if (flashItem.stockLimit) {
              const remaining = flashItem.stockLimit - flashItem.soldCount;

              if (remaining < appliedItem.quantity) {
                throw new AppError(
                  httpStatus.BAD_REQUEST,
                  "Flash sale stock is not available",
                );
              }
            }

            if (flashItem.perUserLimit) {
              const alreadyUsedQty = await getCustomerFlashItemUsedQty({
                customerId: payload.customerId,
                offerId: offer._id,
                productId: appliedItem.product,
                variantId: flashItem.variantId
                  ? appliedItem.variantId
                  : undefined,
                session,
              });

              if (
                alreadyUsedQty + appliedItem.quantity >
                flashItem.perUserLimit
              ) {
                throw new AppError(
                  httpStatus.BAD_REQUEST,
                  "Per user flash sale limit exceeded",
                );
              }
            }

            flashItem.soldCount += appliedItem.quantity;
          }
        }

        offer.usedCount += 1;

        await offer.save({
          session,
        });

        const createdRedemptions = await OfferRedemption.create(
          [
            {
              offer: appliedOffer.offer,
              code: appliedOffer.code,
              type: appliedOffer.type,
              customer: payload.customerId,
              order: payload.orderId,
              discountAmount: appliedOffer.discountAmount,
              items: appliedOffer.items,
              usedAt: new Date(),
            },
          ],
          {
            session,
          },
        );

        redemptions.push(createdRedemptions[0]);
      }
    });

    return redemptions;
  } finally {
    await session.endSession();
  }
};

const releaseOfferUsageByOrder = async (orderId: string) => {
  const session = await mongoose.startSession();

  try {
    const releasedRedemptions: unknown[] = [];

    await session.withTransaction(async () => {
      const redemptions = await OfferRedemption.find({
        order: orderId,
        releasedAt: {
          $exists: false,
        },
      }).session(session);

      for (const redemption of redemptions) {
        const offer = await OfferCampaign.findById(redemption.offer).session(
          session,
        );

        if (offer) {
          offer.usedCount = Math.max(0, offer.usedCount - 1);

          if (redemption.type === "FLASH_SALE") {
            for (const redeemedItem of redemption.items) {
              const flashItem = offer.flashSaleItems.find((rawItem) => {
                const item = rawItem as TFlashSaleItemWithRules;

                const productMatched =
                  String(item.product) === String(redeemedItem.product);

                const variantMatched =
                  !item.variantId ||
                  String(item.variantId) === String(redeemedItem.variantId);

                return productMatched && variantMatched;
              }) as TFlashSaleItemWithRules | undefined;

              if (flashItem) {
                flashItem.soldCount = Math.max(
                  0,
                  flashItem.soldCount - redeemedItem.quantity,
                );
              }
            }
          }

          await offer.save({
            session,
          });
        }

        redemption.releasedAt = new Date();

        await redemption.save({
          session,
        });

        releasedRedemptions.push(redemption);
      }
    });

    return releasedRedemptions;
  } finally {
    await session.endSession();
  }
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

  const startDate = parseDateOrThrow(payload.startDate, "Start date");
  const endDate = parseDateOrThrow(payload.endDate, "End date");

  validateOfferDateRange(startDate, endDate);

  if (payload.type === "FLASH_SALE") {
    const flashSaleItems = (payload.flashSaleItems ||
      []) as TFlashSaleItemWithRules[];

    validateFlashSaleItemsBasicRules(flashSaleItems);

    if (isActiveConflictStatus(payload.status || "DRAFT")) {
      await ensureNoOverlappingFlashSale({
        flashSaleItems,
        startDate,
        endDate,
      });
    }
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

  const createData: Record<string, unknown> = {
    ...payload,
    code,
    startDate,
    endDate,
    status: payload.status || "DRAFT",
    createdBy: adminId,
  };

  const offer = await OfferCampaign.create(createData);

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

  const filter: QueryFilter<IOfferCampaign> = {};

  if (query.type) {
    filter.type = query.type;
  }

  if (query.status) {
    if (!isOfferStatus(query.status)) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid offer status");
    }

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
      .populate("flashSaleItems.product", "name slug images baseSellingPrice")
      .populate("bundle.items.product", "name slug images baseSellingPrice")
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
  const existingOffer = await OfferCampaign.findById(id);

  if (!existingOffer) {
    throw new AppError(httpStatus.NOT_FOUND, "Offer not found");
  }

  const updateData: Record<string, unknown> = {
    ...payload,
  };

  delete updateData._id;
  delete updateData.code;
  delete updateData.type;
  delete updateData.usedCount;
  delete updateData.createdBy;
  delete updateData.createdAt;
  delete updateData.updatedAt;

  const startDate = payload.startDate
    ? parseDateOrThrow(payload.startDate, "Start date")
    : existingOffer.startDate;

  const endDate = payload.endDate
    ? parseDateOrThrow(payload.endDate, "End date")
    : existingOffer.endDate;

  validateOfferDateRange(startDate, endDate);

  updateData.startDate = startDate;
  updateData.endDate = endDate;

  const finalStatus = payload.status || existingOffer.status;

  if (existingOffer.type === "FLASH_SALE") {
    const finalFlashSaleItems = (payload.flashSaleItems ||
      existingOffer.flashSaleItems) as TFlashSaleItemWithRules[];

    validateFlashSaleItemsBasicRules(finalFlashSaleItems);

    if (isActiveConflictStatus(finalStatus)) {
      await ensureNoOverlappingFlashSale({
        flashSaleItems: finalFlashSaleItems,
        startDate,
        endDate,
        excludeOfferId: id,
      });
    }
  }

  if (
    existingOffer.type === "BUNDLE" &&
    payload.bundle?.discountType === "PERCENTAGE" &&
    Number(payload.bundle.discountValue) > 100
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Percentage discount cannot be more than 100",
    );
  }

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
