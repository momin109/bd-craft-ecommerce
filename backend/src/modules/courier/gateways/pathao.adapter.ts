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
  const pathao = env.courier.pathao;

  if (
    !pathao.clientId ||
    !pathao.clientSecret ||
    !pathao.username ||
    !pathao.password ||
    !pathao.storeId
  ) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Pathao credentials are missing",
    );
  }
};

type TPathaoTokenResponse = {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
};

const getToken = async (): Promise<string> => {
  ensureCredentials();

  const response = await fetch(
    `${env.courier.pathao.baseUrl}/aladdin/api/v1/issue-token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: env.courier.pathao.clientId,
        client_secret: env.courier.pathao.clientSecret,
        username: env.courier.pathao.username,
        password: env.courier.pathao.password,
        grant_type: "password",
      }),
    },
  );

  const data = (await response.json()) as TPathaoTokenResponse;

  if (!response.ok || !data.access_token) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Pathao token generation failed",
    );
  }

  return data.access_token;
};

const createShipment = async (
  payload: TCourierCreatePayload,
): Promise<TCourierCreateResponse> => {
  const { order } = payload;

  const token = await getToken();

  const response = await fetch(
    `${env.courier.pathao.baseUrl}/aladdin/api/v1/orders`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        store_id: Number(env.courier.pathao.storeId),

        merchant_order_id: order.orderNumber,

        recipient_name: order.shippingAddress.fullName,
        recipient_phone: order.shippingAddress.mobile,
        recipient_address: order.shippingAddress.addressLine,

        recipient_city:
          order.shippingAddress.city || order.shippingAddress.district,
        recipient_zone: order.shippingAddress.area || "",
        recipient_area: order.shippingAddress.area || "",

        delivery_type: 48,
        item_type: 2,

        special_instruction:
          payload.specialInstruction || order.customerNote || "",

        item_quantity: order.items.reduce(
          (sum, item) => sum + item.quantity,
          0,
        ),

        item_weight: payload.itemWeight,
        amount_to_collect:
          order.paymentMethod === "COD" ? order.totalPayable : 0,

        item_description:
          payload.itemDescription ||
          order.items.map((item) => item.name).join(", "),
      }),
    },
  );

  const data = (await response.json()) as Record<string, any>;

  if (!response.ok || data.type === "error") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      data.message || "Pathao shipment creation failed",
    );
  }

  const consignment = data.data || data;

  const courierStatusText =
    consignment.order_status || consignment.status || "created";

  const consignmentId = String(
    consignment.consignment_id ||
      consignment.consignmentId ||
      consignment.id ||
      "",
  );

  return {
    consignmentId,
    trackingCode: consignmentId,
    trackingUrl: consignmentId
      ? `https://merchant.pathao.com/tracking?consignment_id=${consignmentId}`
      : undefined,
    deliveryStatus: normalizeCourierStatus(courierStatusText),
    courierStatusText: String(courierStatusText),
    charge: Number(consignment.delivery_fee || consignment.charge || 0),
    rawResponse: data,
  };
};

const getShipmentStatus = async (
  trackingCode: string,
): Promise<TCourierStatusResponse> => {
  const token = await getToken();

  const response = await fetch(
    `${env.courier.pathao.baseUrl}/aladdin/api/v1/orders/${trackingCode}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = (await response.json()) as Record<string, any>;

  const result = data.data || data;

  const statusText =
    result.order_status || result.status || result.delivery_status || "";

  return {
    deliveryStatus: normalizeCourierStatus(statusText),
    courierStatusText: String(statusText),
    rawResponse: data,
  };
};

export const pathaoAdapter = {
  createShipment,
  getShipmentStatus,
};
