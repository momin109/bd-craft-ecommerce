"use client";

import Link from "next/link";
import { Flame } from "lucide-react";

import { useActiveOffers } from "@/hooks/queries/useOffers";
import CountdownTimer from "@/components/offers/CountdownTimer";
import OfferProductCard from "@/components/offers/OfferProductCard";

export default function FlashSaleSection() {
  const { data, isLoading, isError } = useActiveOffers();

  const flashOffer = data?.find(
    (offer) =>
      offer.type === "FLASH_SALE" &&
      offer.status === "ACTIVE" &&
      offer.flashSaleItems &&
      offer.flashSaleItems.length > 0,
  );

  if (isLoading) {
    return (
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="h-72 rounded-3xl bg-gray-100 animate-pulse" />
        </div>
      </section>
    );
  }

  if (isError || !flashOffer) {
    return null;
  }

  const activeItems =
    flashOffer.flashSaleItems?.filter((item) => item.status !== "INACTIVE") ??
    [];

  if (activeItems.length === 0) return null;

  return (
    <section className="py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="rounded-3xl bg-gradient-to-br from-orange-50 via-white to-red-50 border border-orange-100 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center">
                  <Flame size={20} />
                </span>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
                    Live Offer
                  </p>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {flashOffer.title}
                  </h2>
                </div>
              </div>

              {flashOffer.description && (
                <p className="text-sm text-gray-500 mt-2 max-w-xl">
                  {flashOffer.description}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:items-end gap-2">
              <p className="text-xs text-gray-500 font-medium">Offer ends in</p>
              <CountdownTimer endDate={flashOffer.endDate} />
            </div>
          </div>

          {flashOffer.bannerImage && (
            <Link href="/offers" className="block mb-6">
              <img
                src={flashOffer.bannerImage}
                alt={flashOffer.title}
                className="w-full h-36 sm:h-48 object-cover rounded-2xl border border-orange-100"
              />
            </Link>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {activeItems.slice(0, 8).map((item, index) => (
              <OfferProductCard
                key={`${String(item.product)}-${item.variantId ?? ""}-${index}`}
                item={item}
              />
            ))}
          </div>

          <div className="flex justify-center mt-7">
            <Link
              href="/offers"
              className="px-6 py-3 rounded-full bg-orange-600 text-white text-sm font-bold hover:bg-orange-700 transition-colors"
            >
              View All Offers
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
