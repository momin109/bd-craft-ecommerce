"use client";

import { useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";

import { uploadService } from "@/services/upload.service";
import { getUploadUrl } from "@/lib/offers/offerForm.utils";

type Props = {
  value?: string;
  onChange: (url: string) => void;
};

export default function OfferBannerUploader({ value, onChange }: Props) {
  const [isUploading, setIsUploading] = useState(false);

  const uploadBannerImage = async (file: File) => {
    try {
      setIsUploading(true);

      const res = await uploadService.uploadSingle(file);
      const url = getUploadUrl(res);

      if (!url) {
        console.error("No URL in upload response:", res);
        toast.error("Upload failed — no image URL returned");
        return;
      }

      onChange(url);
      toast.success("Banner uploaded");
    } catch (err) {
      console.error("Offer banner upload error:", err);
      toast.error("Banner upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
        Banner Image
      </label>

      <div className="border border-dashed border-gray-200 rounded-2xl p-4">
        {value ? (
          <div className="relative">
            <img
              src={value}
              alt="Offer banner"
              className="w-full h-40 object-cover rounded-xl border border-gray-100"
            />

            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="h-32 rounded-xl bg-gray-50 flex flex-col items-center justify-center text-gray-400">
            <ImagePlus size={28} />
            <p className="text-xs mt-2">Upload offer banner image</p>
          </div>
        )}

        <div className="mt-3 flex items-center gap-2">
          <input
            id="offer-banner-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];

              if (!file) return;

              await uploadBannerImage(file);

              e.target.value = "";
            }}
          />

          <label
            htmlFor="offer-banner-upload"
            className="cursor-pointer px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            {isUploading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <ImagePlus size={15} />
            )}
            {isUploading ? "Uploading..." : "Upload Banner"}
          </label>

          {value && <p className="text-xs text-green-600">Banner ready</p>}
        </div>
      </div>
    </div>
  );
}
