"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

import {
  useOffers,
  useCreateOffer,
  useDeleteOffer,
} from "@/hooks/queries/useOffers";

import { CreateOfferPayload } from "@/types/api/offer";
import { LoadingTable } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { getErrorMessage } from "@/lib/api/client";
import { createEmptyOfferForm } from "@/lib/offers/offerForm.utils";
import OffersTable from "@/components/offers/OffersTable";
import OfferCreateModal from "@/components/offers/OfferCreateModal";

// import OffersTable from "@/components/offers/OffersTable";
// import OfferCreateModal from "@/components/offers/OfferCreateModal";
// import { createEmptyOfferForm } from "@/lib/offers/offerForm.utils";

export default function OffersPage() {
  const { data: offers, isLoading, isError, refetch } = useOffers();

  const createMutation = useCreateOffer();
  const deleteMutation = useDeleteOffer();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CreateOfferPayload>(createEmptyOfferForm());
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    code: string;
  } | null>(null);

  const openCreate = () => {
    setForm(createEmptyOfferForm());
    setError("");
    setModalOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Offer deleted");
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">
            Offers
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {offers?.length ?? 0} offers
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-700 text-white rounded-xl text-sm font-semibold hover:bg-brand-800 transition-colors"
        >
          <Plus size={16} />
          Create Offer
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden overflow-x-auto">
        {isLoading && <LoadingTable rows={5} cols={6} />}

        {isError && (
          <div className="p-6">
            <ErrorState
              message="Couldn't load offers."
              onRetry={() => refetch()}
            />
          </div>
        )}

        {!isLoading && !isError && (!offers || offers.length === 0) && (
          <div className="p-10">
            <EmptyState
              title="No offers yet"
              description="Create a flash sale or bundle deal to drive conversions."
            />
          </div>
        )}

        {!isLoading && !isError && offers && offers.length > 0 && (
          <OffersTable
            offers={offers}
            onDelete={(target) => setDeleteTarget(target)}
          />
        )}
      </div>

      <OfferCreateModal
        open={modalOpen}
        form={form}
        error={error}
        isPending={createMutation.isPending}
        onClose={() => setModalOpen(false)}
        onError={setError}
        onChange={setForm}
        onSubmit={(payload) => {
          createMutation.mutate(payload, {
            onSuccess: () => {
              toast.success("Offer created");
              setModalOpen(false);
            },
            onError: (err) => setError(getErrorMessage(err)),
          });
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this offer?"
        description={
          deleteTarget ? `"${deleteTarget.code}" will be deactivated.` : ""
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
