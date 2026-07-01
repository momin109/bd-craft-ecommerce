"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit2, Trash2, Search, AlertTriangle } from "lucide-react";

import { useProducts, useDeleteProduct } from "@/hooks/queries/useProducts";
import {
  getProductId,
  getProductTotalStock,
  normalizeProductList,
} from "@/types/api/product";

import { formatBDT } from "@/lib/utils";
import { LoadingTable } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StatusBadge from "@/components/ui/StatusBadge";
import { getErrorMessage } from "@/lib/api/client";
import toast from "react-hot-toast";

/* =========================
   SAFE IMAGE CHECK
========================= */

const isValidImage = (url?: string) => {
  if (!url) return false;
  if (!url.startsWith("http://") && !url.startsWith("https://")) return false;
  return true;
};

export default function ProductsPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, refetch } = useProducts({
    search: search || undefined,
    limit: 50,
  });

  const deleteMutation = useDeleteProduct();

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const products = normalizeProductList(data);

  const confirmDelete = () => {
    if (!deleteTarget) return;

    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Product removed");
        setDeleteTarget(null);
      },
      onError: (err) => {
        toast.error(getErrorMessage(err));
        setDeleteTarget(null);
      },
    });
  };

  return (
    <div className="animate-fade-in">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"
          />
        </div>

        <Link
          href="/products/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-700 text-white rounded-xl text-sm font-semibold hover:bg-brand-800 transition-colors"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden overflow-x-auto">
        {isLoading && <LoadingTable rows={6} cols={6} />}

        {isError && (
          <div className="p-6">
            <ErrorState
              message="Couldn't load products."
              onRetry={() => refetch()}
            />
          </div>
        )}

        {!isLoading && !isError && products.length === 0 && (
          <div className="p-10">
            <EmptyState
              title="No products found"
              description="Try a different search or add your first product."
            />
          </div>
        )}

        {!isLoading && !isError && products.length > 0 && (
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => {
                const id = getProductId(p);
                const totalStock = getProductTotalStock(p);

                const img = p.images?.[0];
                const validImg = isValidImage(img);

                const lowStock = p.variants?.some(
                  (v) => v.stock > 0 && v.stock <= (v.lowStockAlert ?? 5),
                );

                return (
                  <tr
                    key={id}
                    className="border-b border-gray-50 hover:bg-gray-25"
                  >
                    {/* ================= PRODUCT ================= */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-12 rounded-lg overflow-hidden bg-brand-50 shrink-0">
                          {validImg ? (
                            <Image
                              src={img as string}
                              alt={p.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">
                              No Image
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="font-medium text-gray-800 line-clamp-1">
                            {p.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {p.variants?.length ?? 0} variants
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* CATEGORY */}
                    <td className="px-5 py-3 text-gray-500">
                      {typeof p.category === "object"
                        ? p.category.name
                        : p.category}
                    </td>

                    {/* PRICE */}
                    <td className="px-5 py-3 text-gray-700 font-medium">
                      {formatBDT(p.baseSellingPrice)}
                    </td>

                    {/* STOCK */}
                    <td className="px-5 py-3">
                      <span
                        className={
                          totalStock === 0
                            ? "text-red-500 font-medium"
                            : lowStock
                              ? "text-amber-600 font-medium"
                              : "text-gray-600"
                        }
                      >
                        {totalStock}
                      </span>

                      {lowStock && totalStock > 0 && (
                        <AlertTriangle
                          size={12}
                          className="inline ml-1 text-amber-500"
                        />
                      )}
                    </td>

                    {/* STATUS */}
                    <td className="px-5 py-3">
                      <StatusBadge status={p.status} />
                    </td>

                    {/* ACTIONS */}
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <Link
                        href={`/products/${id}/edit`}
                        className="p-1.5 text-gray-400 hover:text-brand-600 transition-colors inline-block"
                      >
                        <Edit2 size={15} />
                      </Link>

                      <button
                        onClick={() => setDeleteTarget({ id, name: p.name })}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ================= DELETE CONFIRM ================= */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this product?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" and all its variants will be removed.`
            : ""
        }
        confirmLabel="Delete"
        danger
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
