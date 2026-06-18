"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User, Package, Heart, MapPin, Settings, LogOut, ChevronRight,
  ShoppingBag, Star, RotateCcw, Truck, CheckCircle2, Clock, XCircle,
  Edit2, Plus, Bell, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPriceBDT } from "@/lib/utils";

type Tab = "dashboard" | "orders" | "wishlist" | "addresses" | "reviews" | "settings";

const mockOrders = [
  { id: "SHP10234", date: "June 12, 2024", items: 3, total: 5850, status: "delivered", tracking: "STF-8829341" },
  { id: "SHP10189", date: "June 5, 2024", items: 1, total: 2200, status: "shipped", tracking: "STF-8821044" },
  { id: "SHP10102", date: "May 28, 2024", items: 2, total: 3700, status: "processing", tracking: null },
  { id: "SHP09988", date: "May 15, 2024", items: 1, total: 750, status: "returned", tracking: "STF-8815522" },
];

const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  pending:    { label: "Pending",    icon: Clock,          color: "text-yellow-600",  bg: "bg-yellow-50 border-yellow-100" },
  confirmed:  { label: "Confirmed",  icon: CheckCircle2,   color: "text-blue-600",    bg: "bg-blue-50 border-blue-100" },
  processing: { label: "Processing", icon: Package,         color: "text-purple-600",  bg: "bg-purple-50 border-purple-100" },
  shipped:    { label: "Shipped",    icon: Truck,           color: "text-indigo-600",  bg: "bg-indigo-50 border-indigo-100" },
  delivered:  { label: "Delivered",  icon: CheckCircle2,    color: "text-green-600",   bg: "bg-green-50 border-green-100" },
  returned:   { label: "Returned",   icon: RotateCcw,       color: "text-orange-600",  bg: "bg-orange-50 border-orange-100" },
  cancelled:  { label: "Cancelled",  icon: XCircle,         color: "text-red-600",     bg: "bg-red-50 border-red-100" },
};

const user = {
  name: "Momin Al Hasan", email: "momin@example.com", phone: "01700000000",
  avatar: null, successRate: 90, totalOrders: 10, deliveredOrders: 9, returnedOrders: 1,
};

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const navItems: { id: Tab; label: string; icon: any; badge?: number }[] = [
    { id: "dashboard", label: "Dashboard", icon: User },
    { id: "orders", label: "My Orders", icon: Package, badge: mockOrders.length },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "reviews", label: "My Reviews", icon: Star },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* Sidebar */}
        <aside className="md:col-span-1">
          {/* Profile Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-3">
              <span className="font-serif text-2xl font-bold text-brand-700">{user.name[0]}</span>
            </div>
            <h3 className="font-semibold text-gray-800">{user.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{user.phone}</p>
            <div className="mt-3 px-3 py-2 bg-green-50 rounded-xl border border-green-100 inline-block">
              <span className="text-xs font-semibold text-green-700">✓ Verified Customer</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors border-b border-gray-50 last:border-none",
                    activeTab === item.id
                      ? "bg-brand-50 text-brand-700 border-l-2 border-l-brand-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  )}
                >
                  <Icon size={16} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 bg-brand-100 text-brand-700 text-[10px] font-bold rounded-full">{item.badge}</span>
                  )}
                  <ChevronRight size={14} className="text-gray-300" />
                </button>
              );
            })}
            <button className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="md:col-span-3">

          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="font-serif text-2xl font-bold text-gray-900">Welcome back, {user.name.split(" ")[0]}! 👋</h2>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Total Orders", value: user.totalOrders, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Delivered", value: user.deliveredOrders, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
                  { label: "Returned", value: user.returnedOrders, icon: RotateCcw, color: "text-orange-600", bg: "bg-orange-50" },
                  { label: "Success Rate", value: `${user.successRate}%`, icon: Star, color: "text-brand-600", bg: "bg-brand-50" },
                ].map((s) => (
                  <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4">
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", s.bg)}>
                      <s.icon size={16} className={s.color} />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-0.5">{s.value}</div>
                    <div className="text-xs text-gray-400">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Success Rate Bar */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">Customer Success Score</h3>
                  <span className="text-lg font-bold text-brand-700">{user.successRate}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-brand-700 rounded-full transition-all duration-1000"
                    style={{ width: `${user.successRate}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400">
                  {user.successRate >= 80 ? "🟢 Excellent! You're eligible for COD on all orders." :
                   user.successRate >= 60 ? "🟡 Good standing. COD available with verification." :
                   "🔴 Low score. COD may be restricted on your account."}
                </p>
              </div>

              {/* Recent Orders */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">Recent Orders</h3>
                  <button onClick={() => setActiveTab("orders")} className="text-xs text-brand-600 hover:underline">View All</button>
                </div>
                <div className="space-y-3">
                  {mockOrders.slice(0, 3).map((order) => {
                    const s = statusConfig[order.status];
                    const Icon = s.icon;
                    return (
                      <div key={order.id} className={cn("flex items-center justify-between p-3 rounded-xl border", s.bg)}>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">#{order.id}</p>
                          <p className="text-xs text-gray-400">{order.date} · {order.items} items</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-800">{formatPriceBDT(order.total)}</span>
                          <span className={cn("flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full", s.color, "bg-white border", s.bg.replace("bg-", "border-"))}>
                            <Icon size={11} /> {s.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Orders */}
          {activeTab === "orders" && (
            <div className="animate-fade-in">
              <h2 className="font-serif text-2xl font-bold text-gray-900 mb-5">My Orders</h2>

              {/* Filter tabs */}
              <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
                {["All", "Pending", "Processing", "Shipped", "Delivered", "Returned"].map((f) => (
                  <button key={f} className="px-3.5 py-1.5 text-xs font-medium rounded-full border border-gray-200 whitespace-nowrap hover:border-brand-300 hover:text-brand-700 transition-colors first:bg-brand-700 first:text-white first:border-brand-700">
                    {f}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {mockOrders.map((order) => {
                  const s = statusConfig[order.status];
                  const Icon = s.icon;
                  return (
                    <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-brand-200 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="font-semibold text-gray-800">Order #{order.id}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{order.date} · {order.items} item{order.items > 1 ? "s" : ""}</p>
                        </div>
                        <span className={cn("flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full border", s.color, s.bg)}>
                          <Icon size={11} /> {s.label}
                        </span>
                      </div>

                      {/* Progress bar for active orders */}
                      {["confirmed", "processing", "shipped"].includes(order.status) && (
                        <div className="mb-4">
                          <div className="flex justify-between text-[10px] text-gray-400 mb-1.5">
                            {["Confirmed", "Processing", "Shipped", "Delivered"].map((st, i) => (
                              <span key={st} className={cn(
                                ["confirmed","processing","shipped","delivered"].indexOf(order.status) >= i ? "text-brand-600 font-medium" : ""
                              )}>{st}</span>
                            ))}
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-500 rounded-full transition-all"
                              style={{ width: `${(["confirmed","processing","shipped","delivered"].indexOf(order.status) + 1) * 25}%` }} />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-bold text-gray-900">{formatPriceBDT(order.total)}</span>
                          {order.tracking && (
                            <p className="text-[11px] text-gray-400 mt-0.5">Tracking: {order.tracking}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {order.status === "delivered" && (
                            <button className="px-3 py-1.5 text-xs font-medium border border-brand-200 text-brand-700 rounded-lg hover:bg-brand-50 transition-colors">
                              Write Review
                            </button>
                          )}
                          <button className="px-3 py-1.5 text-xs font-medium bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Addresses */}
          {activeTab === "addresses" && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-serif text-2xl font-bold text-gray-900">My Addresses</h2>
                <button className="flex items-center gap-1.5 px-4 py-2 bg-brand-700 text-white rounded-xl text-sm font-medium hover:bg-brand-800 transition-colors">
                  <Plus size={14} /> Add New
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Home", address: "House 12, Road 5, Block C, Banani, Dhaka 1213", phone: "01700000000", default: true },
                  { label: "Office", address: "Level 7, Tower B, Bashundhara City, Panthapath, Dhaka 1215", phone: "01700000001", default: false },
                ].map((addr) => (
                  <div key={addr.label} className={cn(
                    "bg-white border-2 rounded-2xl p-4 relative",
                    addr.default ? "border-brand-300" : "border-gray-100"
                  )}>
                    {addr.default && (
                      <span className="absolute top-3 right-3 text-[10px] font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full">Default</span>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={14} className="text-brand-600" />
                      <span className="font-semibold text-gray-800 text-sm">{addr.label}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1 leading-relaxed">{addr.address}</p>
                    <p className="text-xs text-gray-400">{addr.phone}</p>
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      <button className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800 font-medium">
                        <Edit2 size={11} /> Edit
                      </button>
                      {!addr.default && (
                        <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 font-medium">
                          <XCircle size={11} /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {activeTab === "reviews" && (
            <div className="animate-fade-in">
              <h2 className="font-serif text-2xl font-bold text-gray-900 mb-5">My Reviews</h2>
              <div className="space-y-4">
                {[
                  { product: "Hand-Woven Muslin Saree", rating: 5, comment: "Absolutely gorgeous quality. The fabric is incredibly soft!", date: "June 10, 2024", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100&q=60" },
                  { product: "Block Print Punjabi", rating: 4, comment: "Very good quality, loved the design. Slightly smaller sizing.", date: "May 20, 2024", image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=100&q=60" },
                ].map((r, i) => (
                  <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="relative w-12 h-14 rounded-xl overflow-hidden bg-brand-50 shrink-0">
                        <Image src={r.image} alt={r.product} fill
            sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-sm">{r.product}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} size={12} className={cn(s <= r.rating ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200")} />
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{r.date}</p>
                      </div>
                      <button className="text-xs text-brand-600 hover:underline flex items-center gap-1">
                        <Edit2 size={11} /> Edit
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings */}
          {activeTab === "settings" && (
            <div className="animate-fade-in space-y-5">
              <h2 className="font-serif text-2xl font-bold text-gray-900">Account Settings</h2>

              {/* Profile */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><User size={16} className="text-brand-600" /> Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Full Name", value: user.name, type: "text" },
                    { label: "Phone Number", value: user.phone, type: "tel" },
                    { label: "Email Address", value: user.email, type: "email" },
                    { label: "Date of Birth", value: "", type: "date" },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">{field.label}</label>
                      <input
                        defaultValue={field.value}
                        type={field.type}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-400 text-sm"
                      />
                    </div>
                  ))}
                </div>
                <button className="mt-4 px-6 py-2.5 bg-brand-700 text-white rounded-xl text-sm font-medium hover:bg-brand-800 transition-colors">
                  Save Changes
                </button>
              </div>

              {/* Notifications */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Bell size={16} className="text-brand-600" /> Notifications</h3>
                <div className="space-y-3">
                  {[
                    { label: "Order Updates", desc: "SMS and email for order status changes", enabled: true },
                    { label: "Promotional Offers", desc: "Deals, flash sales and special discounts", enabled: true },
                    { label: "New Arrivals", desc: "Be first to know about new products", enabled: false },
                    { label: "Wishlist Alerts", desc: "Price drop alerts for your wishlist", enabled: true },
                  ].map((n) => (
                    <div key={n.label} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{n.label}</p>
                        <p className="text-xs text-gray-400">{n.desc}</p>
                      </div>
                      <button className={cn(
                        "w-11 h-6 rounded-full transition-colors relative",
                        n.enabled ? "bg-brand-600" : "bg-gray-200"
                      )}>
                        <span className={cn(
                          "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all",
                          n.enabled ? "right-0.5" : "left-0.5"
                        )} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Shield size={16} className="text-brand-600" /> Security</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-brand-200 transition-colors">
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-800">Change Password</p>
                      <p className="text-xs text-gray-400">Update your account password</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-brand-200 transition-colors">
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-800">Two-Factor Authentication</p>
                      <p className="text-xs text-gray-400">Add extra security with OTP</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300" />
                  </button>
                </div>
                <button className="mt-4 w-full py-2.5 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {activeTab === "wishlist" && (
            <div className="animate-fade-in text-center py-10">
              <Heart size={48} className="text-brand-200 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">View your full wishlist page</p>
              <Link href="/wishlist" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-700 text-white rounded-xl font-medium hover:bg-brand-800 transition-colors text-sm">
                Go to Wishlist <ChevronRight size={15} />
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
