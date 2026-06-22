import OpenAI from "openai";

import { env } from "../../../config/env.js";
import { IAiProductCopy, TAiLanguage } from "../ai.interface.js";

type TGenerateProductCopyPayload = {
  language: TAiLanguage;
  productName: string;
  categoryName?: string;
  brand?: string;
  sellingPrice?: number;
  targetAudience?: string;
  keyFeatures?: string[];
  materials?: string[];
  sizes?: string[];
  colors?: string[];
  tone?: string;
  extraInstructions?: string;
};

const productCopySchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    productName: {
      type: "string",
    },
    shortDescription: {
      type: "string",
    },
    description: {
      type: "string",
    },
    metaTitle: {
      type: "string",
    },
    metaDescription: {
      type: "string",
    },
    tags: {
      type: "array",
      items: {
        type: "string",
      },
    },
    facebookAdPrimaryText: {
      type: "string",
    },
    facebookAdHeadline: {
      type: "string",
    },
    searchKeywords: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },
  required: [
    "productName",
    "shortDescription",
    "description",
    "metaTitle",
    "metaDescription",
    "tags",
    "facebookAdPrimaryText",
    "facebookAdHeadline",
    "searchKeywords",
  ],
};

const getMockProductCopy = (
  payload: TGenerateProductCopyPayload,
): IAiProductCopy => {
  const isBangla = payload.language === "bn";

  if (isBangla) {
    return {
      productName: payload.productName,
      shortDescription: `${payload.productName} — আরামদায়ক, স্টাইলিশ এবং দৈনন্দিন ব্যবহারের জন্য পারফেক্ট।`,
      description:
        `${payload.productName} তৈরি করা হয়েছে আধুনিক গ্রাহকের প্রয়োজন মাথায় রেখে। ` +
        `এর মানসম্মত উপাদান, সুন্দর ফিনিশিং এবং ব্যবহারবান্ধব ডিজাইন আপনাকে দেবে ভালো অভিজ্ঞতা। ` +
        `প্রতিদিনের ব্যবহার, উপহার বা বিশেষ উপলক্ষ—সব ক্ষেত্রেই এটি একটি ভালো পছন্দ।`,
      metaTitle: `${payload.productName} | Best Price in Bangladesh`,
      metaDescription: `${payload.productName} এখন কিনুন সেরা দামে। মানসম্মত পণ্য, দ্রুত ডেলিভারি এবং সহজ অর্ডার সুবিধা।`,
      tags: [
        payload.productName,
        payload.categoryName || "ecommerce",
        "Bangladesh",
        "online shopping",
      ],
      facebookAdPrimaryText: `${payload.productName} এখন অর্ডার করুন। মান, স্টাইল আর আরামের দারুণ সমন্বয়।`,
      facebookAdHeadline: `${payload.productName} - আজই কিনুন`,
      searchKeywords: [
        `${payload.productName} price in Bangladesh`,
        `${payload.productName} online`,
        `${payload.productName} buy BD`,
      ],
    };
  }

  return {
    productName: payload.productName,
    shortDescription: `${payload.productName} — stylish, comfortable, and perfect for everyday use.`,
    description:
      `${payload.productName} is designed for customers who want quality, comfort, and value. ` +
      `With practical features and a clean finish, it is suitable for everyday use, gifting, and special occasions.`,
    metaTitle: `${payload.productName} | Best Price in Bangladesh`,
    metaDescription: `Buy ${payload.productName} online at the best price in Bangladesh with fast delivery and reliable service.`,
    tags: [
      payload.productName,
      payload.categoryName || "ecommerce",
      "Bangladesh",
      "online shopping",
    ],
    facebookAdPrimaryText: `Order ${payload.productName} today and enjoy quality, comfort, and great value.`,
    facebookAdHeadline: `${payload.productName} - Order Now`,
    searchKeywords: [
      `${payload.productName} price in Bangladesh`,
      `${payload.productName} online`,
      `buy ${payload.productName}`,
    ],
  };
};

const buildPrompt = (payload: TGenerateProductCopyPayload) => {
  return `
Generate ecommerce product copy.

Language: ${payload.language === "bn" ? "Bangla" : "English"}
Product Name: ${payload.productName}
Category: ${payload.categoryName || "N/A"}
Brand: ${payload.brand || "N/A"}
Selling Price: ${payload.sellingPrice || "N/A"}
Target Audience: ${payload.targetAudience || "General ecommerce customer"}
Tone: ${payload.tone || "friendly"}

Key Features:
${payload.keyFeatures?.join(", ") || "N/A"}

Materials:
${payload.materials?.join(", ") || "N/A"}

Sizes:
${payload.sizes?.join(", ") || "N/A"}

Colors:
${payload.colors?.join(", ") || "N/A"}

Extra Instructions:
${payload.extraInstructions || "Avoid false claims. Avoid medical/legal guarantees. Keep SEO natural."}

Rules:
- Product description must be conversion-focused but honest.
- Do not invent certifications, origin, warranty, or medical benefits.
- Meta title should be under 60 characters if possible.
- Meta description should be under 160 characters if possible.
- Tags should be practical search tags.
- Facebook ad copy should be short and clear.
`;
};

const generateProductCopy = async (
  payload: TGenerateProductCopyPayload,
): Promise<{
  provider: "OPENAI" | "MOCK";
  model?: string;
  output: IAiProductCopy;
}> => {
  if (!env.ai.enabled) {
    return {
      provider: "MOCK",
      model: "mock",
      output: getMockProductCopy(payload),
    };
  }

  if (!env.ai.openaiApiKey) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  const client = new OpenAI({
    apiKey: env.ai.openaiApiKey,
  });

  const response = await client.responses.create({
    model: env.ai.openaiModel,
    input: [
      {
        role: "system",
        content:
          "You are a professional ecommerce copywriter and SEO specialist for Bangladesh online stores.",
      },
      {
        role: "user",
        content: buildPrompt(payload),
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "product_copy_schema",
        strict: true,
        schema: productCopySchema,
      },
    },
  });

  const outputText = response.output_text;

  if (!outputText) {
    throw new Error("AI response was empty");
  }

  const parsed = JSON.parse(outputText) as IAiProductCopy;

  return {
    provider: "OPENAI",
    model: env.ai.openaiModel,
    output: parsed,
  };
};

export const openAiProvider = {
  generateProductCopy,
};
