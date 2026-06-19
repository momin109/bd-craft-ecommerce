import { Request } from "express";

import { env } from "../../config/env.js";
import { User } from "../user/user.model.js";
import { Order } from "../order/order.model.js";

import { FacebookCapiEventLog } from "./facebookCapi.model.js";
import { TMetaEventName } from "./facebookCapi.interface.js";
import {
  generateMetaEventId,
  getCookieValue,
  normalizePhoneForHash,
  sha256Hash,
} from "./facebookCapi.utils.js";

type TTrackMetaEventPayload = {
  eventName: TMetaEventName;
  eventId?: string;

  eventSourceUrl?: string;

  value?: number;
  currency?: "BDT";

  contentIds?: string[];
  contentType?: "product" | "product_group";
  contents?: {
    id: string;
    quantity: number;
    item_price?: number;
  }[];

  fbp?: string;
  fbc?: string;
};

const buildUserData = async (
  req: Request,
  userId?: string,
  payload?: {
    fbp?: string;
    fbc?: string;
  },
) => {
  const user = userId ? await User.findById(userId) : null;

  const cookieHeader = req.headers.cookie;

  const fbp = payload?.fbp || getCookieValue(cookieHeader, "_fbp");
  const fbc = payload?.fbc || getCookieValue(cookieHeader, "_fbc");

  const clientIpAddress =
    String(req.headers["x-forwarded-for"] || "")
      .split(",")[0]
      .trim() || req.ip;

  const clientUserAgent = req.headers["user-agent"];

  const userData: Record<string, unknown> = {
    client_ip_address: clientIpAddress,
    client_user_agent: clientUserAgent,
    fbp,
    fbc,
  };

  if (user) {
    userData.em = user.email ? [sha256Hash(user.email)] : undefined;
    userData.ph = user.mobile
      ? [sha256Hash(normalizePhoneForHash(user.mobile))]
      : undefined;
    userData.external_id = [sha256Hash(String(user._id))];
  }

  Object.keys(userData).forEach((key) => {
    if (!userData[key]) {
      delete userData[key];
    }
  });

  return userData;
};

const sendToMeta = async (payload: Record<string, unknown>) => {
  if (!env.meta.capiEnabled) {
    return {
      skipped: true,
      response: {
        reason: "Meta CAPI disabled",
      },
    };
  }

  if (!env.meta.pixelId || !env.meta.accessToken) {
    throw new Error("Meta Pixel ID or Access Token is missing");
  }

  const response = await fetch(
    `https://graph.facebook.com/${env.meta.apiVersion}/${env.meta.pixelId}/events?access_token=${env.meta.accessToken}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error?.message || "Meta CAPI event sending failed");
  }

  return {
    skipped: false,
    response: data,
  };
};

const trackEvent = async (
  req: Request,
  userId: string | undefined,
  payload: TTrackMetaEventPayload,
) => {
  const eventId =
    payload.eventId || generateMetaEventId(payload.eventName.toLowerCase());

  const userData = await buildUserData(req, userId, {
    fbp: payload.fbp,
    fbc: payload.fbc,
  });

  const eventPayload = {
    event_name: payload.eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    action_source: "website",
    event_source_url: payload.eventSourceUrl || req.headers.referer,
    user_data: userData,
    custom_data: {
      currency: payload.currency || "BDT",
      value: payload.value,
      content_ids: payload.contentIds || [],
      content_type: payload.contentType || "product",
      contents: payload.contents || [],
    },
  };

  const metaPayload: Record<string, unknown> = {
    data: [eventPayload],
  };

  if (env.meta.testEventCode) {
    metaPayload.test_event_code = env.meta.testEventCode;
  }

  let log = await FacebookCapiEventLog.findOne({
    eventName: payload.eventName,
    eventId,
  });

  if (log) {
    return log;
  }

  try {
    const metaResult = await sendToMeta(metaPayload);

    log = await FacebookCapiEventLog.create({
      eventName: payload.eventName,
      eventId,

      customer: userId,

      eventSourceUrl: String(eventPayload.event_source_url || ""),
      actionSource: "website",

      value: payload.value,
      currency: payload.currency || "BDT",

      contentIds: payload.contentIds || [],
      contentType: payload.contentType || "product",
      contents: payload.contents || [],

      status: metaResult.skipped ? "SKIPPED" : "SENT",
      requestPayload: metaPayload,
      responsePayload: metaResult.response,
      sentAt: metaResult.skipped ? undefined : new Date(),
    });

    return log;
  } catch (error: any) {
    log = await FacebookCapiEventLog.create({
      eventName: payload.eventName,
      eventId,

      customer: userId,

      eventSourceUrl: String(eventPayload.event_source_url || ""),
      actionSource: "website",

      value: payload.value,
      currency: payload.currency || "BDT",

      contentIds: payload.contentIds || [],
      contentType: payload.contentType || "product",
      contents: payload.contents || [],

      status: "FAILED",
      requestPayload: metaPayload,
      errorMessage: error.message || "Meta CAPI failed",
    });

    return log;
  }
};

const trackPurchaseFromOrder = async (
  req: Request,
  orderId: string,
  eventId?: string,
) => {
  const order = await Order.findById(orderId).populate(
    "customer",
    "name mobile email",
  );

  if (!order) {
    throw new Error("Order not found for Meta Purchase event");
  }

  const purchaseEventId = eventId || `purchase_${order.orderNumber}`;

  const existing = await FacebookCapiEventLog.findOne({
    eventName: "Purchase",
    eventId: purchaseEventId,
  });

  if (existing) {
    return existing;
  }

  const payload: TTrackMetaEventPayload = {
    eventName: "Purchase",
    eventId: purchaseEventId,
    value: order.totalPayable,
    currency: "BDT",
    contentIds: order.items.map((item) => item.sku),
    contentType: "product",
    contents: order.items.map((item) => ({
      id: item.sku,
      quantity: item.quantity,
      item_price: item.unitPrice,
    })),
  };

  const log = await trackEvent(req, String(order.customer), payload);

  log.order = order._id;
  await log.save();

  return log;
};

const getEventLogs = async (query: {
  eventName?: TMetaEventName;
  status?: string;
  page?: string;
  limit?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};

  if (query.eventName) {
    filter.eventName = query.eventName;
  }

  if (query.status) {
    filter.status = query.status;
  }

  const [logs, total] = await Promise.all([
    FacebookCapiEventLog.find(filter)
      .populate("customer", "name mobile email")
      .populate("order", "orderNumber totalPayable orderStatus paymentStatus")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),
    FacebookCapiEventLog.countDocuments(filter),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: logs,
  };
};

export const FacebookCapiService = {
  trackEvent,
  trackPurchaseFromOrder,
  getEventLogs,
};
