"use client";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { selectCartOpen, setCartOpen } from "@/store/slices/cartSlice";
import { useCart, useRemoveCartItem, useUpdateCartItem } from "@/hooks/queries/useCart";
import { useAuthContext } from "@/context/AuthContext";
import { formatPriceBDT } from "@/lib/utils";
import { getCartItemId } from "@/types/api/cart";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CartDrawer() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectCartOpen);
  const { isAuthenticated } = useAuthContext();
  const { data: cart, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  if (!isOpen) return null;

  const items = cart?.items ?? [];
  const total = cart?.subtotal ?? items.reduce((sum, i) => sum + (i.variant?.sellingPrice ?? 0) * i.quantity, 0);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={() => dispatch(setCartOpen(false))} />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-brand-700" />
            <span className="font-semibold text-gray-800">Shopping Bag</span>
            <span className="text-sm text-gray-400">({items.length} items)</span>
          </div>
          <button onClick={() => dispatch(setCartOpen(false))} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag size={52} className="text-brand-200 mb-4" />
              <p className="font-serif text-lg text-gray-700 mb-2">Sign in to view your bag</p>
              <Link href="/login" onClick={() => dispatch(setCartOpen(false))} className="px-6 py-2.5 bg-brand-700 text-white rounded-lg text-sm font-medium hover:bg-brand-800 transition-colors">
                Sign In
              </Link>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-brand-600" size={24} /></div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag size={52} className="text-brand-200 mb-4" />
              <p className="font-serif text-lg text-gray-700 mb-2">Your bag is empty</p>
              <p className="text-sm text-gray-400 mb-6">Add items to start shopping</p>
              <button onClick={() => dispatch(setCartOpen(false))} className="px-6 py-2.5 bg-brand-700 text-white rounded-lg text-sm font-medium hover:bg-brand-800 transition-colors">
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const itemId = getCartItemId(item);
                const price = item.variant?.sellingPrice ?? 0;
                return (
                  <div key={itemId} className="flex gap-3 pb-4 border-b border-gray-50">
                    <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-brand-50 shrink-0">
                      {item.product?.images?.[0] && <Image src={item.product.images[0]} alt={item.product.name} fill sizes="80px" className="object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-800 truncate">{item.product?.name}</h4>
                      <div className="flex gap-2 mt-0.5">
                        {item.variant?.size && <span className="text-xs text-gray-500">Size: {item.variant.size}</span>}
                        {item.variant?.color && <span className="text-xs text-gray-500">{item.variant.color}</span>}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-semibold text-brand-700">{formatPriceBDT(price)}</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateItem.mutate({ cartItemId: itemId, quantity: Math.max(1, item.quantity - 1) })} className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                            <Minus size={11} />
                          </button>
                          <span className="text-sm w-5 text-center">{item.quantity}</span>
                          <button onClick={() => updateItem.mutate({ cartItemId: itemId, quantity: item.quantity + 1 })} className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                            <Plus size={11} />
                          </button>
                          <button onClick={() => removeItem.mutate(itemId)} className="ml-1 p-1 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {isAuthenticated && items.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 bg-brand-50">
            <div className="flex justify-between items-center mb-1"><span className="text-sm text-gray-500">Subtotal</span><span className="font-semibold text-gray-800">{formatPriceBDT(total)}</span></div>
            <div className="flex justify-between items-center mb-4"><span className="text-sm text-gray-500">Delivery</span><span className="text-sm text-green-600 font-medium">{total >= 1500 ? "Free" : formatPriceBDT(80)}</span></div>
            <div className="flex justify-between items-center mb-4 pt-3 border-t border-brand-100">
              <span className="font-semibold text-gray-800">Total</span>
              <span className="font-bold text-brand-700 text-lg">{formatPriceBDT(total >= 1500 ? total : total + 80)}</span>
            </div>
            <Link href="/checkout" onClick={() => dispatch(setCartOpen(false))} className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-700 hover:bg-brand-800 text-white rounded-lg font-medium transition-colors">
              Proceed to Checkout <ArrowRight size={16} />
            </Link>
            <Link href="/cart" onClick={() => dispatch(setCartOpen(false))} className="w-full text-center mt-2 py-2 text-sm text-brand-600 hover:text-brand-800 block">View Full Cart</Link>
          </div>
        )}
      </div>
    </>
  );
}
