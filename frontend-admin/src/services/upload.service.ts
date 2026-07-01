import { apiClient, unwrap } from "@/lib/api/client";

/* =========================
   TYPES
========================= */

export type UploadedFile = {
  originalName: string;
  url: string;
  provider: "LOCAL" | "S3" | "CLOUDINARY";
  purpose: "GENERAL" | "AVATAR" | "PRODUCT_IMAGE" | "REVIEW_IMAGE";
};

export type UploadResponse = {
  success: boolean;
  message: string;
  data: UploadedFile;
};

/* =========================
   SERVICE
========================= */

export const uploadService = {
  // 📁 Upload single image (general)
  uploadSingle: async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await apiClient.post("/uploads/single", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return unwrap<UploadResponse>(res);
  },

  // 👤 Upload avatar (auto update user)
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);

    const res = await apiClient.post("/uploads/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return unwrap<UploadResponse>(res);
  },

  // 🛍️ Upload product images (admin)
  uploadProductImages: async (productId: string, files: File[]) => {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("images", file);
    });

    const res = await apiClient.post(
      `/uploads/products/${productId}/images`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return unwrap<UploadResponse[]>(res);
  },

  // ⭐ Upload review images
  uploadReviewImages: async (files: File[]) => {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("images", file);
    });

    const res = await apiClient.post("/uploads/review-images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return unwrap<UploadResponse[]>(res);
  },

  // 📂 My uploaded files
  getMyFiles: async (params?: {
    purpose?: "GENERAL" | "AVATAR" | "PRODUCT_IMAGE" | "REVIEW_IMAGE";
  }) => {
    const res = await apiClient.get("/uploads/my-files", {
      params: params ?? {},
    });

    return unwrap<UploadResponse[]>(res);
  },

  // 🛡️ Admin: all files
  getAllFiles: async (params?: { purpose?: string; provider?: string }) => {
    const res = await apiClient.get("/uploads/admin/files", {
      params: params ?? {},
    });

    return unwrap<UploadResponse[]>(res);
  },
};
