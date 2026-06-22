"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { useLogin } from "@/hooks/queries/useAuth";
import { useAuthContext } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api/client";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { setSession } = useAuthContext();
  const loginMutation = useLogin();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ phone: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate({ mobile: form.phone, password: form.password }, {
      onSuccess: (data) => {
        setSession(data.user, data.accessToken);
        toast.success(`Welcome back, ${data.user.name || "there"}!`);
        router.push("/account");
      },
      onError: (err) => setError(getErrorMessage(err)),
    });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-brand-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-serif text-3xl font-bold text-brand-800">Shopora</span>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Phone Number</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="01XXXXXXXXX" type="tel" required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-400 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••" type={show ? "text" : "password"} required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-400 text-sm pr-10"
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <div className="flex justify-end">
              <Link href="#" className="text-xs text-brand-600 hover:underline">Forgot password?</Link>
            </div>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
            >
              {loginMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
              Sign In
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
            <div className="relative text-center"><span className="bg-white px-3 text-xs text-gray-400">or continue with</span></div>
          </div>
          <Link href="/verify" className="w-full py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <span className="text-lg">📱</span> OTP Login
          </Link>
          <p className="text-center text-xs text-gray-400 mt-5">
            Don't have an account? <Link href="/register" className="text-brand-600 font-semibold hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
