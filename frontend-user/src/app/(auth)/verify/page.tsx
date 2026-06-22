"use client";
import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Smartphone, Loader2 } from "lucide-react";
import { useVerifyOtp } from "@/hooks/queries/useAuth";
import { getErrorMessage } from "@/lib/api/client";
import toast from "react-hot-toast";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifyOtpMutation = useVerifyOtp();

  const mobile = searchParams.get("mobile") ?? "";
  const devOtp = searchParams.get("devOtp") ?? "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

  // Prefill OTP in development if backend returned it on register
  useEffect(() => {
    if (devOtp && devOtp.length <= 6) {
      const digits = devOtp.split("");
      setOtp((prev) => prev.map((_, i) => digits[i] ?? ""));
    }
  }, [devOtp]);

  const handleInput = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...otp]; next[i] = v; setOtp(next);
    if (v && i < otp.length - 1) refs[i + 1].current?.focus();
  };

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs[i - 1].current?.focus();
  };

  const submitOtp = () => {
    const code = otp.join("");
    if (code.length < otp.length) { setError("Please enter the full OTP code"); return; }
    if (!mobile) { setError("Missing phone number — please register again."); return; }
    setError("");
    verifyOtpMutation.mutate({ mobile, otp: code }, {
      onSuccess: () => {
        toast.success("Phone verified! Please sign in.");
        router.push("/login");
      },
      onError: (err) => setError(getErrorMessage(err)),
    });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-brand-50">
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-5">
          <Smartphone size={28} className="text-brand-700" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-gray-900 mb-2">Verify Your Phone</h1>
        <p className="text-gray-400 text-sm mb-8">
          {mobile ? <>We sent an OTP to <span className="font-semibold text-gray-700">{mobile}</span></> : "Enter the OTP sent to your phone"}
        </p>

        <div className="flex gap-2 justify-center mb-6">
          {otp.map((v, i) => (
            <input
              key={i} ref={refs[i]} value={v}
              onChange={(e) => handleInput(i, e.target.value)}
              onKeyDown={(e) => handleKey(i, e)}
              maxLength={1}
              className="w-10 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 transition-colors"
            />
          ))}
        </div>

        {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-4">{error}</p>}

        <button
          onClick={submitOtp}
          disabled={verifyOtpMutation.isPending}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
        >
          {verifyOtpMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : "Verify & Continue"}
        </button>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return <Suspense><VerifyContent /></Suspense>;
}
