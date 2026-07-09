"use client";

import { Plus, Trash2 } from "lucide-react";

import { CreateOfferPayload, FlashSaleItem } from "@/types/api/offer";
import { emptyFlashItem } from "@/lib/offers/offerForm.utils";

type Props = {
  form: CreateOfferPayload;
  onChange: React.Dispatch<React.SetStateAction<CreateOfferPayload>>;
};

export default function FlashSaleItemsEditor({ form, onChange }: Props) {
  const addFlashItem = () => {
    onChange((prev) => ({
      ...prev,
      flashSaleItems: [...(prev.flashSaleItems ?? []), { ...emptyFlashItem }],
    }));
  };

  const removeFlashItem = (index: number) => {
    onChange((prev) => ({
      ...prev,
      flashSaleItems: (prev.flashSaleItems ?? []).filter((_, i) => i !== index),
    }));
  };

  const updateFlashItem = (index: number, patch: Partial<FlashSaleItem>) => {
    onChange((prev) => ({
      ...prev,
      flashSaleItems: (prev.flashSaleItems ?? []).map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      ),
    }));
  };

  return (
    <>
      <div className="md:col-span-2 pt-3 border-t border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-600">
            Flash Sale Products
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Temporary Product ID দিয়ে test করা যাবে। Later product search
            selector add করবেন।
          </p>
        </div>

        <button
          type="button"
          onClick={addFlashItem}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-50 text-brand-700 rounded-lg text-xs font-semibold hover:bg-brand-100 transition-colors"
        >
          <Plus size={12} />
          Add Product
        </button>
      </div>

      <div className="md:col-span-2 space-y-3">
        {(form.flashSaleItems ?? []).map((item, index) => (
          <div
            key={index}
            className="border border-gray-100 rounded-xl p-4 relative"
          >
            {(form.flashSaleItems?.length ?? 0) > 1 && (
              <button
                type="button"
                onClick={() => removeFlashItem(index)}
                className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pr-6">
              <div className="md:col-span-2">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block">
                  Product ID *
                </label>
                <input
                  value={item.product}
                  onChange={(e) =>
                    updateFlashItem(index, {
                      product: e.target.value,
                    })
                  }
                  placeholder="Paste product _id"
                  className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block">
                  Regular Price
                </label>
                <input
                  type="number"
                  value={item.regularPrice ?? ""}
                  onChange={(e) =>
                    updateFlashItem(index, {
                      regularPrice: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block">
                  Flash Price *
                </label>
                <input
                  type="number"
                  value={item.flashPrice}
                  onChange={(e) =>
                    updateFlashItem(index, {
                      flashPrice: Number(e.target.value),
                    })
                  }
                  className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block">
                  Stock Limit
                </label>
                <input
                  type="number"
                  value={item.stockLimit ?? ""}
                  onChange={(e) =>
                    updateFlashItem(index, {
                      stockLimit: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block">
                  Per User Limit
                </label>
                <input
                  type="number"
                  value={item.perUserLimit ?? ""}
                  onChange={(e) =>
                    updateFlashItem(index, {
                      perUserLimit: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block">
                  Item Status
                </label>
                <select
                  value={item.status ?? "ACTIVE"}
                  onChange={(e) =>
                    updateFlashItem(index, {
                      status: e.target.value as "ACTIVE" | "INACTIVE",
                    })
                  }
                  className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-brand-400"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="md:col-span-4">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block">
                  Variant ID Optional
                </label>
                <input
                  value={item.variantId ?? ""}
                  onChange={(e) =>
                    updateFlashItem(index, {
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
    </>
  );
}
