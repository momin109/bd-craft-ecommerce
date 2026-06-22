"use client";
import { useState } from "react";
import { Plus, Trash2, X, Loader2 } from "lucide-react";
import { useCoupons, useCreateCoupon, useDeleteCoupon } from "@/hooks/queries/useCoupons";
import { CreateCouponPayload, CouponDiscountType, CouponScope, CouponStatus } from "@/types/api/coupon";
import { formatBDT, formatDate } from "@/lib/utils";
import { LoadingTable } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import StatusBadge from "@/components/ui/StatusBadge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { getErrorMessage } from "@/lib/api/client";
import toast from "react-hot-toast";

const emptyForm: CreateCouponPayload = {
  code: "", title: "", discountType: "PERCENTAGE", discountValue: 10, maxDiscount: undefined,
  minOrderAmount: 0, startDate: "", endDate: "", usageLimit: 100, perCustomerLimit: 1,
  scope: "ALL_PRODUCTS", status: "ACTIVE",
};

export default function CouponsPage() {
  const { data: coupons, isLoading, isError, refetch } = useCoupons();
  const createMutation = useCreateCoupon();
  const deleteMutation = useDeleteCoupon();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CreateCouponPayload>(emptyForm);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; code: string } | null>(null);

  const openCreate = () => { setForm(emptyForm); setError(""); setModalOpen(true); };

  const submit = () => {
    if (!form.code.trim() || !form.title.trim() || !form.startDate || !form.endDate) {
      setError("Code, title, start date and end date are required");
      return;
    }
    setError("");
    createMutation.mutate(form, {
      onSuccess: () => { toast.success("Coupon created"); setModalOpen(false); },
      onError: (err) => setError(getErrorMessage(err)),
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => { toast.success("Coupon deleted"); setDeleteTarget(null); },
      onError: (err) => { toast.error(getErrorMessage(err)); setDeleteTarget(null); },
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">{coupons?.length ?? 0} coupons</p>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-brand-700 text-white rounded-xl text-sm font-semibold hover:bg-brand-800 transition-colors">
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden overflow-x-auto">
        {isLoading && <LoadingTable rows={5} cols={6} />}
        {isError && <div className="p-6"><ErrorState message="Couldn't load coupons." onRetry={() => refetch()} /></div>}
        {!isLoading && !isError && (!coupons || coupons.length === 0) && (
          <div className="p-10"><EmptyState title="No coupons yet" description="Create a percentage or fixed-amount coupon to offer discounts." /></div>
        )}
        {!isLoading && !isError && coupons && coupons.length > 0 && (
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Code</th>
                <th className="px-5 py-3 font-medium">Discount</th>
                <th className="px-5 py-3 font-medium">Min Order</th>
                <th className="px-5 py-3 font-medium">Usage</th>
                <th className="px-5 py-3 font-medium">Valid Until</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => {
                const id = c._id ?? c.id ?? "";
                return (
                  <tr key={id} className="border-b border-gray-50 hover:bg-gray-25">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-gray-800">{c.code}</p>
                      <p className="text-xs text-gray-400">{c.title}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-700">
                      {c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : formatBDT(c.discountValue)}
                      {c.maxDiscount ? <span className="text-xs text-gray-400"> (max {formatBDT(c.maxDiscount)})</span> : ""}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{formatBDT(c.minOrderAmount ?? 0)}</td>
                    <td className="px-5 py-3 text-gray-500">{c.usedCount ?? 0} / {c.usageLimit ?? "∞"}</td>
                    <td className="px-5 py-3 text-gray-500">{formatDate(c.endDate)}</td>
                    <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => setDeleteTarget({ id, code: c.code })} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
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
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fade-in my-8">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={18} /></button>
            <h3 className="font-serif text-lg font-bold text-gray-900 mb-5">Create Coupon</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Code *</label>
                <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="EID10" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Title *</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Eid Special 10% Off" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Discount Type</label>
                <select value={form.discountType} onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value as CouponDiscountType }))} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-brand-400">
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Discount Value *</label>
                <input type="number" value={form.discountValue} onChange={(e) => setForm((f) => ({ ...f, discountValue: Number(e.target.value) }))} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Max Discount</label>
                <input type="number" value={form.maxDiscount ?? ""} onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value ? Number(e.target.value) : undefined }))} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Min Order Amount</label>
                <input type="number" value={form.minOrderAmount} onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: Number(e.target.value) }))} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Start Date *</label>
                <input type="date" value={form.startDate?.slice(0, 10)} onChange={(e) => setForm((f) => ({ ...f, startDate: new Date(e.target.value).toISOString() }))} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">End Date *</label>
                <input type="date" value={form.endDate?.slice(0, 10)} onChange={(e) => setForm((f) => ({ ...f, endDate: new Date(e.target.value).toISOString() }))} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Usage Limit</label>
                <input type="number" value={form.usageLimit} onChange={(e) => setForm((f) => ({ ...f, usageLimit: Number(e.target.value) }))} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Per Customer Limit</label>
                <input type="number" value={form.perCustomerLimit} onChange={(e) => setForm((f) => ({ ...f, perCustomerLimit: Number(e.target.value) }))} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Scope</label>
                <select value={form.scope} onChange={(e) => setForm((f) => ({ ...f, scope: e.target.value as CouponScope }))} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-brand-400">
                  <option value="ALL_PRODUCTS">All Products</option>
                  <option value="SPECIFIC_PRODUCTS">Specific Products</option>
                  <option value="SPECIFIC_CATEGORY">Specific Category</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Status</label>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as CouponStatus }))} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-brand-400">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
            {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg mt-3">{error}</p>}
            <button onClick={submit} disabled={createMutation.isPending} className="w-full mt-4 py-3 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
              {createMutation.isPending && <Loader2 size={14} className="animate-spin" />} Create Coupon
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this coupon?"
        description={deleteTarget ? `"${deleteTarget.code}" will no longer be applicable.` : ""}
        confirmLabel="Delete"
        danger
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
