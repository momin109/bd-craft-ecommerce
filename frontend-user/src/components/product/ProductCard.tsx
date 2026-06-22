"use client";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star, Loader2 } from "lucide-react";
import {
  ApiProduct, getProductId, getVariantId, getProductDisplayPrice, getProductTotalStock,
} from "@/types/api/product";
import { formatPriceBDT, cn } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAddToCart } from "@/hooks/queries/useCart";
import { useToggleWishlist, useWishlistCheck } from "@/hooks/queries/useWishlist";
import { useAppDispatch } from "@/hooks/redux";
import { toggleCart } from "@/store/slices/cartSlice";
import { useAuthContext } from "@/context/AuthContext";
import toast from "react-hot-toast";

interface Props { product: ApiProduct; }

export default function ProductCard({ product }: Props) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuthContext();
  const [hovered, setHovered] = useState(false);

  const productId = getProductId(product);
  const { data: wishlistStatus } = useWishlistCheck(productId);
  const isWishlisted = !!wishlistStatus?.wishlisted;

  const addToCartMutation = useAddToCart();
  const toggleWishlistMutation = useToggleWishlist();

  // Pick the first in-stock variant for the quick "Add to Bag" action on the card.
  // Full size/color selection happens on the product detail page.
  const firstAvailableVariant = (product.variants ?? []).find((v) => v.stock > 0) ?? product.variants?.[0];
  const totalStock = getProductTotalStock(product);
  const { price, originalPrice } = getProductDisplayPrice(product);
  const discount = originalPrice && originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { router.push("/login"); return; }
    if (!firstAvailableVariant) { toast.error("This product has no purchasable variant."); return; }
    addToCartMutation.mutate(
      { productId, variantId: getVariantId(firstAvailableVariant), quantity: 1 },
      {
        onSuccess: () => dispatch(toggleCart()),
        onError: () => toast.error("Couldn't add to bag. Try again."),
      }
    );
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { router.push("/login"); return; }
    toggleWishlistMutation.mutate({ productId, isWishlisted });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/products/${product.slug}`);
  };

  const images = product.images?.length ? product.images : ["/placeholder.jpg"];
  const colorSwatches = [...new Set((product.variants ?? []).map((v) => v.color).filter(Boolean))].slice(0, 4) as string[];
  const colorHexMap = new Map((product.variants ?? []).map((v) => [v.color, v.colorCode] as const));

  return (
    <div
      className="group relative bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-brand-200 hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={handleWishlist}
        disabled={toggleWishlistMutation.isPending}
        className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-all"
      >
        {toggleWishlistMutation.isPending ? (
          <Loader2 size={13} className="animate-spin text-gray-400" />
        ) : (
          <Heart size={15} className={cn("transition-colors", isWishlisted ? "fill-red-500 text-red-500" : "text-gray-500")} />
        )}
      </button>

      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-brand-50">
          <Image
            src={images[hovered && images[1] ? 1 : 0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-all duration-500 group-hover:scale-105"
          />

          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {discount > 0 && <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded">-{discount}%</span>}
            {product.isNew && <span className="px-2 py-0.5 bg-brand-600 text-white text-[10px] font-bold rounded">NEW</span>}
            {product.isBestseller && <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded">BESTSELLER</span>}
          </div>

          <div className={cn(
            "absolute inset-x-0 bottom-0 p-3 flex gap-2 transition-all duration-300 z-10",
            hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          )}>
            <button
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending || totalStock === 0}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white/95 hover:bg-brand-700 hover:text-white text-brand-800 text-xs font-semibold rounded-lg transition-colors shadow-md backdrop-blur-sm disabled:opacity-60"
            >
              {addToCartMutation.isPending ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <>
                  <ShoppingBag size={13} />
                  {totalStock === 0 ? "Out of Stock" : "Add to Bag"}
                </>
              )}
            </button>
            <button
              onClick={handleQuickView}
              className="w-9 h-9 flex items-center justify-center bg-white/95 hover:bg-brand-100 rounded-lg shadow-md text-brand-700 text-xs font-bold"
              title="Quick View"
            >
              👁
            </button>
          </div>
        </div>

        <div className="p-3.5">
          {colorSwatches.length > 0 && (
            <div className="flex gap-1 mb-2">
              {colorSwatches.map((color) => (
                <span key={color} className="w-3.5 h-3.5 rounded-full border border-gray-200" style={{ background: colorHexMap.get(color) || "#ccc" }} title={color} />
              ))}
            </div>
          )}

          <h3 className="font-medium text-sm text-gray-800 truncate group-hover:text-brand-700 transition-colors">{product.name}</h3>

          <div className="flex items-center justify-between mt-1.5">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-brand-700">{formatPriceBDT(price)}</span>
            </div>
            {!!product.averageRating && (
              <div className="flex items-center gap-1">
                <Star size={11} className="text-amber-400 fill-amber-400" />
                <span className="text-xs text-gray-500">{product.averageRating}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
