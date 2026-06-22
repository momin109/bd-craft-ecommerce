"use client";
import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, CreditCard, Package, CheckCircle2, Lock, MapPin, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/queries/useCart";
import { useCheckout } from "@/hooks/queries/useOrders";
import { useInitiatePayment } from "@/hooks/queries/usePayment";
import { useAuthContext } from "@/context/AuthContext";
import { formatPriceBDT, cn } from "@/lib/utils";
import { PaymentMethod, ApiOrder } from "@/types/api/order";
import { getErrorMessage } from "@/lib/api/client";
import { LoadingState } from "@/components/shared/LoadingState";
import toast from "react-hot-toast";

const PAYMENT_METHODS: { id: PaymentMethod; label: string; logo: string }[] = [
  { id: "SSLCOMMERZ", label: "bKash / Nagad / Card (SSLCommerz)", logo: "🔒" },
  { id: "AAMARPAY", label: "aamarPay", logo: "💚" },
  { id: "SHURJOPAY", label: "ShurjoPay", logo: "🟦" },
  { id: "COD", label: "Cash on Delivery", logo: "💵" },
];

type Step = "address" | "payment" | "review" | "success";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading, user } = useAuthContext();
  const { data: cart, isLoading: cartLoading } = useCart();
  const checkoutMutation = useCheckout();
  const initiatePaymentMutation = useInitiatePayment();

  const [step, setStep] = useState<Step>("address");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(user?.codAllowed === false ? "SSLCOMMERZ" : "COD");
  const [placedOrder, setPlacedOrder] = useState<ApiOrder | null>(null);
  const [error, setError] = useState("");

  const couponFromCart = searchParams.get("coupon") ?? "";

  const [form, setForm] = useState({
    fullName: "", mobile: "", district: "", city: "", area: "", addressLine: "", note: "",
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/login?redirect=/checkout");
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user?.name) setForm((f) => ({ ...f, fullName: user.name || f.fullName, mobile: user.mobile || f.mobile }));
  }, [user]);

  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? items.reduce((sum, i) => sum + (i.variant?.sellingPrice ?? 0) * i.quantity, 0);
  const shippingCharge = 120;

  const updateForm = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const placeOrder = () => {
    setError("");
    checkoutMutation.mutate(
      {
        shippingAddress: form,
        paymentMethod,
        shippingCharge,
        couponCode: couponFromCart || undefined,
      },
      {
        onSuccess: async (order) => {
          if (paymentMethod === "COD") {
            setPlacedOrder(order);
            setStep("success");
            return;
          }
          const orderId = order._id ?? order.id ?? "";
          try {
            const { paymentUrl } = await initiatePaymentMutation.mutateAsync(orderId);
            window.location.href = paymentUrl;
          } catch (err) {
            setError(getErrorMessage(err));
          }
        },
        onError: (err) => setError(getErrorMessage(err)),
      }
    );
  };

  if (authLoading || cartLoading) return <LoadingState label="Loading checkout..." />;

  if (step === "success" && placedOrder) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-green-500" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-gray-900 mb-3">Order Placed!</h1>
        <p className="text-gray-500 mb-2">Thank you, {form.fullName || "valued customer"}!</p>
        <p className="text-gray-400 text-sm mb-8">
          Your order <span className="font-semibold text-gray-700">#{placedOrder.orderNumber}</span> has been placed successfully.
        </p>
        <div className="p-4 bg-brand-50 rounded-xl border border-brand-100 mb-8 text-left space-y-2">
          <div className="flex justify-between text-sm"><span className="text-gray-500">Payment Method</span><span className="font-medium">{paymentMethod}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Total Payable</span><span className="font-bold text-brand-700">{formatPriceBDT(placedOrder.totalPayable)}</span></div>
        </div>
        <div className="flex gap-3">
          <Link href="/account" className="flex-1 py-3 border border-brand-200 text-brand-700 rounded-xl font-medium text-sm hover:bg-brand-50 transition-colors text-center">Track Order</Link>
          <Link href="/" className="flex-1 py-3 bg-brand-700 text-white rounded-xl font-semibold text-sm hover:bg-brand-800 transition-colors text-center">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <Package size={56} className="text-brand-200 mx-auto mb-4" />
        <h1 className="font-serif text-2xl font-bold text-gray-800 mb-3">Your bag is empty</h1>
        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-700 text-white rounded-xl font-semibold hover:bg-brand-800 transition-colors">Continue Shopping</Link>
      </div>
    );
  }

  const steps: { id: Step; label: string }[] = [{ id: "address", label: "Address" }, { id: "payment", label: "Payment" }, { id: "review", label: "Review" }];
  const stepIdx = steps.findIndex((s) => s.id === step);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-center gap-2 mb-10">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
              i < stepIdx ? "bg-green-500 text-white" : i === stepIdx ? "bg-brand-700 text-white" : "bg-gray-100 text-gray-400")}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs border-2 border-current font-bold">{i < stepIdx ? "✓" : i + 1}</span>
              {s.label}
            </div>
            {i < steps.length - 1 && <ChevronRight size={14} className="text-gray-300" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === "address" && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 animate-fade-in">
              <h2 className="font-serif text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><MapPin size={20} className="text-brand-600" /> Delivery Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Full Name *</label>
                  <input value={form.fullName} onChange={(e) => updateForm("fullName", e.target.value)} placeholder="Md. Rahim Uddin" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-400 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Mobile *</label>
                  <input value={form.mobile} onChange={(e) => updateForm("mobile", e.target.value)} placeholder="017XXXXXXXX" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-400 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">District *</label>
                  <input value={form.district} onChange={(e) => updateForm("district", e.target.value)} placeholder="e.g. Kushtia" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-400 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">City *</label>
                  <input value={form.city} onChange={(e) => updateForm("city", e.target.value)} placeholder="e.g. Mirpur" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-400 text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Area *</label>
                  <input value={form.area} onChange={(e) => updateForm("area", e.target.value)} placeholder="e.g. Mirpur Upazila" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-400 text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Full Address *</label>
                  <textarea value={form.addressLine} onChange={(e) => updateForm("addressLine", e.target.value)} placeholder="House no, Road no, Area..." rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-400 text-sm resize-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Delivery Note</label>
                  <input value={form.note} onChange={(e) => updateForm("note", e.target.value)} placeholder="Call before delivery" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-400 text-sm" />
                </div>
              </div>
              <button onClick={() => setStep("payment")} disabled={!form.fullName || !form.mobile || !form.addressLine}
                className="mt-6 w-full py-3.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-40 text-white font-semibold rounded-xl transition-all">
                Continue to Payment
              </button>
            </div>
          )}

          {step === "payment" && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 animate-fade-in">
              <h2 className="font-serif text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><CreditCard size={20} className="text-brand-600" /> Payment Method</h2>
              <div className="space-y-3 mb-6">
                {PAYMENT_METHODS.map((m) => {
                  const disabled = m.id === "COD" && user?.codAllowed === false;
                  return (
                    <button key={m.id} onClick={() => !disabled && setPaymentMethod(m.id)} disabled={disabled}
                      className={cn("w-full flex items-center gap-3 p-4 border-2 rounded-xl transition-all text-left",
                        disabled ? "opacity-40 cursor-not-allowed border-gray-100" :
                        paymentMethod === m.id ? "border-brand-500 bg-brand-50" : "border-gray-100 hover:border-brand-200")}>
                      <span className="text-2xl">{m.logo}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-sm">{m.label}</p>
                        {m.id === "COD" && <p className="text-xs text-gray-400">{disabled ? "Restricted on your account" : "Pay when your order arrives"}</p>}
                      </div>
                      {paymentMethod === m.id && !disabled && <CheckCircle2 size={18} className="text-brand-500" />}
                    </button>
                  );
                })}
              </div>
              <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-2 mb-5">
                <Lock size={13} className="text-green-500 shrink-0" />
                <p className="text-xs text-gray-500">Your payment information is secured with 256-bit SSL encryption</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep("address")} className="flex-1 py-3.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors">Back</button>
                <button onClick={() => setStep("review")} className="flex-1 py-3.5 bg-brand-700 hover:bg-brand-800 text-white font-semibold rounded-xl transition-all">Review Order</button>
              </div>
            </div>
          )}

          {step === "review" && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2"><MapPin size={15} className="text-brand-600" /> Delivery Address</h3>
                  <button onClick={() => setStep("address")} className="text-xs text-brand-600 hover:underline">Edit</button>
                </div>
                <p className="text-sm text-gray-700 font-medium">{form.fullName}</p>
                <p className="text-sm text-gray-500">{form.mobile}</p>
                <p className="text-sm text-gray-500">{form.addressLine}, {form.area}, {form.city}, {form.district}</p>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2"><CreditCard size={15} className="text-brand-600" /> Payment Method</h3>
                  <button onClick={() => setStep("payment")} className="text-xs text-brand-600 hover:underline">Edit</button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.logo}</span>
                  <span className="text-sm font-medium text-gray-700">{PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}</span>
                </div>
              </div>

              {couponFromCart && (
                <div className="bg-white border border-gray-100 rounded-2xl p-5">
                  <p className="text-sm text-gray-700">Coupon code <span className="font-semibold text-brand-700">{couponFromCart}</span> will be applied at checkout.</p>
                </div>
              )}

              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Package size={15} className="text-brand-600" /> Order Items ({items.length})</h3>
                <div className="space-y-3">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-brand-50 shrink-0">
                        {item.product?.images?.[0] && <Image src={item.product.images[0]} alt={item.product.name} fill sizes="48px" className="object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.product?.name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity} {item.variant?.size ? `• Size: ${item.variant.size}` : ""}</p>
                      </div>
                      <span className="text-sm font-semibold text-brand-700">{formatPriceBDT((item.variant?.sellingPrice ?? 0) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

              <button onClick={placeOrder} disabled={checkoutMutation.isPending || initiatePaymentMutation.isPending}
                className="w-full py-4 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-bold rounded-xl text-base transition-all hover:shadow-lg flex items-center justify-center gap-2">
                {(checkoutMutation.isPending || initiatePaymentMutation.isPending) ? (
                  <><Loader2 size={16} className="animate-spin" /> Placing Order...</>
                ) : (
                  <>Place Order — {formatPriceBDT(subtotal + shippingCharge)}</>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 sticky top-24">
            <h3 className="font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">Order Summary</h3>
            <div className="space-y-3 max-h-56 overflow-y-auto mb-4">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="relative w-10 h-12 rounded-lg overflow-hidden bg-brand-50 shrink-0">
                    {item.product?.images?.[0] && <Image src={item.product.images[0]} alt="" fill sizes="40px" className="object-cover" />}
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-600 text-white text-[9px] rounded-full flex items-center justify-center font-bold">{item.quantity}</span>
                  </div>
                  <span className="flex-1 text-xs text-gray-600 line-clamp-2">{item.product?.name}</span>
                  <span className="text-xs font-semibold text-gray-800 shrink-0">{formatPriceBDT((item.variant?.sellingPrice ?? 0) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm pt-3 border-t border-gray-100">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatPriceBDT(subtotal)}</span></div>
              {couponFromCart && <div className="flex justify-between text-green-600"><span>Coupon</span><span>{couponFromCart}</span></div>}
              <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{formatPriceBDT(shippingCharge)}</span></div>
              <p className="text-[11px] text-gray-400 pt-1">Final discount (coupon/offers) is calculated by the server and shown on the confirmation page.</p>
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100 text-base"><span>Estimated Total</span><span className="text-brand-700">{formatPriceBDT(subtotal + shippingCharge)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return <Suspense><CheckoutContent /></Suspense>;
}
