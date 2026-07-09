"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart } from "lucide-react";

import { FlashSaleItem, OfferProductLite } from "@/types/api/offer";
import StockProgress from "@/components/offers/StockProgress";

type Props = {
  item: FlashSaleItem;
};

function getProduct(product: string | OfferProductLite) {
  if (typeof product === "string") return null;
  return product;
}

function getProductId(product: string | OfferProductLite) {
  if (typeof product === "string") return product;
  return product._id ?? product.id ?? "";
}

function formatPrice(price?: number) {
  return `৳${Number(price ?? 0).toLocaleString("en-BD")}`;
}

export default function OfferProductCard({ item }: Props) {
  const product = getProduct(item.product);
  const productId = getProductId(item.product);

  const name = product?.name ?? "Offer Product";
  const image = product?.images?.[0] ?? "/placeholder-product.png";

  const regularPrice =
    item.regularPrice ??
    product?.baseSellingPrice ??
    product?.sellingPrice ??
    item.flashPrice;

  const discountPercent =
    regularPrice > item.flashPrice
      ? Math.round(((regularPrice - item.flashPrice) / regularPrice) * 100)
      : 0;

  const href = product?.slug
    ? `/products/${product.slug}`
    : `/products/${productId}`;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden">
        <Link href={href}>
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {discountPercent > 0 && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-red-600 text-white text-[11px] font-bold">
            -{discountPercent}% OFF
          </span>
        )}

        <button
          type="button"
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 text-gray-600 flex items-center justify-center shadow-sm hover:text-red-500 transition-colors"
        >
          <Heart size={16} />
        </button>
      </div>

      <div className="p-4">
        <Link href={href}>
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-brand-700 transition-colors">
            {name}
          </h3>
        </Link>

        <div className="mt-2 flex items-end gap-2">
          <p className="text-lg font-bold text-gray-900">
            {formatPrice(item.flashPrice)}
          </p>

          {regularPrice > item.flashPrice && (
            <p className="text-xs text-gray-400 line-through mb-0.5">
              {formatPrice(regularPrice)}
            </p>
          )}
        </div>

        {regularPrice > item.flashPrice && (
          <p className="text-xs text-green-600 font-medium mt-0.5">
            Save {formatPrice(regularPrice - item.flashPrice)}
          </p>
        )}

        <StockProgress
          stockLimit={item.stockLimit}
          soldCount={item.soldCount}
        />

        <Link
          href={href}
          className="mt-4 w-full h-10 rounded-xl bg-gray-900 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-brand-700 transition-colors"
        >
          <ShoppingCart size={15} />
          View Deal
        </Link>
      </div>
    </div>
  );
}
