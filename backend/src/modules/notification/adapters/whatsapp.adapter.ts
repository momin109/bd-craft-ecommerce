import { env } from "../../../config/env.js";
import {
  TAdapterSendPayload,
  TAdapterSendResult,
} from "../notification.types.js";

const send = async (
  payload: TAdapterSendPayload,
): Promise<TAdapterSendResult> => {
  if (!env.notification.whatsappEnabled) {
    return {
      skipped: true,
      rawResponse: {
        reason: "WhatsApp notification disabled",
      },
    };
  }

  if (
    !env.notification.whatsapp.apiBaseUrl ||
    !env.notification.whatsapp.phoneNumberId ||
    !env.notification.whatsapp.accessToken
  ) {
    throw new Error("WhatsApp configuration is missing");
  }

  const response = await fetch(
    `${env.notification.whatsapp.apiBaseUrl}/${env.notification.whatsapp.phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.notification.whatsapp.accessToken}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: payload.recipient.replace("+", ""),
        type: "text",
        text: {
          preview_url: false,
          body: payload.message,
        },
      }),
    },
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error("WhatsApp message sending failed");
  }

  return {
    rawResponse: data,
  };
};

export const whatsappAdapter = {
  send,
};
