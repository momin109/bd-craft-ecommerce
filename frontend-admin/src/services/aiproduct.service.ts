import { apiClient, unwrap } from "@/lib/api/client";

/* =========================
   TYPES
========================= */

export type AiGenerationStatus = "GENERATED" | "FAILED" | "PENDING";

export type AiProductCopyPayload = {
  language: "bn" | "en";
  productName: string;
  categoryName: string;
  brand?: string;
  sellingPrice?: number;
  targetAudience: string;
  keyFeatures: string[];
  materials?: string[];
  sizes?: string[];
  colors?: string[];
  tone: "premium" | "casual" | "luxury" | "friendly";
  extraInstructions?: string;
};

export type AiGeneratedCopy = {
  productName: string;
  shortDescription: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  tags: string[];
  facebookAdPrimaryText: string;
  facebookAdHeadline: string;
  searchKeywords: string[];
};

export type AiGeneration = {
  _id: string;
  status: AiGenerationStatus;
  productId?: string;
  outputPayload?: AiGeneratedCopy;
  createdAt?: string;
};

/* =========================
   SERVICE
========================= */

export const aiProductCopyService = {
  // ✍️ Manual product copy generation
  generateManualCopy: async (payload: AiProductCopyPayload) => {
    const res = await apiClient.post("/ai/product-copy/generate", payload);

    return unwrap<AiGeneration>(res);
  },

  // 🧠 Generate copy from existing product
  generateFromProduct: async (
    productId: string,
    payload: {
      language: "bn" | "en";
      tone: "premium" | "casual" | "luxury" | "friendly";
      targetAudience: string;
      extraInstructions?: string;
    },
  ) => {
    const res = await apiClient.post(
      `/ai/products/${productId}/generate-copy`,
      payload,
    );

    return unwrap<AiGeneration>(res);
  },

  // 📌 Apply AI copy to product
  applyCopy: async (
    productId: string,
    payload: {
      generationId: string;
      applyFields: Array<
        | "name"
        | "shortDescription"
        | "description"
        | "metaTitle"
        | "metaDescription"
        | "tags"
      >;
    },
  ) => {
    const res = await apiClient.patch(
      `/ai/products/${productId}/apply-copy`,
      payload,
    );

    return unwrap(res);
  },

  // 📊 Get AI generation logs
  getGenerations: async (params?: {
    status?: AiGenerationStatus;
    productId?: string;
  }) => {
    const res = await apiClient.get("/ai/generations", {
      params: params ?? {},
    });

    return unwrap<{ generations: AiGeneration[] }>(res);
  },
};
