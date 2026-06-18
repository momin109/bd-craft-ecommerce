"use client";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { selectWishlistItems, removeFromWishlist } from "@/store/slices/wishlistSlice";
import { addToCart, toggleCart } from "@/store/slices/cartSlice";
import { formatPriceBDT, calculateDiscount } from "@/lib/utils";

export default function WishlistPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectWishlistItems);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <Heart size={72} className="text-brand-200 mx-auto mb-6" />
        <h1 className="font-serif text-3xl font-bold text-gray-800 mb-3">Your wishlist is empty</h1>
        <p className="text-gray-400 mb-8">Save your favourite pieces here and revisit them anytime</p>
        <Link href="/" className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-700 text-white rounded-xl font-semibold hover:bg-brand-800 transition-colors">
          Start Exploring <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl font-bold text-gray-900">
          My Wishlist <span className="text-gray-400 font-normal text-xl">({items.length})</span>
        </h1>
        <button
          onClick={() => items.forEach((p) => dispatch(removeFromWishlist(p.id)))}
          className="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
        >
          <Trash2 size={14} /> Clear All
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {items.map((product) => {
          const discount = product.originalPrice ? calculateDiscount(product.originalPrice, product.price) : 0;
          return (
            <div key={product.id} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-brand-200 hover:shadow-md transition-all duration-300">
              <Link href={`/products/${product.slug}`}>
                <div className="relative aspect-[3/4] overflow-hidden bg-brand-50">
                  <Image src={product.images[0]} alt={product.name} fill
            sizes="(max-width: 640px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  {discount > 0 && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded">
                      -{discount}%
                    </span>
                  )}
                </div>
              </Link>
              <div className="p-3.5">
                <Link href={`/products/${product.slug}`}>
                  <h3 className="font-medium text-sm text-gray-800 truncate hover:text-brand-700 transition-colors mb-1.5">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 mb-3.5">
                  <span className="font-bold text-brand-700 text-sm">{formatPriceBDT(product.price)}</span>
                  {product.originalPrice && (
                    <span className="text-xs text-gray-400 line-through">{formatPriceBDT(product.originalPrice)}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { dispatch(addToCart({ product })); dispatch(toggleCart()); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    <ShoppingBag size={12} /> Add to Bag
                  </button>
                  <button
                    onClick={() => dispatch(removeFromWishlist(product.id))}
                    className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:border-red-200 hover:bg-red-50 hover:text-red-500 text-gray-400 transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
