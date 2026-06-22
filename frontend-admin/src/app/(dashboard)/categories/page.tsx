"use client";
import { useState } from "react";
import Image from "next/image";
import { Plus, Edit2, Trash2, X, Loader2 } from "lucide-react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/queries/useCategories";
import { ApiCategory, getCategoryId, CreateCategoryPayload } from "@/types/api/category";
import { LoadingTable } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { getErrorMessage } from "@/lib/api/client";
import toast from "react-hot-toast";

const emptyForm: CreateCategoryPayload = { name: "", description: "", image: "", sortOrder: 0 };

export default function CategoriesPage() {
  const { data: categories, isLoading, isError, refetch } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiCategory | null>(null);
  const [form, setForm] = useState<CreateCategoryPayload>(emptyForm);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ApiCategory | null>(null);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setError(""); setModalOpen(true); };
  const openEdit = (cat: ApiCategory) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description ?? "", image: cat.image ?? "", sortOrder: cat.sortOrder ?? 0 });
    setError("");
    setModalOpen(true);
  };

  const submit = () => {
    if (!form.name.trim()) { setError("Category name is required"); return; }
    setError("");
    if (editing) {
      updateMutation.mutate({ id: getCategoryId(editing), payload: form }, {
        onSuccess: () => { toast.success("Category updated"); setModalOpen(false); },
        onError: (err) => setError(getErrorMessage(err)),
      });
    } else {
      createMutation.mutate(form, {
        onSuccess: () => { toast.success("Category created"); setModalOpen(false); },
        onError: (err) => setError(getErrorMessage(err)),
      });
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(getCategoryId(deleteTarget), {
      onSuccess: () => { toast.success("Category deleted"); setDeleteTarget(null); },
      onError: (err) => { toast.error(getErrorMessage(err)); setDeleteTarget(null); },
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">{categories?.length ?? 0} categories</p>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-brand-700 text-white rounded-xl text-sm font-semibold hover:bg-brand-800 transition-colors">
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {isLoading && <LoadingTable rows={5} cols={5} />}
        {isError && <div className="p-6"><ErrorState message="Couldn't load categories." onRetry={() => refetch()} /></div>}
        {!isLoading && !isError && (!categories || categories.length === 0) && (
          <div className="p-10"><EmptyState title="No categories yet" description="Create your first category to organize products." /></div>
        )}
        {!isLoading && !isError && categories && categories.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Image</th>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Slug</th>
                <th className="px-5 py-3 font-medium">Products</th>
                <th className="px-5 py-3 font-medium">Sort Order</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={getCategoryId(cat)} className="border-b border-gray-50 hover:bg-gray-25">
                  <td className="px-5 py-3">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-brand-50">
                      {cat.image && <Image src={cat.image} alt={cat.name} fill sizes="40px" className="object-cover" />}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-800">{cat.name}</td>
                  <td className="px-5 py-3 text-gray-400">{cat.slug}</td>
                  <td className="px-5 py-3 text-gray-500">{cat.productCount ?? "—"}</td>
                  <td className="px-5 py-3 text-gray-500">{cat.sortOrder ?? 0}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => openEdit(cat)} className="p-1.5 text-gray-400 hover:text-brand-600 transition-colors"><Edit2 size={15} /></button>
                    <button onClick={() => setDeleteTarget(cat)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-fade-in">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={18} /></button>
            <h3 className="font-serif text-lg font-bold text-gray-900 mb-5">{editing ? "Edit Category" : "New Category"}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Name *</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Image URL</label>
                <input value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} placeholder="https://..." className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Sort Order</label>
                <input type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
              </div>
              {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <button
                onClick={submit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full mt-2 py-3 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 size={14} className="animate-spin" />}
                {editing ? "Save Changes" : "Create Category"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this category?"
        description={deleteTarget ? `"${deleteTarget.name}" will be removed. This cannot be undone.` : ""}
        confirmLabel="Delete"
        danger
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
