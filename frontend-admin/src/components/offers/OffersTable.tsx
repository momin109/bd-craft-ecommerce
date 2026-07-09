"use client";

import { ImagePlus, Trash2 } from "lucide-react";

import { ApiOffer } from "@/types/api/offer";
import { formatDate } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";

type Props = {
  offers: ApiOffer[];
  onDelete: (target: { id: string; code: string }) => void;
};

export default function OffersTable({ offers, onDelete }: Props) {
  return (
    <table className="w-full text-sm min-w-[850px]">
      <thead>
        <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
          <th className="px-5 py-3 font-medium">Offer</th>
          <th className="px-5 py-3 font-medium">Type</th>
          <th className="px-5 py-3 font-medium">Priority</th>
          <th className="px-5 py-3 font-medium">Valid Until</th>
          <th className="px-5 py-3 font-medium">Status</th>
          <th className="px-5 py-3 font-medium text-right">Actions</th>
        </tr>
      </thead>

      <tbody>
        {offers.map((offer) => {
          const id = offer._id ?? offer.id ?? "";

          return (
            <tr key={id} className="border-b border-gray-50 hover:bg-gray-25">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  {offer.bannerImage ? (
                    <img
                      src={offer.bannerImage}
                      alt={offer.title}
                      className="w-12 h-12 object-cover rounded-xl border border-gray-100"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center text-gray-300">
                      <ImagePlus size={18} />
                    </div>
                  )}

                  <div>
                    <p className="font-semibold text-gray-800">{offer.code}</p>
                    <p className="text-xs text-gray-400">{offer.title}</p>
                  </div>
                </div>
              </td>

              <td className="px-5 py-3 text-gray-600">
                {offer.type === "FLASH_SALE"
                  ? `Flash Sale (${offer.flashSaleItems?.length ?? 0} items)`
                  : `Bundle (${offer.bundle?.items?.length ?? 0} items)`}
              </td>

              <td className="px-5 py-3 text-gray-500">{offer.priority ?? 0}</td>

              <td className="px-5 py-3 text-gray-500">
                {formatDate(offer.endDate)}
              </td>

              <td className="px-5 py-3">
                <StatusBadge status={offer.status as any} />
              </td>

              <td className="px-5 py-3 text-right">
                <button
                  onClick={() => onDelete({ id, code: offer.code })}
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
  );
}
