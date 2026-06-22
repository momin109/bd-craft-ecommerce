"use client";
import { useState } from "react";
import { Star, Check, EyeOff } from "lucide-react";
import { useAdminReviews, useSetReviewStatus, useHideReview } from "@/hooks/queries/useReviews";
import { ReviewStatus } from "@/types/api/review";
import { formatDate, cn } from "@/lib/utils";
import { LoadingTable } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import StatusBadge from "@/components/ui/StatusBadge";
import { getErrorMessage } from "@/lib/api/client";
import toast from "react-hot-toast";

const FILTERS: { label: string; value?: ReviewStatus }[] = [
  { label: "All" }, { label: "Pending", value: "PENDING" }, { label: "Approved", value: "APPROVED" }, { label: "Hidden", value: "HIDDEN" },
];

export default function ReviewsPage() {
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | undefined>("PENDING");
  const { data: reviews, isLoading, isError, refetch } = useAdminReviews({ status: statusFilter });
  const setStatusMutation = useSetReviewStatus();
  const hideMutation = useHideReview();

  const approve = (id: string) => {
    setStatusMutation.mutate({ reviewId: id, payload: { status: "APPROVED" } }, {
      onSuccess: () => toast.success("Review approved"),
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  };

  const hide = (id: string) => {
    hideMutation.mutate({ reviewId: id, adminNote: "Hidden by admin" }, {
      onSuccess: () => toast.success("Review hidden"),
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex gap-2 mb-5">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => setStatusFilter(f.value)}
            className={cn("px-3.5 py-1.5 text-xs font-medium rounded-full border transition-colors",
              statusFilter === f.value ? "bg-brand-700 text-white border-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300")}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {isLoading && <LoadingTable rows={5} cols={4} />}
        {isError && <div className="p-6"><ErrorState message="Couldn't load reviews." onRetry={() => refetch()} /></div>}
        {!isLoading && !isError && (!reviews || reviews.length === 0) && (
          <div className="p-10"><EmptyState title="No reviews here" description="Reviews matching this filter will show up here." /></div>
        )}
        {!isLoading && !isError && reviews && reviews.length > 0 && (
          <div className="divide-y divide-gray-50">
            {reviews.map((r) => {
              const id = r._id ?? r.id ?? "";
              return (
                <div key={id} className="p-5">
                  <div className="flex items-start justify-between mb-2 gap-3">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        {[1,2,3,4,5].map((s) => <Star key={s} size={13} className={cn(s <= r.rating ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200")} />)}
                        <span className="text-xs text-gray-400 ml-2">{r.userName ?? "Customer"} · {formatDate(r.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-700">{r.comment}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="flex gap-2 mt-3">
                    {r.status !== "APPROVED" && (
                      <button onClick={() => approve(id)} disabled={setStatusMutation.isPending} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-lg hover:bg-green-100 transition-colors disabled:opacity-60">
                        <Check size={13} /> Approve
                      </button>
                    )}
                    {r.status !== "HIDDEN" && (
                      <button onClick={() => hide(id)} disabled={hideMutation.isPending} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-60">
                        <EyeOff size={13} /> Hide
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
