"use client";

import { Loader2, X } from "lucide-react";

import { CreateOfferPayload, OfferStatus, OfferType } from "@/types/api/offer";

import OfferBannerUploader from "@/components/offers/OfferBannerUploader";
import FlashSaleItemsEditor from "@/components/offers/FlashSaleItemsEditor";
import BundleItemsEditor from "@/components/offers/BundleItemsEditor";

import {
  buildOfferPayload,
  fromDateTimeLocalToIso,
  statusOptions,
  toDateTimeLocalValue,
  validateOfferForm,
} from "@/lib/offers/offerForm.utils";

type Props = {
  open: boolean;
  form: CreateOfferPayload;
  error: string;
  isPending: boolean;
  onClose: () => void;
  onError: (message: string) => void;
  onChange: React.Dispatch<React.SetStateAction<CreateOfferPayload>>;
  onSubmit: (payload: CreateOfferPayload) => void;
};

export default function OfferCreateModal({
  open,
  form,
  error,
  isPending,
  onClose,
  onError,
  onChange,
  onSubmit,
}: Props) {
  if (!open) return null;

  const submit = () => {
    const validationError = validateOfferForm(form);

    if (validationError) {
      onError(validationError);
      return;
    }

    onError("");

    const payload = buildOfferPayload(form);

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6 animate-fade-in my-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>

        <h3 className="font-serif text-lg font-bold text-gray-900 mb-5">
          Create Offer
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <OfferBannerUploader
              value={form.bannerImage}
              onChange={(url) =>
                onChange((prev) => ({
                  ...prev,
                  bannerImage: url,
                }))
              }
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Code *
            </label>
            <input
              value={form.code}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  code: e.target.value.toUpperCase(),
                }))
              }
              placeholder="FLASH-EID-01"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Title *
            </label>
            <input
              value={form.title}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              placeholder="Eid Flash Sale"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Description
            </label>
            <input
              value={form.description}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Type
            </label>
            <select
              value={form.type}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  type: e.target.value as OfferType,
                }))
              }
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-brand-400"
            >
              <option value="FLASH_SALE">Flash Sale</option>
              <option value="BUNDLE">Bundle</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Priority
            </label>
            <input
              type="number"
              value={form.priority ?? ""}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  priority: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              value={toDateTimeLocalValue(form.startDate)}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  startDate: fromDateTimeLocalToIso(e.target.value),
                }))
              }
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              End Date & Time *
            </label>
            <input
              type="datetime-local"
              value={toDateTimeLocalValue(form.endDate)}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  endDate: fromDateTimeLocalToIso(e.target.value),
                }))
              }
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"
            />
          </div>

          {form.type === "FLASH_SALE" ? (
            <FlashSaleItemsEditor form={form} onChange={onChange} />
          ) : (
            <BundleItemsEditor form={form} onChange={onChange} />
          )}

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Usage Limit
            </label>
            <input
              type="number"
              value={form.usageLimit ?? ""}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  usageLimit: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                }))
              }
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  status: e.target.value as OfferStatus,
                }))
              }
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-brand-400"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg mt-3">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={isPending}
          className="w-full mt-4 py-3 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
        >
          {isPending && <Loader2 size={14} className="animate-spin" />}
          Create Offer
        </button>
      </div>
    </div>
  );
}
