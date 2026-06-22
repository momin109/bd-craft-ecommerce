"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Shield, Ban, MessageSquare, Loader2 } from "lucide-react";
import {
  useAdminCustomerDetail, useAdminCustomerOrders, useSetCustomerCod, useSetCustomerStatus, useAddCustomerNote,
} from "@/hooks/queries/useAdminCustomers";
import { formatBDT, formatDate } from "@/lib/utils";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import StatusBadge from "@/components/ui/StatusBadge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { getOrderId } from "@/types/api/order";
import { getErrorMessage } from "@/lib/api/client";
import toast from "react-hot-toast";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: detail, isLoading, isError, refetch } = useAdminCustomerDetail(id);
  const { data: orders } = useAdminCustomerOrders(id);

  const setCodMutation = useSetCustomerCod();
  const setStatusMutation = useSetCustomerStatus();
  const addNoteMutation = useAddCustomerNote();

  const [noteInput, setNoteInput] = useState("");
  const [confirmAction, setConfirmAction] = useState<"block" | "unblock" | "cod-on" | "cod-off" | null>(null);

  if (isLoading) return <LoadingState label="Loading customer..." />;
  if (isError || !detail) return <ErrorState message="Couldn't load this customer." onRetry={() => refetch()} />;

  const { profile, orderStats } = detail;

  const runAction = () => {
    if (confirmAction === "block") {
      setStatusMutation.mutate({ customerId: id, payload: { status: "BLOCKED", adminNote: noteInput || undefined } }, {
        onSuccess: () => { toast.success("Customer blocked"); setConfirmAction(null); },
        onError: (err) => { toast.error(getErrorMessage(err)); setConfirmAction(null); },
      });
    } else if (confirmAction === "unblock") {
      setStatusMutation.mutate({ customerId: id, payload: { status: "ACTIVE", adminNote: noteInput || undefined } }, {
        onSuccess: () => { toast.success("Customer unblocked"); setConfirmAction(null); },
        onError: (err) => { toast.error(getErrorMessage(err)); setConfirmAction(null); },
      });
    } else if (confirmAction === "cod-off") {
      setCodMutation.mutate({ customerId: id, payload: { codAllowed: false, adminNote: noteInput || undefined } }, {
        onSuccess: () => { toast.success("COD restricted"); setConfirmAction(null); },
        onError: (err) => { toast.error(getErrorMessage(err)); setConfirmAction(null); },
      });
    } else if (confirmAction === "cod-on") {
      setCodMutation.mutate({ customerId: id, payload: { codAllowed: true, adminNote: noteInput || undefined } }, {
        onSuccess: () => { toast.success("COD allowed"); setConfirmAction(null); },
        onError: (err) => { toast.error(getErrorMessage(err)); setConfirmAction(null); },
      });
    }
  };

  const saveNote = () => {
    if (!noteInput.trim()) return;
    addNoteMutation.mutate({ customerId: id, payload: { adminNote: noteInput } }, {
      onSuccess: () => { toast.success("Note saved"); setNoteInput(""); refetch(); },
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  };

  return (
    <div className="animate-fade-in max-w-4xl">
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
        <Link href="/customers" className="hover:text-brand-600">Customers</Link>
        <ChevronRight size={12} />
        <span className="text-gray-700">{profile.name}</span>
      </nav>

      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-900">{profile.name}</h2>
          <p className="text-sm text-gray-400 mt-1">{profile.mobile} {profile.email ? `· ${profile.email}` : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={detail.codAllowed ? "ACTIVE" : "BLOCKED"} />
          <StatusBadge status={profile.status ?? "ACTIVE"} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total Orders", value: orderStats.totalOrders },
              { label: "Delivered", value: orderStats.deliveredOrders },
              { label: "Success Rate", value: `${orderStats.successRate}%` },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4">
                <div className="text-xl font-bold text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Recent Orders</h3>
            {orders && orders.length > 0 ? (
              <div className="space-y-2">
                {orders.slice(0, 8).map((o) => (
                  <Link key={getOrderId(o)} href={`/orders/${getOrderId(o)}`} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-none hover:bg-gray-25 -mx-2 px-2 rounded">
                    <div>
                      <p className="text-sm font-medium text-brand-700">#{o.orderNumber}</p>
                      <p className="text-xs text-gray-400">{formatDate(o.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">{formatBDT(o.totalPayable)}</span>
                      <StatusBadge status={o.orderStatus} />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No orders yet.</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-1.5"><Shield size={14} className="text-brand-600" /> Account Actions</h3>
            <div className="space-y-2">
              {detail.codAllowed ? (
                <button onClick={() => setConfirmAction("cod-off")} className="w-full px-3 py-2 border border-orange-200 text-orange-600 text-sm font-medium rounded-lg hover:bg-orange-50 transition-colors">
                  Restrict COD
                </button>
              ) : (
                <button onClick={() => setConfirmAction("cod-on")} className="w-full px-3 py-2 border border-green-200 text-green-600 text-sm font-medium rounded-lg hover:bg-green-50 transition-colors">
                  Allow COD
                </button>
              )}
              {profile.status === "BLOCKED" ? (
                <button onClick={() => setConfirmAction("unblock")} className="w-full px-3 py-2 border border-green-200 text-green-600 text-sm font-medium rounded-lg hover:bg-green-50 transition-colors">
                  Unblock Customer
                </button>
              ) : (
                <button onClick={() => setConfirmAction("block")} className="w-full px-3 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5">
                  <Ban size={14} /> Block Customer
                </button>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-1.5"><MessageSquare size={14} className="text-brand-600" /> Admin Note</h3>
            {detail.adminNote && <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-3">{detail.adminNote}</p>}
            <textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Add a note about this customer..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400 resize-none mb-2"
            />
            <button
              onClick={saveNote}
              disabled={addNoteMutation.isPending || !noteInput.trim()}
              className="w-full py-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {addNoteMutation.isPending && <Loader2 size={14} className="animate-spin" />} Save Note
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmAction}
        title={
          confirmAction === "block" ? "Block this customer?" :
          confirmAction === "unblock" ? "Unblock this customer?" :
          confirmAction === "cod-off" ? "Restrict Cash on Delivery?" :
          "Allow Cash on Delivery?"
        }
        description="You can optionally add a note above before confirming — it will be saved with this action."
        confirmLabel="Confirm"
        danger={confirmAction === "block" || confirmAction === "cod-off"}
        isLoading={setStatusMutation.isPending || setCodMutation.isPending}
        onConfirm={runAction}
        onClose={() => setConfirmAction(null)}
      />
    </div>
  );
}
