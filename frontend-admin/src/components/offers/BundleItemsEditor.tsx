"use client";

import { Plus, Trash2 } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

import {
  BundleDiscountType,
  BundleItem,
  CreateOfferPayload,
} from "@/types/api/offer";

import { emptyBundleItem } from "@/lib/offers/offerForm.utils";

type Props = {
  form: CreateOfferPayload;
  onChange: Dispatch<SetStateAction<CreateOfferPayload>>;
};

export default function BundleItemsEditor({ form, onChange }: Props) {
  const addBundleItem = () => {
    onChange((prev) => ({
      ...prev,
      bundle: {
        ...prev.bundle!,
        items: [...(prev.bundle?.items ?? []), { ...emptyBundleItem }],
      },
    }));
  };

  const removeBundleItem = (index: number) => {
    onChange((prev) => ({
      ...prev,
      bundle: {
        ...prev.bundle!,
        items: (prev.bundle?.items ?? []).filter((_, i) => i !== index),
      },
    }));
  };

  const updateBundleItem = (index: number, patch: Partial<BundleItem>) => {
    onChange((prev) => ({
      ...prev,
      bundle: {
        ...prev.bundle!,
        items: (prev.bundle?.items ?? []).map((item, i) =>
          i === index ? { ...item, ...patch } : item,
        ),
      },
    }));
  };

  return (
    <>
      <div className="md:col-span-2 pt-3 border-t border-gray-100 flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-600">Bundle Items *</p>

        <button
          type="button"
          onClick={addBundleItem}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-50 text-brand-700 rounded-lg text-xs font-semibold hover:bg-brand-100 transition-colors"
        >
          <Plus size={12} />
          Add Item
        </button>
      </div>

      <div className="md:col-span-2 space-y-2.5">
        {(form.bundle?.items ?? []).map((item, index) => (
          <div
            key={index}
            className="border border-gray-100 rounded-xl p-3 relative"
          >
            {(form.bundle?.items?.length ?? 0) > 2 && (
              <button
                type="button"
                onClick={() => removeBundleItem(index)}
                className="absolute top-2.5 right-2.5 text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            )}

            <div className="grid grid-cols-3 gap-2 pr-6">
              <div className="col-span-2">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block">
                  Product ID *
                </label>
                <input
                  value={item.product}
                  onChange={(e) =>
                    updateBundleItem(index, {
                      product: e.target.value,
                    })
                  }
                  placeholder="Paste product _id"
                  className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block">
                  Quantity *
                </label>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    updateBundleItem(index, {
                      quantity: Number(e.target.value),
                    })
                  }
                  className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400"
                />
              </div>

              <div className="col-span-3">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block">
                  Variant ID Optional
                </label>
                <input
                  value={item.variantId ?? ""}
                  onChange={(e) =>
                    updateBundleItem(index, {
                      variantId: e.target.value,
                    })
                  }
                  placeholder="Leave blank for any variant"
                  className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="md:col-span-2 pt-3 border-t border-gray-100">
        <p className="text-xs font-semibold text-gray-600 mb-2">
          Bundle Discount
        </p>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
          Discount Type
        </label>
        <select
          value={form.bundle?.discountType ?? "FIXED"}
          onChange={(e) =>
            onChange((prev) => ({
              ...prev,
              bundle: {
                ...prev.bundle!,
                discountType: e.target.value as BundleDiscountType,
              },
            }))
          }
          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-brand-400"
        >
          <option value="FIXED">Fixed Amount</option>
          <option value="PERCENTAGE">Percentage</option>
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
          Discount Value *
        </label>
        <input
          type="number"
          value={form.bundle?.discountValue ?? 0}
          onChange={(e) =>
            onChange((prev) => ({
              ...prev,
              bundle: {
                ...prev.bundle!,
                discountValue: Number(e.target.value),
              },
            }))
          }
          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"
        />
      </div>

      {form.bundle?.discountType === "PERCENTAGE" && (
        <div className="md:col-span-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
            Max Discount Optional Cap
          </label>
          <input
            type="number"
            value={form.bundle?.maxDiscount ?? ""}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                bundle: {
                  ...prev.bundle!,
                  maxDiscount: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                },
              }))
            }
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"
          />
        </div>
      )}
    </>
  );
}
