import dotenv from "dotenv";

dotenv.config();

const requiredEnv = [
  "NODE_ENV",
  "PORT",
  "MONGODB_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "CLIENT_URL",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV as "development" | "production" | "test",
  port: Number(process.env.PORT),
  mongodbUri: process.env.MONGODB_URI as string,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET as string,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET as string,
  clientUrl: process.env.CLIENT_URL as string,

  apiBaseUrl:
    process.env.API_BASE_URL || `http://localhost:${process.env.PORT}`,
  clientPaymentSuccessUrl:
    process.env.CLIENT_PAYMENT_SUCCESS_URL ||
    `${process.env.CLIENT_URL}/payment/success`,
  clientPaymentFailUrl:
    process.env.CLIENT_PAYMENT_FAIL_URL ||
    `${process.env.CLIENT_URL}/payment/fail`,
  clientPaymentCancelUrl:
    process.env.CLIENT_PAYMENT_CANCEL_URL ||
    `${process.env.CLIENT_URL}/payment/cancel`,

  sslcommerz: {
    isLive: process.env.SSLCOMMERZ_IS_LIVE === "true",
    storeId: process.env.SSLCOMMERZ_STORE_ID || "",
    storePassword: process.env.SSLCOMMERZ_STORE_PASSWORD || "",
  },

  aamarpay: {
    isLive: process.env.AAMARPAY_IS_LIVE === "true",
    storeId: process.env.AAMARPAY_STORE_ID || "",
    signatureKey: process.env.AAMARPAY_SIGNATURE_KEY || "",
  },

  shurjopay: {
    isLive: process.env.SHURJOPAY_IS_LIVE === "true",
    username: process.env.SHURJOPAY_USERNAME || "",
    password: process.env.SHURJOPAY_PASSWORD || "",
    prefix: process.env.SHURJOPAY_PREFIX || "sp",
  },

  courier: {
    autoBookOnApproval: process.env.COURIER_AUTO_BOOK_ON_APPROVAL === "true",
    defaultProvider:
      (process.env.COURIER_DEFAULT_PROVIDER as
        | "STEADFAST"
        | "PATHAO"
        | "NONE") || "NONE",

    steadfast: {
      baseUrl:
        process.env.STEADFAST_API_BASE_URL ||
        "https://portal.packzy.com/api/v1",
      apiKey: process.env.STEADFAST_API_KEY || "",
      secretKey: process.env.STEADFAST_SECRET_KEY || "",
    },

    pathao: {
      baseUrl:
        process.env.PATHAO_API_BASE_URL || "https://api-hermes.pathao.com",
      clientId: process.env.PATHAO_CLIENT_ID || "",
      clientSecret: process.env.PATHAO_CLIENT_SECRET || "",
      username: process.env.PATHAO_USERNAME || "",
      password: process.env.PATHAO_PASSWORD || "",
      storeId: process.env.PATHAO_STORE_ID || "",
    },
  },

  notification: {
    smsEnabled: process.env.NOTIFICATION_SMS_ENABLED === "true",
    emailEnabled: process.env.NOTIFICATION_EMAIL_ENABLED === "true",
    whatsappEnabled: process.env.NOTIFICATION_WHATSAPP_ENABLED === "true",

    sms: {
      providerName: process.env.SMS_PROVIDER_NAME || "GENERIC_SMS",
      apiBaseUrl: process.env.SMS_API_BASE_URL || "",
      apiKey: process.env.SMS_API_KEY || "",
      senderId: process.env.SMS_SENDER_ID || "",
    },

    smtp: {
      host: process.env.SMTP_HOST || "",
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
      fromName: process.env.SMTP_FROM_NAME || "Ecommerce Shop",
      fromEmail: process.env.SMTP_FROM_EMAIL || "",
    },

    whatsapp: {
      providerName: process.env.WHATSAPP_PROVIDER_NAME || "WHATSAPP_CLOUD",
      apiBaseUrl: process.env.WHATSAPP_API_BASE_URL || "",
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || "",
    },

    meta: {
      capiEnabled: process.env.META_CAPI_ENABLED === "true",
      pixelId: process.env.META_PIXEL_ID || "",
      accessToken: process.env.META_ACCESS_TOKEN || "",
      apiVersion: process.env.META_API_VERSION || "v20.0",
      testEventCode: process.env.META_TEST_EVENT_CODE || "",
    },

    invoice: {
      companyName: process.env.INVOICE_COMPANY_NAME || "Your Shop Name",
      companyPhone: process.env.INVOICE_COMPANY_PHONE || "",
      companyEmail: process.env.INVOICE_COMPANY_EMAIL || "",
      companyAddress: process.env.INVOICE_COMPANY_ADDRESS || "",
      publicBaseUrl:
        process.env.INVOICE_PUBLIC_BASE_URL ||
        process.env.API_BASE_URL ||
        `http://localhost:${process.env.PORT}`,
    },

    ai: {
      enabled: process.env.AI_GENERATION_ENABLED === "true",
      openaiApiKey: process.env.OPENAI_API_KEY || "",
      openaiModel: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      defaultLanguage: (process.env.AI_DEFAULT_LANGUAGE as "bn" | "en") || "bn",
    },
  },

  upload: {
    provider:
      (process.env.UPLOAD_PROVIDER as "LOCAL" | "CLOUDINARY" | "S3") || "LOCAL",

    maxFileSizeMb: Number(process.env.UPLOAD_MAX_FILE_SIZE_MB || 5),

    local: {
      publicUrl:
        process.env.UPLOAD_LOCAL_PUBLIC_URL ||
        `http://localhost:${process.env.PORT}/uploads`,
    },

    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
      apiKey: process.env.CLOUDINARY_API_KEY || "",
      apiSecret: process.env.CLOUDINARY_API_SECRET || "",
    },

    s3: {
      region: process.env.AWS_S3_REGION || "",
      bucket: process.env.AWS_S3_BUCKET || "",
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY || "",
      publicUrl: process.env.AWS_S3_PUBLIC_URL || "",
    },
  },
};
