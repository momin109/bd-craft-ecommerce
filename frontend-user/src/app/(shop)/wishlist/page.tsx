"use client";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { formatPriceBDT } from "@/lib/utils";
import { useWishlist, useToggleWishlist } from "@/hooks/queries/useWishlist";
import { useAddToCart } from "@/hooks/queries/useCart";
import { useAuthContext } from "@/context/AuthContext";
import { useAppDispatch } from "@/hooks/redux";
import { toggleCart } from "@/store/slices/cartSlice";
import { LoadingGrid } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import {
  getProductId,
  getVariantId,
  getProductDisplayPrice,
} from "@/types/api/product";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const { data: items, isLoading, isError, refetch } = useWishlist();
  const toggleWishlistMutation = useToggleWishlist();
  const addToCartMutation = useAddToCart();
  const dispatch = useAppDispatch();

  if (authLoading) return <LoadingGrid count={4} />;

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <Heart size={72} className="text-brand-200 mx-auto mb-6" />
        <h1 className="font-serif text-3xl font-bold text-gray-800 mb-3">
          Sign in to view your wishlist
        </h1>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-700 text-white rounded-xl font-semibold hover:bg-brand-800 transition-colors"
        >
          Sign In <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <LoadingGrid count={8} />
      </div>
    );
  }
  if (isError)
    return (
      <ErrorState
        message="Couldn't load your wishlist."
        onRetry={() => refetch()}
      />
    );

  if (!items || items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <Heart size={72} className="text-brand-200 mx-auto mb-6" />
        <h1 className="font-serif text-3xl font-bold text-gray-800 mb-3">
          Your wishlist is empty
        </h1>
        <p className="text-gray-400 mb-8">
          Save your favourite pieces here and revisit them anytime
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-700 text-white rounded-xl font-semibold hover:bg-brand-800 transition-colors"
        >
          Start Exploring <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl font-bold text-gray-900">
          My Wishlist{" "}
          <span className="text-gray-400 font-normal text-xl">
            ({items.length})
          </span>
        </h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {items.map((product) => {
          const productId = getProductId(product);
          const { price } = getProductDisplayPrice(product);
          const firstAvailableVariant =
            (product.variants ?? []).find((v) => v.stock > 0) ??
            product.variants?.[0];
          return (
            <div
              key={productId}
              className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-brand-200 hover:shadow-md transition-all duration-300"
            >
              <Link href={`/products/${product.slug}`}>
                <div className="relative aspect-[3/4] overflow-hidden bg-brand-50">
                  {product.images?.[0] && (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
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
                  <span className="font-bold text-brand-700 text-sm">
                    {formatPriceBDT(price)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (!firstAvailableVariant) {
                        toast.error("No purchasable variant for this product");
                        return;
                      }
                      addToCartMutation.mutate(
                        {
                          productId,
                          variantId: getVariantId(firstAvailableVariant),
                          quantity: 1,
                        },
                        {
                          onSuccess: () => dispatch(toggleCart()),
                          onError: () => toast.error("Couldn't add to bag"),
                        },
                      );
                    }}
                    disabled={addToCartMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60"
                  >
                    {addToCartMutation.isPending ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <>
                        <ShoppingBag size={12} /> Add to Bag
                      </>
                    )}
                  </button>
                  <button
                    onClick={() =>
                      toggleWishlistMutation.mutate({
                        productId,
                        isWishlisted: true,
                      })
                    }
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
// "use client";
// import Image from "next/image";
// import Link from "next/link";
// import { Heart, ShoppingBag, Trash2, ArrowRight, Loader2 } from "lucide-react";
// import { formatPriceBDT } from "@/lib/utils";
// import { useWishlist, useToggleWishlist } from "@/hooks/queries/useWishlist";
// import { useAddToCart } from "@/hooks/queries/useCart";
// import { useAuthContext } from "@/context/AuthContext";
// import { useAppDispatch } from "@/hooks/redux";
// import { toggleCart } from "@/store/slices/cartSlice";
// import { LoadingGrid } from "@/components/shared/LoadingState";
// import { ErrorState } from "@/components/shared/ErrorState";
// import { getProductId, getVariantId, getProductDisplayPrice } from "@/types/api/product";
// import toast from "react-hot-toast";

// export default function WishlistPage() {
//   const { isAuthenticated, isLoading: authLoading } = useAuthContext();
//   const { data: items, isLoading, isError, refetch } = useWishlist();
//   const toggleWishlistMutation = useToggleWishlist();
//   const addToCartMutation = useAddToCart();
//   const dispatch = useAppDispatch();

//   if (authLoading) return <LoadingGrid count={4} />;

//   if (!isAuthenticated) {
//     return (
//       <div className="max-w-2xl mx-auto px-4 py-24 text-center">
//         <Heart size={72} className="text-brand-200 mx-auto mb-6" />
//         <h1 className="font-serif text-3xl font-bold text-gray-800 mb-3">Sign in to view your wishlist</h1>
//         <Link href="/login" className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-700 text-white rounded-xl font-semibold hover:bg-brand-800 transition-colors">
//           Sign In <ArrowRight size={16} />
//         </Link>
//       </div>
//     );
//   }

//   if (isLoading) {
//     return <div className="max-w-7xl mx-auto px-4 py-10"><LoadingGrid count={8} /></div>;
//   }
//   if (isError) return <ErrorState message="Couldn't load your wishlist." onRetry={() => refetch()} />;

//   if (!items || items.length === 0) {
//     return (
//       <div className="max-w-2xl mx-auto px-4 py-24 text-center">
//         <Heart size={72} className="text-brand-200 mx-auto mb-6" />
//         <h1 className="font-serif text-3xl font-bold text-gray-800 mb-3">Your wishlist is empty</h1>
//         <p className="text-gray-400 mb-8">Save your favourite pieces here and revisit them anytime</p>
//         <Link href="/" className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-700 text-white rounded-xl font-semibold hover:bg-brand-800 transition-colors">
//           Start Exploring <ArrowRight size={16} />
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-10">
//       <div className="flex items-center justify-between mb-8">
//         <h1 className="font-serif text-3xl font-bold text-gray-900">
//           My Wishlist <span className="text-gray-400 font-normal text-xl">({items.length})</span>
//         </h1>
//       </div>

//       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
//         {items.map((product) => {
//           const productId = getProductId(product);
//           const { price } = getProductDisplayPrice(product);
//           const firstAvailableVariant = (product.variants ?? []).find((v) => v.stock > 0) ?? product.variants?.[0];
//           return (
//             <div key={productId} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-brand-200 hover:shadow-md transition-all duration-300">
//               <Link href={`/products/${product.slug}`}>
//                 <div className="relative aspect-[3/4] overflow-hidden bg-brand-50">
//                   {product.images?.[0] && (
//                     <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
//                   )}
//                 </div>
//               </Link>
//               <div className="p-3.5">
//                 <Link href={`/products/${product.slug}`}>
//                   <h3 className="font-medium text-sm text-gray-800 truncate hover:text-brand-700 transition-colors mb-1.5">{product.name}</h3>
//                 </Link>
//                 <div className="flex items-center gap-2 mb-3.5">
//                   <span className="font-bold text-brand-700 text-sm">{formatPriceBDT(price)}</span>
//                 </div>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => {
//                       if (!firstAvailableVariant) { toast.error("No purchasable variant for this product"); return; }
//                       addToCartMutation.mutate({ productId, variantId: getVariantId(firstAvailableVariant), quantity: 1 }, {
//                         onSuccess: () => dispatch(toggleCart()),
//                         onError: () => toast.error("Couldn't add to bag"),
//                       });
//                     }}
//                     disabled={addToCartMutation.isPending}
//                     className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60"
//                   >
//                     {addToCartMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <><ShoppingBag size={12} /> Add to Bag</>}
//                   </button>
//                   <button
//                     onClick={() => toggleWishlistMutation.mutate({ productId, isWishlisted: true })}
//                     className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:border-red-200 hover:bg-red-50 hover:text-red-500 text-gray-400 transition-all"
//                   >
//                     <Trash2 size={13} />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }
