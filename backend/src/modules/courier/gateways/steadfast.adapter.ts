import { env } from "../../../config/env.js";
import { AppError } from "../../../errors/AppError.js";
import { httpStatus } from "../../../constants/httpStatus.js";
import {
  TCourierCreatePayload,
  TCourierCreateResponse,
  TCourierStatusResponse,
} from "../courier.types.js";
import { normalizeCourierStatus } from "../courier.utils.js";

const ensureCredentials = () => {
  if (!env.courier.steadfast.apiKey || !env.courier.steadfast.secretKey) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Steadfast credentials are missing",
    );
  }
};

const getHeaders = () => {
  ensureCredentials();

  return {
    "Content-Type": "application/json",
    "Api-Key": env.courier.steadfast.apiKey,
    "Secret-Key": env.courier.steadfast.secretKey,
  };
};

const createShipment = async (
  payload: TCourierCreatePayload,
): Promise<TCourierCreateResponse> => {
  const { order } = payload;

  const response = await fetch(
    `${env.courier.steadfast.baseUrl}/create_order`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        invoice: order.orderNumber,
        recipient_name: order.shippingAddress.fullName,
        recipient_phone: order.shippingAddress.mobile,
        recipient_address: order.shippingAddress.addressLine,
        cod_amount: order.paymentMethod === "COD" ? order.totalPayable : 0,
        note: payload.specialInstruction || order.customerNote || "",
        item_description:
          payload.itemDescription ||
          order.items.map((item) => item.name).join(", "),
        total_lot: order.items.reduce((sum, item) => sum + item.quantity, 0),
        delivery_type: 0,
      }),
    },
  );

  const data = (await response.json()) as Record<string, any>;

  if (!response.ok || data.status === 400 || data.status === "error") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      data.message || "Steadfast shipment creation failed",
    );
  }

  const consignment = data.consignment || data.data || data;

  const courierStatusText =
    consignment.status ||
    consignment.delivery_status ||
    data.message ||
    "created";

  return {
    consignmentId: String(
      consignment.consignment_id ||
        consignment.consignmentId ||
        consignment.id ||
        "",
    ),
    trackingCode: String(
      consignment.tracking_code ||
        consignment.trackingCode ||
        consignment.consignment_id ||
        "",
    ),
    trackingUrl: consignment.tracking_url
      ? String(consignment.tracking_url)
      : undefined,
    deliveryStatus: normalizeCourierStatus(courierStatusText),
    courierStatusText: String(courierStatusText),
    charge: Number(consignment.charge || consignment.delivery_charge || 0),
    rawResponse: data,
  };
};

const getShipmentStatus = async (
  trackingCode: string,
): Promise<TCourierStatusResponse> => {
  const response = await fetch(
    `${env.courier.steadfast.baseUrl}/status_by_trackingcode/${trackingCode}`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );

  const data = (await response.json()) as Record<string, any>;

  const statusText =
    data.delivery_status ||
    data.status ||
    data.current_status ||
    data.message ||
    "";

  return {
    deliveryStatus: normalizeCourierStatus(statusText),
    courierStatusText: String(statusText),
    rawResponse: data,
  };
};

export const steadfastAdapter = {
  createShipment,
  getShipmentStatus,
};
