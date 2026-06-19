import nodemailer from "nodemailer";
import { env } from "../../../config/env.js";
import {
  TAdapterSendPayload,
  TAdapterSendResult,
} from "../notification.types.js";

const send = async (
  payload: TAdapterSendPayload,
): Promise<TAdapterSendResult> => {
  if (!env.notification.emailEnabled) {
    return {
      skipped: true,
      rawResponse: {
        reason: "Email notification disabled",
      },
    };
  }

  if (
    !env.notification.smtp.host ||
    !env.notification.smtp.user ||
    !env.notification.smtp.pass ||
    !env.notification.smtp.fromEmail
  ) {
    throw new Error("SMTP configuration is missing");
  }

  const transporter = nodemailer.createTransport({
    host: env.notification.smtp.host,
    port: env.notification.smtp.port,
    secure: env.notification.smtp.secure,
    auth: {
      user: env.notification.smtp.user,
      pass: env.notification.smtp.pass,
    },
  });

  const result = await transporter.sendMail({
    from: `"${env.notification.smtp.fromName}" <${env.notification.smtp.fromEmail}>`,
    to: payload.recipient,
    subject: payload.subject || "Notification",
    text: payload.message,
    html: payload.message.replace(/\n/g, "<br />"),
    attachments: payload.attachments || [],
  });

  return {
    rawResponse: result,
  };
};

export const emailAdapter = {
  send,
};

// import nodemailer from "nodemailer";
// import { env } from "../../../config/env.js";
// import {
//   TAdapterSendPayload,
//   TAdapterSendResult,
// } from "../notification.types.js";

// const send = async (
//   payload: TAdapterSendPayload,
// ): Promise<TAdapterSendResult> => {
//   if (!env.notification.emailEnabled) {
//     return {
//       skipped: true,
//       rawResponse: {
//         reason: "Email notification disabled",
//       },
//     };
//   }

//   if (
//     !env.notification.smtp.host ||
//     !env.notification.smtp.user ||
//     !env.notification.smtp.pass ||
//     !env.notification.smtp.fromEmail
//   ) {
//     throw new Error("SMTP configuration is missing");
//   }

//   const transporter = nodemailer.createTransport({
//     host: env.notification.smtp.host,
//     port: env.notification.smtp.port,
//     secure: env.notification.smtp.secure,
//     auth: {
//       user: env.notification.smtp.user,
//       pass: env.notification.smtp.pass,
//     },
//   });

//   const result = await transporter.sendMail({
//     from: `"${env.notification.smtp.fromName}" <${env.notification.smtp.fromEmail}>`,
//     to: payload.recipient,
//     subject: payload.subject || "Notification",
//     text: payload.message,
//     html: payload.message.replace(/\n/g, "<br />"),
//   });

//   return {
//     rawResponse: result,
//   };
// };

// export const emailAdapter = {
//   send,
// };
