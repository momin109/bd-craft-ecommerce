"use client";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const upd = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-brand-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-serif text-3xl font-bold text-brand-800">Shopora</span>
          <p className="text-gray-500 text-sm mt-1">Create your account</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
          <div className="space-y-4">
            {[
              { key: "name", label: "Full Name", placeholder: "Md. Rahim Uddin", type: "text" },
              { key: "phone", label: "Phone Number", placeholder: "01XXXXXXXXX", type: "tel" },
              { key: "email", label: "Email (optional)", placeholder: "you@example.com", type: "email" },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">{f.label}</label>
                <input value={(form as any)[f.key]} onChange={(e) => upd(f.key, e.target.value)}
                  placeholder={f.placeholder} type={f.type}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-400 text-sm" />
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Password</label>
              <div className="relative">
                <input value={form.password} onChange={(e) => upd("password", e.target.value)}
                  placeholder="Min 8 characters" type={show ? "text" : "password"}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-400 text-sm pr-10" />
                <button onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              By creating an account, you agree to our <Link href="#" className="text-brand-600">Terms</Link> and <Link href="#" className="text-brand-600">Privacy Policy</Link>
            </p>
            <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-700 hover:bg-brand-800 text-white font-semibold rounded-xl transition-colors">
              <UserPlus size={16} /> Create Account
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-5">
            Already have an account? <Link href="/login" className="text-brand-600 font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
