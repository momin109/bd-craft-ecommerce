"use client";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { Product } from "@/types";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { addToCart, toggleCart } from "@/store/slices/cartSlice";
import { toggleWishlist, selectIsWishlisted } from "@/store/slices/wishlistSlice";
import { formatPriceBDT, calculateDiscount, cn } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props { product: Product; }

export default function ProductCard({ product }: Props) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isWishlisted = useAppSelector(selectIsWishlisted(product.id));
  const [hovered, setHovered] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    dispatch(addToCart({ product }));
    dispatch(toggleCart());
    setTimeout(() => setAdding(false), 1000);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist(product));
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/products/${product.slug}`);
  };

  const discount = product.originalPrice ? calculateDiscount(product.originalPrice, product.price) : 0;

  return (
    <div
      className="group relative bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-brand-200 hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Wishlist button - outside Link */}
      <button
        onClick={handleWishlist}
        className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-all"
      >
        <Heart
          size={15}
          className={cn("transition-colors", isWishlisted ? "fill-red-500 text-red-500" : "text-gray-500")}
        />
      </button>

      <Link href={`/products/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-brand-50">
          <Image
            src={product.images[hovered && product.images[1] ? 1 : 0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-all duration-500 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {discount > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded">
                -{discount}%
              </span>
            )}
            {product.isNew && (
              <span className="px-2 py-0.5 bg-brand-600 text-white text-[10px] font-bold rounded">NEW</span>
            )}
            {product.isBestseller && (
              <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded">BESTSELLER</span>
            )}
          </div>

          {/* Hover actions — no nested <a>, use buttons only */}
          <div className={cn(
            "absolute inset-x-0 bottom-0 p-3 flex gap-2 transition-all duration-300 z-10",
            hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          )}>
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white/95 hover:bg-brand-700 hover:text-white text-brand-800 text-xs font-semibold rounded-lg transition-colors shadow-md backdrop-blur-sm"
            >
              <ShoppingBag size={13} />
              {adding ? "Added ✓" : "Add to Bag"}
            </button>
            {/* Quick view — button, not Link, to avoid nested <a> */}
            <button
              onClick={handleQuickView}
              className="w-9 h-9 flex items-center justify-center bg-white/95 hover:bg-brand-100 rounded-lg shadow-md text-brand-700 text-xs font-bold"
              title="Quick View"
            >
              👁
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3.5">
          {/* Color swatches */}
          {product.variants.colors && product.variants.colors.length > 0 && (
            <div className="flex gap-1 mb-2">
              {product.variants.colors.slice(0, 4).map((color) => (
                <span
                  key={color.name}
                  className="w-3.5 h-3.5 rounded-full border border-gray-200"
                  style={{ background: color.hex }}
                  title={color.name}
                />
              ))}
              {product.variants.colors.length > 4 && (
                <span className="text-[10px] text-gray-400 self-center">+{product.variants.colors.length - 4}</span>
              )}
            </div>
          )}

          <h3 className="font-medium text-sm text-gray-800 truncate group-hover:text-brand-700 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center justify-between mt-1.5">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-brand-700">{formatPriceBDT(product.price)}</span>
              {product.originalPrice && (
                <span className="text-xs text-gray-400 line-through">{formatPriceBDT(product.originalPrice)}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Star size={11} className="text-amber-400 fill-amber-400" />
              <span className="text-xs text-gray-500">{product.rating}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
