"use client";
import { useState, useRef, useEffect } from "react";
import { Smartphone, RefreshCw } from "lucide-react";

export default function VerifyPage() {
  const [otp, setOtp] = useState(["","","","",""]);
  const [timer, setTimer] = useState(60);
  const refs = [useRef<HTMLInputElement>(null),useRef<HTMLInputElement>(null),useRef<HTMLInputElement>(null),useRef<HTMLInputElement>(null),useRef<HTMLInputElement>(null)];

  useEffect(() => {
    const t = setInterval(() => setTimer((s) => s > 0 ? s - 1 : 0), 1000);
    return () => clearInterval(t);
  }, []);

  const handleInput = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...otp]; next[i] = v; setOtp(next);
    if (v && i < 4) refs[i + 1].current?.focus();
  };

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs[i - 1].current?.focus();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-brand-50">
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-5">
          <Smartphone size={28} className="text-brand-700" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-gray-900 mb-2">Verify Your Phone</h1>
        <p className="text-gray-400 text-sm mb-8">
          We sent a 5-digit OTP to <span className="font-semibold text-gray-700">017XXXXXXXX</span>
        </p>
        <div className="flex gap-3 justify-center mb-6">
          {otp.map((v, i) => (
            <input
              key={i} ref={refs[i]} value={v}
              onChange={(e) => handleInput(i, e.target.value)}
              onKeyDown={(e) => handleKey(i, e)}
              maxLength={1}
              className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 transition-colors"
            />
          ))}
        </div>
        <button className="w-full py-3.5 bg-brand-700 hover:bg-brand-800 text-white font-semibold rounded-xl transition-colors mb-4">
          Verify OTP
        </button>
        <div className="flex items-center justify-center gap-2 text-sm">
          {timer > 0 ? (
            <span className="text-gray-400">Resend in <span className="font-semibold text-brand-700">{timer}s</span></span>
          ) : (
            <button onClick={() => setTimer(60)} className="flex items-center gap-1 text-brand-600 hover:underline">
              <RefreshCw size={13} /> Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
