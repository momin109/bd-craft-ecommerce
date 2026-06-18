import { env } from "../../../config/env.js";
import {
  TAdapterSendPayload,
  TAdapterSendResult,
} from "../notification.types.js";

const send = async (
  payload: TAdapterSendPayload,
): Promise<TAdapterSendResult> => {
  if (!env.notification.smsEnabled) {
    return {
      skipped: true,
      rawResponse: {
        reason: "SMS notification disabled",
      },
    };
  }

  if (!env.notification.sms.apiBaseUrl || !env.notification.sms.apiKey) {
    throw new Error("SMS configuration is missing");
  }

  const response = await fetch(`${env.notification.sms.apiBaseUrl}/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: env.notification.sms.apiKey,
      sender_id: env.notification.sms.senderId,
      to: payload.recipient,
      message: payload.message,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error("SMS sending failed");
  }

  return {
    rawResponse: data,
  };
};

export const smsAdapter = {
  send,
};
