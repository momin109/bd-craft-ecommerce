"use client";
import { useState } from "react";
import { Plus, Trash2, X, Loader2 } from "lucide-react";
import { useOffers, useCreateOffer, useDeleteOffer } from "@/hooks/queries/useOffers";
import { CreateOfferPayload, OfferType, OfferStatus, BundleItem, BundleDiscountType } from "@/types/api/offer";
import { formatDate } from "@/lib/utils";
import { LoadingTable } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import StatusBadge from "@/components/ui/StatusBadge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { getErrorMessage } from "@/lib/api/client";
import toast from "react-hot-toast";

const emptyBundleItem: BundleItem = { product: "", variantId: "", quantity: 1 };

const emptyForm: CreateOfferPayload = {
  code: "", title: "", description: "", type: "FLASH_SALE",
  startDate: "", endDate: "", priority: 5, usageLimit: 100,
  flashSaleItems: [{ product: "", flashPrice: 0, stockLimit: undefined }],
  bundle: { items: [{ ...emptyBundleItem }], discountType: "FIXED", discountValue: 0, maxDiscount: undefined },
  status: "ACTIVE",
};

export default function OffersPage() {
  const { data: offers, isLoading, isError, refetch } = useOffers();
  const createMutation = useCreateOffer();
  const deleteMutation = useDeleteOffer();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CreateOfferPayload>(emptyForm);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; code: string } | null>(null);

  const openCreate = () => { setForm(emptyForm); setError(""); setModalOpen(true); };

  // Bundle item row helpers
  const addBundleItem = () => setForm((f) => ({
    ...f, bundle: { ...f.bundle!, items: [...(f.bundle?.items ?? []), { ...emptyBundleItem }] },
  }));
  const removeBundleItem = (i: number) => setForm((f) => ({
    ...f, bundle: { ...f.bundle!, items: (f.bundle?.items ?? []).filter((_, idx) => idx !== i) },
  }));
  const updateBundleItem = (i: number, patch: Partial<BundleItem>) => setForm((f) => ({
    ...f, bundle: { ...f.bundle!, items: (f.bundle?.items ?? []).map((row, idx) => (idx === i ? { ...row, ...patch } : row)) },
  }));

  const validate = (): string | null => {
    if (!form.code.trim() || !form.title.trim() || !form.startDate || !form.endDate) {
      return "Code, title, start date and end date are required";
    }
    if (form.type === "FLASH_SALE") {
      const item = form.flashSaleItems?.[0];
      if (!item?.product || !item.flashPrice) return "Flash sale needs a Product ID and flash price";
    } else {
      const items = form.bundle?.items ?? [];
      if (items.length < 2) return "A bundle needs at least 2 products";
      for (const it of items) {
        if (!it.product.trim()) return "Every bundle item needs a Product ID";
        if (!it.quantity || it.quantity < 1) return "Every bundle item needs a quantity of at least 1";
      }
      if (!form.bundle?.discountValue) return "Set a bundle discount value greater than 0";
    }
    return null;
  };

  const submit = () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError("");
    const payload: CreateOfferPayload = form.type === "FLASH_SALE"
      ? { ...form, bundle: undefined }
      : { ...form, flashSaleItems: undefined };
    createMutation.mutate(payload, {
      onSuccess: () => { toast.success("Offer created"); setModalOpen(false); },
      onError: (err) => setError(getErrorMessage(err)),
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => { toast.success("Offer deleted"); setDeleteTarget(null); },
      onError: (err) => { toast.error(getErrorMessage(err)); setDeleteTarget(null); },
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">{offers?.length ?? 0} offers</p>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-brand-700 text-white rounded-xl text-sm font-semibold hover:bg-brand-800 transition-colors">
          <Plus size={16} /> Create Offer
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden overflow-x-auto">
        {isLoading && <LoadingTable rows={5} cols={5} />}
        {isError && <div className="p-6"><ErrorState message="Couldn't load offers." onRetry={() => refetch()} /></div>}
        {!isLoading && !isError && (!offers || offers.length === 0) && (
          <div className="p-10"><EmptyState title="No offers yet" description="Create a flash sale or bundle deal to drive conversions." /></div>
        )}
        {!isLoading && !isError && offers && offers.length > 0 && (
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Code</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Priority</th>
                <th className="px-5 py-3 font-medium">Valid Until</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((o) => {
                const id = o._id ?? o.id ?? "";
                return (
                  <tr key={id} className="border-b border-gray-50 hover:bg-gray-25">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-gray-800">{o.code}</p>
                      <p className="text-xs text-gray-400">{o.title}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{o.type === "FLASH_SALE" ? "Flash Sale" : `Bundle (${o.bundle?.items?.length ?? 0} items)`}</td>
                    <td className="px-5 py-3 text-gray-500">{o.priority ?? 0}</td>
                    <td className="px-5 py-3 text-gray-500">{formatDate(o.endDate)}</td>
                    <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => setDeleteTarget({ id, code: o.code })} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 animate-fade-in my-8">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={18} /></button>
            <h3 className="font-serif text-lg font-bold text-gray-900 mb-5">Create Offer</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Code *</label>
                <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="FLASH-EID-01" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Title *</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Eid Flash Sale" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Description</label>
                <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Type</label>
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as OfferType }))} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-brand-400">
                  <option value="FLASH_SALE">Flash Sale</option>
                  <option value="BUNDLE">Bundle</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Priority</label>
                <input type="number" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: Number(e.target.value) }))} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Start Date *</label>
                <input type="date" value={form.startDate?.slice(0, 10)} onChange={(e) => setForm((f) => ({ ...f, startDate: new Date(e.target.value).toISOString() }))} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">End Date *</label>
                <input type="date" value={form.endDate?.slice(0, 10)} onChange={(e) => setForm((f) => ({ ...f, endDate: new Date(e.target.value).toISOString() }))} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
              </div>

              {form.type === "FLASH_SALE" ? (
                <>
                  <div className="col-span-2 pt-2 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Flash Sale Item</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Product ID *</label>
                    <input
                      value={form.flashSaleItems?.[0]?.product ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, flashSaleItems: [{ ...(f.flashSaleItems?.[0] ?? { flashPrice: 0 }), product: e.target.value }] }))}
                      placeholder="Paste product _id"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Flash Price *</label>
                    <input
                      type="number"
                      value={form.flashSaleItems?.[0]?.flashPrice ?? 0}
                      onChange={(e) => setForm((f) => ({ ...f, flashSaleItems: [{ ...(f.flashSaleItems?.[0] ?? { product: "" }), flashPrice: Number(e.target.value) }] }))}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Stock Limit</label>
                    <input
                      type="number"
                      value={form.flashSaleItems?.[0]?.stockLimit ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, flashSaleItems: [{ ...(f.flashSaleItems?.[0] ?? { product: "", flashPrice: 0 }), stockLimit: e.target.value ? Number(e.target.value) : undefined }] }))}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="col-span-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-600">Bundle Items *</p>
                    <button onClick={addBundleItem} className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-50 text-brand-700 rounded-lg text-xs font-semibold hover:bg-brand-100 transition-colors">
                      <Plus size={12} /> Add Item
                    </button>
                  </div>

                  <div className="col-span-2 space-y-2.5">
                    {(form.bundle?.items ?? []).map((item, i) => (
                      <div key={i} className="border border-gray-100 rounded-xl p-3 relative">
                        {(form.bundle?.items?.length ?? 0) > 1 && (
                          <button onClick={() => removeBundleItem(i)} className="absolute top-2.5 right-2.5 text-gray-300 hover:text-red-500 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        )}
                        <div className="grid grid-cols-3 gap-2 pr-6">
                          <div className="col-span-2">
                            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Product ID *</label>
                            <input value={item.product} onChange={(e) => updateBundleItem(i, { product: e.target.value })} placeholder="Paste product _id" className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400" />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Quantity *</label>
                            <input type="number" min={1} value={item.quantity} onChange={(e) => updateBundleItem(i, { quantity: Number(e.target.value) })} className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400" />
                          </div>
                          <div className="col-span-3">
                            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Variant ID (optional)</label>
                            <input value={item.variantId ?? ""} onChange={(e) => updateBundleItem(i, { variantId: e.target.value })} placeholder="Leave blank for any variant" className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="col-span-2 pt-2 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Bundle Discount</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Discount Type</label>
                    <select
                      value={form.bundle?.discountType ?? "FIXED"}
                      onChange={(e) => setForm((f) => ({ ...f, bundle: { ...f.bundle!, discountType: e.target.value as BundleDiscountType } }))}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-brand-400"
                    >
                      <option value="FIXED">Fixed Amount</option>
                      <option value="PERCENTAGE">Percentage</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Discount Value *</label>
                    <input
                      type="number"
                      value={form.bundle?.discountValue ?? 0}
                      onChange={(e) => setForm((f) => ({ ...f, bundle: { ...f.bundle!, discountValue: Number(e.target.value) } }))}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"
                    />
                  </div>
                  {form.bundle?.discountType === "PERCENTAGE" && (
                    <div className="col-span-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Max Discount (optional cap)</label>
                      <input
                        type="number"
                        value={form.bundle?.maxDiscount ?? ""}
                        onChange={(e) => setForm((f) => ({ ...f, bundle: { ...f.bundle!, maxDiscount: e.target.value ? Number(e.target.value) : undefined } }))}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"
                      />
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Usage Limit</label>
                <input type="number" value={form.usageLimit} onChange={(e) => setForm((f) => ({ ...f, usageLimit: Number(e.target.value) }))} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Status</label>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as OfferStatus }))} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-brand-400">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg mt-3">{error}</p>}
            <button onClick={submit} disabled={createMutation.isPending} className="w-full mt-4 py-3 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
              {createMutation.isPending && <Loader2 size={14} className="animate-spin" />} Create Offer
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this offer?"
        description={deleteTarget ? `"${deleteTarget.code}" will be deactivated and removed.` : ""}
        confirmLabel="Delete"
        danger
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
