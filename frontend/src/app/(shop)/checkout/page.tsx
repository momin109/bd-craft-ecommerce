"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, CreditCard, Smartphone, Package, CheckCircle2, ChevronDown, Lock, MapPin } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { selectCartItems, selectCartTotal, clearCart } from "@/store/slices/cartSlice";
import { formatPriceBDT } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { PaymentMethod } from "@/types";

const DIVISIONS = ["Dhaka","Chittagong","Rajshahi","Khulna","Barishal","Sylhet","Rangpur","Mymensingh"];

const PAYMENT_METHODS: { id: PaymentMethod; label: string; logo: string; category: string }[] = [
  { id: "bkash", label: "bKash", logo: "🟣", category: "mobile" },
  { id: "nagad", label: "Nagad", logo: "🟠", category: "mobile" },
  { id: "rocket", label: "Rocket", logo: "🟤", category: "mobile" },
  { id: "card", label: "Visa / Mastercard", logo: "💳", category: "card" },
  { id: "sslcommerz", label: "SSLCommerz", logo: "🔒", category: "gateway" },
  { id: "aamarpay", label: "aamarPay", logo: "💚", category: "gateway" },
  { id: "cod", label: "Cash on Delivery", logo: "💵", category: "cod" },
];

type Step = "address" | "payment" | "review" | "success";

export default function CheckoutPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartTotal);
  const [step, setStep] = useState<Step>("address");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bkash");
  const [mobileNumber, setMobileNumber] = useState("");
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", email: "", division: "Dhaka",
    district: "", area: "", address: "", postalCode: "",
  });

  const deliveryFee = subtotal >= 1500 ? 0 : 80;
  const total = subtotal + deliveryFee;

  const updateForm = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const placeOrder = async () => {
    setPlacing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setStep("success");
    dispatch(clearCart());
    setPlacing(false);
  };

  if (step === "success") {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-green-500" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-gray-900 mb-3">Order Placed!</h1>
        <p className="text-gray-500 mb-2">Thank you, {form.name || "valued customer"}!</p>
        <p className="text-gray-400 text-sm mb-8">
          Your order <span className="font-semibold text-gray-700">#SHP{Math.floor(Math.random()*90000+10000)}</span> has been placed successfully.
          You'll receive an SMS confirmation shortly.
        </p>
        <div className="p-4 bg-brand-50 rounded-xl border border-brand-100 mb-8 text-left space-y-2">
          <div className="flex justify-between text-sm"><span className="text-gray-500">Payment Method</span><span className="font-medium capitalize">{paymentMethod}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Delivery to</span><span className="font-medium">{form.district || "Dhaka"}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Total Paid</span><span className="font-bold text-brand-700">{formatPriceBDT(total)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Estimated Delivery</span><span className="font-medium text-green-600">3-5 Business Days</span></div>
        </div>
        <div className="flex gap-3">
          <Link href="/account" className="flex-1 py-3 border border-brand-200 text-brand-700 rounded-xl font-medium text-sm hover:bg-brand-50 transition-colors text-center">
            Track Order
          </Link>
          <Link href="/" className="flex-1 py-3 bg-brand-700 text-white rounded-xl font-semibold text-sm hover:bg-brand-800 transition-colors text-center">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const steps: { id: Step; label: string }[] = [
    { id: "address", label: "Address" },
    { id: "payment", label: "Payment" },
    { id: "review", label: "Review" },
  ];
  const stepIdx = steps.findIndex((s) => s.id === step);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
              i < stepIdx ? "bg-green-500 text-white" :
              i === stepIdx ? "bg-brand-700 text-white" :
              "bg-gray-100 text-gray-400"
            )}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs border-2 border-current font-bold">
                {i < stepIdx ? "✓" : i + 1}
              </span>
              {s.label}
            </div>
            {i < steps.length - 1 && <ChevronRight size={14} className="text-gray-300" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Step Content */}
        <div className="lg:col-span-2">

          {/* STEP 1: Address */}
          {step === "address" && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 animate-fade-in">
              <h2 className="font-serif text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MapPin size={20} className="text-brand-600" /> Delivery Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Full Name *</label>
                  <input value={form.name} onChange={(e) => updateForm("name", e.target.value)}
                    placeholder="Md. Rahim Uddin"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-400 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Phone *</label>
                  <input value={form.phone} onChange={(e) => updateForm("phone", e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-400 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Email</label>
                  <input value={form.email} onChange={(e) => updateForm("email", e.target.value)}
                    placeholder="email@example.com" type="email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-400 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Division *</label>
                  <div className="relative">
                    <select value={form.division} onChange={(e) => updateForm("division", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-400 text-sm appearance-none bg-white">
                      {DIVISIONS.map((d) => <option key={d}>{d}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">District *</label>
                  <input value={form.district} onChange={(e) => updateForm("district", e.target.value)}
                    placeholder="e.g. Gulshan, Dhaka"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-400 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Area / Thana</label>
                  <input value={form.area} onChange={(e) => updateForm("area", e.target.value)}
                    placeholder="e.g. Banani, Mohakhali"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-400 text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Full Address *</label>
                  <textarea value={form.address} onChange={(e) => updateForm("address", e.target.value)}
                    placeholder="House no, Road no, Area..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-400 text-sm resize-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Postal Code</label>
                  <input value={form.postalCode} onChange={(e) => updateForm("postalCode", e.target.value)}
                    placeholder="1212"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-400 text-sm" />
                </div>
              </div>
              <button
                onClick={() => setStep("payment")}
                disabled={!form.name || !form.phone || !form.address}
                className="mt-6 w-full py-3.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-40 text-white font-semibold rounded-xl transition-all"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {/* STEP 2: Payment */}
          {step === "payment" && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 animate-fade-in">
              <h2 className="font-serif text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard size={20} className="text-brand-600" /> Payment Method
              </h2>

              {/* Mobile Banking */}
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Smartphone size={12} /> Mobile Banking
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  {PAYMENT_METHODS.filter((m) => m.category === "mobile").map((m) => (
                    <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3.5 border-2 rounded-xl transition-all",
                        paymentMethod === m.id ? "border-brand-500 bg-brand-50" : "border-gray-100 hover:border-brand-200"
                      )}>
                      <span className="text-2xl">{m.logo}</span>
                      <span className="text-xs font-semibold text-gray-700">{m.label}</span>
                      {paymentMethod === m.id && <span className="w-2 h-2 rounded-full bg-brand-500" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Card */}
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <CreditCard size={12} /> Card Payment
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  {PAYMENT_METHODS.filter((m) => m.category === "card" || m.category === "gateway").map((m) => (
                    <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3.5 border-2 rounded-xl transition-all",
                        paymentMethod === m.id ? "border-brand-500 bg-brand-50" : "border-gray-100 hover:border-brand-200"
                      )}>
                      <span className="text-2xl">{m.logo}</span>
                      <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{m.label}</span>
                      {paymentMethod === m.id && <span className="w-2 h-2 rounded-full bg-brand-500" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* COD */}
              <div className="mb-6">
                <button onClick={() => setPaymentMethod("cod")}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 border-2 rounded-xl transition-all",
                    paymentMethod === "cod" ? "border-brand-500 bg-brand-50" : "border-gray-100 hover:border-brand-200"
                  )}>
                  <span className="text-2xl">💵</span>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800 text-sm">Cash on Delivery</p>
                    <p className="text-xs text-gray-400">Pay when your order arrives</p>
                  </div>
                  {paymentMethod === "cod" && <CheckCircle2 size={18} className="ml-auto text-brand-500" />}
                </button>
              </div>

              {/* Mobile Number for bKash/Nagad/Rocket */}
              {["bkash", "nagad", "rocket"].includes(paymentMethod) && (
                <div className="mb-5 p-4 bg-purple-50 rounded-xl border border-purple-100 animate-fade-in">
                  <label className="text-xs font-semibold text-purple-700 mb-2 block">
                    {paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)} Number *
                  </label>
                  <input
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-4 py-2.5 border border-purple-200 rounded-lg focus:outline-none focus:border-purple-400 text-sm bg-white"
                  />
                  <p className="text-[11px] text-purple-500 mt-1.5">You'll receive a payment prompt on this number</p>
                </div>
              )}

              <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-2 mb-5">
                <Lock size={13} className="text-green-500 shrink-0" />
                <p className="text-xs text-gray-500">Your payment information is secured with 256-bit SSL encryption</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep("address")} className="flex-1 py-3.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                  Back
                </button>
                <button onClick={() => setStep("review")} className="flex-1 py-3.5 bg-brand-700 hover:bg-brand-800 text-white font-semibold rounded-xl transition-all">
                  Review Order
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review */}
          {step === "review" && (
            <div className="space-y-4 animate-fade-in">
              {/* Address Summary */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2"><MapPin size={15} className="text-brand-600" /> Delivery Address</h3>
                  <button onClick={() => setStep("address")} className="text-xs text-brand-600 hover:underline">Edit</button>
                </div>
                <p className="text-sm text-gray-700 font-medium">{form.name}</p>
                <p className="text-sm text-gray-500">{form.phone} {form.email && `• ${form.email}`}</p>
                <p className="text-sm text-gray-500">{form.address}, {form.area}, {form.district}, {form.division}</p>
              </div>

              {/* Payment Summary */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2"><CreditCard size={15} className="text-brand-600" /> Payment Method</h3>
                  <button onClick={() => setStep("payment")} className="text-xs text-brand-600 hover:underline">Edit</button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.logo}</span>
                  <span className="text-sm font-medium text-gray-700 capitalize">{PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}</span>
                  {mobileNumber && <span className="text-sm text-gray-400">• {mobileNumber}</span>}
                </div>
              </div>

              {/* Items Review */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Package size={15} className="text-brand-600" /> Order Items ({items.length})</h3>
                <div className="space-y-3">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-brand-50 shrink-0">
                        <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.product.name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity} {item.selectedSize ? `• Size: ${item.selectedSize}` : ""}</p>
                      </div>
                      <span className="text-sm font-semibold text-brand-700">{formatPriceBDT(item.product.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={placeOrder}
                disabled={placing}
                className="w-full py-4 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-bold rounded-xl text-base transition-all hover:shadow-lg flex items-center justify-center gap-2"
              >
                {placing ? (
                  <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Placing Order...</>
                ) : (
                  <>Place Order — {formatPriceBDT(total)}</>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 sticky top-24">
            <h3 className="font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">Order Summary</h3>
            <div className="space-y-3 max-h-56 overflow-y-auto mb-4">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="relative w-10 h-12 rounded-lg overflow-hidden bg-brand-50 shrink-0">
                    <Image src={item.product.images[0]} alt="" fill className="object-cover" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-600 text-white text-[9px] rounded-full flex items-center justify-center font-bold">{item.quantity}</span>
                  </div>
                  <span className="flex-1 text-xs text-gray-600 line-clamp-2">{item.product.name}</span>
                  <span className="text-xs font-semibold text-gray-800 shrink-0">{formatPriceBDT(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm pt-3 border-t border-gray-100">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatPriceBDT(subtotal)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Delivery</span><span className={deliveryFee === 0 ? "text-green-600" : ""}>{deliveryFee === 0 ? "FREE" : formatPriceBDT(deliveryFee)}</span></div>
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100 text-base">
                <span>Total</span><span className="text-brand-700">{formatPriceBDT(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
