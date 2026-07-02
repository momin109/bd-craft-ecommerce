"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Tag,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { formatPriceBDT } from "@/lib/utils";
import {
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
} from "@/hooks/queries/useCart";
import { useApplyCoupon } from "@/hooks/queries/useCoupon";
import { useAuthContext } from "@/context/AuthContext";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { getErrorMessage } from "@/lib/api/client";

export default function CartPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();

  const { data: cart, isLoading, isError, refetch } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCartMutation = useClearCart();
  const applyCouponMutation = useApplyCoupon();

  const [coupon, setCoupon] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");
  const [couponMessage, setCouponMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const items = cart?.items ?? [];

  const totalItems =
    cart?.totalItems ??
    items.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0);

  const subtotal =
    cart?.subtotal ??
    items.reduce((sum, item) => {
      const unitPrice = Number(item.unitPrice ?? 0);
      const quantity = Number(item.quantity ?? 0);
      const itemTotal = Number(item.itemTotal ?? unitPrice * quantity);

      return sum + itemTotal;
    }, 0);

  const deliveryFee = subtotal >= 1500 ? 0 : 80;

  const safeDiscount = Math.min(appliedDiscount, subtotal);
  const finalTotal = Math.max(0, subtotal - safeDiscount + deliveryFee);

  const applyCoupon = () => {
    const code = coupon.trim();

    if (!code) {
      setCouponMessage({
        type: "error",
        text: "Please enter a coupon code.",
      });
      return;
    }

    applyCouponMutation.mutate(
      { code },
      {
        onSuccess: (res) => {
          const discountAmount = Number(res.discountAmount ?? 0);

          setAppliedDiscount(discountAmount);
          setAppliedCode(code.toUpperCase());
          setCouponMessage({
            type: "success",
            text: `Coupon applied! ${formatPriceBDT(discountAmount)} off`,
          });
        },
        onError: (err) => {
          setAppliedDiscount(0);
          setAppliedCode("");
          setCouponMessage({
            type: "error",
            text: getErrorMessage(err),
          });
        },
      },
    );
  };

  if (authLoading) {
    return <LoadingState label="Loading your bag..." />;
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingBag size={72} className="text-brand-200 mx-auto mb-6" />

        <h1 className="font-serif text-3xl font-bold text-gray-800 mb-3">
          Sign in to view your bag
        </h1>

        <p className="text-gray-400 mb-8">Your cart is saved to your account</p>

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
    return <LoadingState label="Loading your bag..." />;
  }

  if (isError) {
    return (
      <ErrorState
        message="Couldn't load your cart."
        onRetry={() => refetch()}
      />
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingBag size={72} className="text-brand-200 mx-auto mb-6" />

        <h1 className="font-serif text-3xl font-bold text-gray-800 mb-3">
          Your bag is empty
        </h1>

        <p className="text-gray-400 mb-8">
          Add some beautiful pieces to get started
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-700 text-white rounded-xl font-semibold hover:bg-brand-800 transition-colors"
        >
          Continue Shopping <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="font-serif text-3xl font-bold text-gray-900 mb-8">
        Shopping Bag{" "}
        <span className="text-gray-400 font-normal text-xl">
          ({totalItems} items)
        </span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const itemId = item._id;
            const price = Number(item.unitPrice ?? 0);
            const quantity = Number(item.quantity ?? 0);
            const imageSrc = item.image || "";
            const itemTotal = Number(item.itemTotal ?? price * quantity);

            return (
              <div
                key={itemId}
                className="flex gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-brand-200 transition-colors"
              >
                <div className="relative w-24 h-32 rounded-xl overflow-hidden bg-brand-50 shrink-0">
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={item.name || "Product image"}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/products/${item.product}`}
                        className="font-semibold text-gray-800 hover:text-brand-700 transition-colors line-clamp-2"
                      >
                        {item.name}
                      </Link>

                      <p className="text-sm font-semibold text-brand-700 mt-1">
                        {formatPriceBDT(price)}
                      </p>

                      <div className="flex flex-wrap gap-3 mt-1">
                        {item.size && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            Size: {item.size}
                          </span>
                        )}

                        {item.color && (
                          <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {item.colorCode && (
                              <span
                                className="w-2.5 h-2.5 rounded-full border"
                                style={{ background: item.colorCode }}
                              />
                            )}
                            {item.color}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeItem.mutate(itemId, {
                          onError: () => toast.error("Couldn't remove item"),
                        })
                      }
                      disabled={removeItem.isPending}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0 disabled:opacity-50"
                      aria-label="Remove item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() =>
                          updateItem.mutate({
                            cartItemId: itemId,
                            quantity: Math.max(1, quantity - 1),
                          })
                        }
                        disabled={updateItem.isPending || quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>

                      <span className="w-10 text-center text-sm font-medium">
                        {quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateItem.mutate({
                            cartItemId: itemId,
                            quantity: quantity + 1,
                          })
                        }
                        disabled={updateItem.isPending}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-brand-700">
                        {formatPriceBDT(itemTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() =>
                clearCartMutation.mutate(undefined, {
                  onError: () => toast.error("Couldn't clear cart"),
                })
              }
              disabled={clearCartMutation.isPending}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <Trash2 size={12} /> Clear Cart
            </button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 sticky top-24">
            <h2 className="font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-100">
              Order Summary
            </h2>

            <div className="mb-5">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Tag size={14} className="text-brand-500" /> Have a coupon?
              </label>

              <div className="flex gap-2">
                <input
                  value={coupon}
                  onChange={(e) => {
                    setCoupon(e.target.value);
                    setCouponMessage(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      applyCoupon();
                    }
                  }}
                  placeholder="Enter code"
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-brand-300"
                />

                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={applyCouponMutation.isPending}
                  className="px-4 py-2 bg-brand-100 text-brand-700 rounded-lg text-sm font-medium hover:bg-brand-200 transition-colors disabled:opacity-60"
                >
                  {applyCouponMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Apply"
                  )}
                </button>
              </div>

              {couponMessage && (
                <p
                  className={`text-xs mt-1.5 ${
                    couponMessage.type === "success"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {couponMessage.text}
                </p>
              )}
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({totalItems} items)</span>
                <span>{formatPriceBDT(subtotal)}</span>
              </div>

              {safeDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount ({appliedCode})</span>
                  <span>-{formatPriceBDT(safeDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span
                  className={
                    deliveryFee === 0 ? "text-green-600 font-medium" : ""
                  }
                >
                  {deliveryFee === 0 ? "FREE" : formatPriceBDT(deliveryFee)}
                </span>
              </div>

              {subtotal < 1500 && (
                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                  Add {formatPriceBDT(1500 - subtotal)} more for free delivery!
                </p>
              )}
            </div>

            <div className="flex justify-between font-bold text-gray-900 pt-4 mt-3 border-t border-gray-100">
              <span>Total</span>
              <span className="text-brand-700 text-lg">
                {formatPriceBDT(finalTotal)}
              </span>
            </div>

            <Link
              href={
                appliedCode
                  ? `/checkout?coupon=${encodeURIComponent(appliedCode)}`
                  : "/checkout"
              }
              className="w-full mt-5 flex items-center justify-center gap-2 py-3.5 bg-brand-700 hover:bg-brand-800 text-white font-semibold rounded-xl transition-all hover:shadow-lg"
            >
              Proceed to Checkout <ArrowRight size={16} />
            </Link>

            <div className="mt-4 flex items-center justify-center gap-4">
              {["bKash", "Nagad", "Rocket", "VISA"].map((p) => (
                <span
                  key={p}
                  className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// "use client";
// import Image from "next/image";
// import Link from "next/link";
// import {
//   Trash2,
//   Plus,
//   Minus,
//   ShoppingBag,
//   Tag,
//   ArrowRight,
//   Loader2,
// } from "lucide-react";
// import { formatPriceBDT } from "@/lib/utils";
// import { useState } from "react";
// import {
//   useCart,
//   useUpdateCartItem,
//   useRemoveCartItem,
//   useClearCart,
// } from "@/hooks/queries/useCart";
// import { useApplyCoupon } from "@/hooks/queries/useCoupon";
// import { useAuthContext } from "@/context/AuthContext";
// import { LoadingState } from "@/components/shared/LoadingState";
// import { ErrorState } from "@/components/shared/ErrorState";
// import { getErrorMessage } from "@/lib/api/client";
// import { getCartItemId } from "@/types/api/cart";
// import toast from "react-hot-toast";

// export default function CartPage() {
//   const { isAuthenticated, isLoading: authLoading } = useAuthContext();
//   const { data: cart, isLoading, isError, refetch } = useCart();
//   const updateItem = useUpdateCartItem();
//   const removeItem = useRemoveCartItem();
//   const clearCartMutation = useClearCart();
//   const applyCouponMutation = useApplyCoupon();

//   const [coupon, setCoupon] = useState("");
//   const [appliedDiscount, setAppliedDiscount] = useState(0);
//   const [appliedCode, setAppliedCode] = useState("");
//   const [couponMessage, setCouponMessage] = useState<{
//     type: "success" | "error";
//     text: string;
//   } | null>(null);

//   const items = cart?.items ?? [];
//   // Backend computes subtotal server-side from variant.sellingPrice * quantity;
//   // fall back to a client-side sum if the cart payload omits it.
//   const subtotal =
//     cart?.subtotal ??
//     items.reduce(
//       (sum, i) => sum + (i.variant?.sellingPrice ?? 0) * i.quantity,
//       0,
//     );
//   const deliveryFee = subtotal >= 1500 ? 0 : 80;
//   const finalTotal = subtotal - appliedDiscount + deliveryFee;

//   const applyCoupon = () => {
//     if (!coupon.trim()) return;
//     applyCouponMutation.mutate(
//       { code: coupon.trim() },
//       {
//         onSuccess: (res) => {
//           setAppliedDiscount(res.discountAmount ?? 0);
//           setAppliedCode(coupon.trim().toUpperCase());
//           setCouponMessage({
//             type: "success",
//             text: `Coupon applied! ৳${res.discountAmount} off`,
//           });
//         },
//         onError: (err) => {
//           setAppliedDiscount(0);
//           setAppliedCode("");
//           setCouponMessage({ type: "error", text: getErrorMessage(err) });
//         },
//       },
//     );
//   };

//   if (authLoading) return <LoadingState label="Loading your bag..." />;

//   if (!isAuthenticated) {
//     return (
//       <div className="max-w-2xl mx-auto px-4 py-24 text-center">
//         <ShoppingBag size={72} className="text-brand-200 mx-auto mb-6" />
//         <h1 className="font-serif text-3xl font-bold text-gray-800 mb-3">
//           Sign in to view your bag
//         </h1>
//         <p className="text-gray-400 mb-8">Your cart is saved to your account</p>
//         <Link
//           href="/login"
//           className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-700 text-white rounded-xl font-semibold hover:bg-brand-800 transition-colors"
//         >
//           Sign In <ArrowRight size={16} />
//         </Link>
//       </div>
//     );
//   }

//   if (isLoading) return <LoadingState label="Loading your bag..." />;
//   if (isError)
//     return (
//       <ErrorState
//         message="Couldn't load your cart."
//         onRetry={() => refetch()}
//       />
//     );

//   if (items.length === 0) {
//     return (
//       <div className="max-w-2xl mx-auto px-4 py-24 text-center">
//         <ShoppingBag size={72} className="text-brand-200 mx-auto mb-6" />
//         <h1 className="font-serif text-3xl font-bold text-gray-800 mb-3">
//           Your bag is empty
//         </h1>
//         <p className="text-gray-400 mb-8">
//           Add some beautiful pieces to get started
//         </p>
//         <Link
//           href="/"
//           className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-700 text-white rounded-xl font-semibold hover:bg-brand-800 transition-colors"
//         >
//           Continue Shopping <ArrowRight size={16} />
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-10">
//       <h1 className="font-serif text-3xl font-bold text-gray-900 mb-8">
//         Shopping Bag{" "}
//         <span className="text-gray-400 font-normal text-xl">
//           ({items.length} items)
//         </span>
//       </h1>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         <div className="lg:col-span-2 space-y-4">
//           {items.map((item) => {
//             const itemId = getCartItemId(item);
//             const price = item.variant?.sellingPrice ?? 0;
//             return (
//               <div
//                 key={itemId}
//                 className="flex gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-brand-200 transition-colors"
//               >
//                 <div className="relative w-24 h-32 rounded-xl overflow-hidden bg-brand-50 shrink-0">
//                   {item.product?.images?.[0] && (
//                     <Image
//                       src={item.product.images[0]}
//                       alt={item.product.name}
//                       fill
//                       sizes="96px"
//                       className="object-cover"
//                     />
//                   )}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-start justify-between gap-2">
//                     <div>
//                       <Link
//                         href={`/products/${item.product?.slug}`}
//                         className="font-semibold text-gray-800 hover:text-brand-700 transition-colors line-clamp-2"
//                       >
//                         {item.product?.name}
//                       </Link>
//                       <div className="flex gap-3 mt-1">
//                         {item.variant?.size && (
//                           <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
//                             Size: {item.variant.size}
//                           </span>
//                         )}
//                         {item.variant?.color && (
//                           <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
//                             {item.variant.colorCode && (
//                               <span
//                                 className="w-2.5 h-2.5 rounded-full border"
//                                 style={{ background: item.variant.colorCode }}
//                               />
//                             )}
//                             {item.variant.color}
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                     <button
//                       onClick={() =>
//                         removeItem.mutate(itemId, {
//                           onError: () => toast.error("Couldn't remove item"),
//                         })
//                       }
//                       disabled={removeItem.isPending}
//                       className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
//                     >
//                       <Trash2 size={15} />
//                     </button>
//                   </div>

//                   <div className="flex items-center justify-between mt-4">
//                     <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
//                       <button
//                         onClick={() =>
//                           updateItem.mutate({
//                             cartItemId: itemId,
//                             quantity: Math.max(1, item.quantity - 1),
//                           })
//                         }
//                         className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors"
//                       >
//                         <Minus size={13} />
//                       </button>
//                       <span className="w-10 text-center text-sm font-medium">
//                         {item.quantity}
//                       </span>
//                       <button
//                         onClick={() =>
//                           updateItem.mutate({
//                             cartItemId: itemId,
//                             quantity: item.quantity + 1,
//                           })
//                         }
//                         className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors"
//                       >
//                         <Plus size={13} />
//                       </button>
//                     </div>
//                     <div className="text-right">
//                       <span className="font-bold text-brand-700">
//                         {formatPriceBDT(price * item.quantity)}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}

//           <div className="flex justify-end">
//             <button
//               onClick={() =>
//                 clearCartMutation.mutate(undefined, {
//                   onError: () => toast.error("Couldn't clear cart"),
//                 })
//               }
//               className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
//             >
//               <Trash2 size={12} /> Clear Cart
//             </button>
//           </div>
//         </div>

//         <div className="lg:col-span-1">
//           <div className="bg-white border border-gray-100 rounded-2xl p-5 sticky top-24">
//             <h2 className="font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-100">
//               Order Summary
//             </h2>

//             <div className="mb-5">
//               <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
//                 <Tag size={14} className="text-brand-500" /> Have a coupon?
//               </label>
//               <div className="flex gap-2">
//                 <input
//                   value={coupon}
//                   onChange={(e) => {
//                     setCoupon(e.target.value);
//                     setCouponMessage(null);
//                   }}
//                   placeholder="Enter code"
//                   className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-brand-300"
//                 />
//                 <button
//                   onClick={applyCoupon}
//                   disabled={applyCouponMutation.isPending}
//                   className="px-4 py-2 bg-brand-100 text-brand-700 rounded-lg text-sm font-medium hover:bg-brand-200 transition-colors disabled:opacity-60"
//                 >
//                   {applyCouponMutation.isPending ? (
//                     <Loader2 size={14} className="animate-spin" />
//                   ) : (
//                     "Apply"
//                   )}
//                 </button>
//               </div>
//               {couponMessage && (
//                 <p
//                   className={`text-xs mt-1.5 ${couponMessage.type === "success" ? "text-green-600" : "text-red-500"}`}
//                 >
//                   {couponMessage.text}
//                 </p>
//               )}
//             </div>

//             <div className="space-y-2.5 text-sm">
//               <div className="flex justify-between text-gray-600">
//                 <span>Subtotal ({items.length} items)</span>
//                 <span>{formatPriceBDT(subtotal)}</span>
//               </div>
//               {appliedDiscount > 0 && (
//                 <div className="flex justify-between text-green-600">
//                   <span>Coupon Discount ({appliedCode})</span>
//                   <span>-{formatPriceBDT(appliedDiscount)}</span>
//                 </div>
//               )}
//               <div className="flex justify-between text-gray-600">
//                 <span>Delivery Fee</span>
//                 <span
//                   className={
//                     deliveryFee === 0 ? "text-green-600 font-medium" : ""
//                   }
//                 >
//                   {deliveryFee === 0 ? "FREE" : formatPriceBDT(deliveryFee)}
//                 </span>
//               </div>
//               {subtotal < 1500 && (
//                 <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
//                   Add {formatPriceBDT(1500 - subtotal)} more for free delivery!
//                 </p>
//               )}
//             </div>

//             <div className="flex justify-between font-bold text-gray-900 pt-4 mt-3 border-t border-gray-100">
//               <span>Total</span>
//               <span className="text-brand-700 text-lg">
//                 {formatPriceBDT(finalTotal)}
//               </span>
//             </div>

//             <Link
//               href={
//                 appliedCode
//                   ? `/checkout?coupon=${encodeURIComponent(appliedCode)}`
//                   : "/checkout"
//               }
//               className="w-full mt-5 flex items-center justify-center gap-2 py-3.5 bg-brand-700 hover:bg-brand-800 text-white font-semibold rounded-xl transition-all hover:shadow-lg"
//             >
//               Proceed to Checkout <ArrowRight size={16} />
//             </Link>

//             <div className="mt-4 flex items-center justify-center gap-4">
//               {["bKash", "Nagad", "Rocket", "VISA"].map((p) => (
//                 <span
//                   key={p}
//                   className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100"
//                 >
//                   {p}
//                 </span>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
