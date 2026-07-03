"use client";
import { useState } from "react";
import Link from "next/link";
import {
  User,
  Package,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
  ShoppingBag,
  Star,
  RotateCcw,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
} from "lucide-react";
import { cn, formatPriceBDT } from "@/lib/utils";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthContext } from "@/context/AuthContext";
import { useMyOrders } from "@/hooks/queries/useOrders";
import { useMyReviews } from "@/hooks/queries/useReviews";
import { useUpdateProfile, useChangePassword } from "@/hooks/queries/useAuth";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { getOrderId } from "@/types/api/order";
import { getErrorMessage } from "@/lib/api/client";
import toast from "react-hot-toast";

type Tab = "dashboard" | "orders" | "reviews" | "settings";

const statusConfig: Record<
  string,
  { label: string; icon: any; color: string; bg: string }
> = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    color: "text-yellow-600",
    bg: "bg-yellow-50 border-yellow-100",
  },
  APPROVED: {
    label: "Approved",
    icon: CheckCircle2,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-100",
  },
  PROCESSING: {
    label: "Processing",
    icon: Package,
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-100",
  },
  SHIPPED: {
    label: "Shipped",
    icon: Truck,
    color: "text-indigo-600",
    bg: "bg-indigo-50 border-indigo-100",
  },
  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-50 border-green-100",
  },
  RETURNED: {
    label: "Returned",
    icon: RotateCcw,
    color: "text-orange-600",
    bg: "bg-orange-50 border-orange-100",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50 border-red-100",
  },
};

function AccountContent() {
  const { user, logout, refreshUser } = useAuthContext();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const {
    data: orders,
    isLoading: ordersLoading,
    isError: ordersError,
    refetch: refetchOrders,
  } = useMyOrders();
  const { data: reviews, isLoading: reviewsLoading } = useMyReviews();

  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const navItems: { id: Tab; label: string; icon: any; badge?: number }[] = [
    { id: "dashboard", label: "Dashboard", icon: User },
    { id: "orders", label: "My Orders", icon: Package, badge: orders?.length },
    { id: "reviews", label: "My Reviews", icon: Star },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const deliveredCount =
    orders?.filter((o) => o.orderStatus === "DELIVERED").length ?? 0;
  const returnedCount =
    orders?.filter((o) => o.orderStatus === "RETURNED").length ?? 0;
  const totalCount = orders?.length ?? 0;
  const successRate =
    totalCount > 0 ? Math.round((deliveredCount / totalCount) * 100) : 100;

  const saveProfile = () => {
    updateProfileMutation.mutate(profileForm, {
      onSuccess: async () => {
        toast.success("Profile updated");
        await refreshUser();
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  };

  const savePassword = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Please fill both password fields");
      return;
    }
    changePasswordMutation.mutate(passwordForm, {
      onSuccess: () => {
        toast.success("Password changed");
        setPasswordForm({ currentPassword: "", newPassword: "" });
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="md:col-span-1">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-3">
              <span className="font-serif text-2xl font-bold text-brand-700">
                {(user?.name || "U")[0]}
              </span>
            </div>
            <h3 className="font-semibold text-gray-800">
              {user?.name || "Customer"}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">{user?.mobile}</p>
            {user?.isMobileVerified && (
              <div className="mt-3 px-3 py-2 bg-green-50 rounded-xl border border-green-100 inline-block">
                <span className="text-xs font-semibold text-green-700">
                  ✓ Verified Customer
                </span>
              </div>
            )}
          </div>

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
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800",
                  )}
                >
                  <Icon size={16} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {!!item.badge && (
                    <span className="px-1.5 py-0.5 bg-brand-100 text-brand-700 text-[10px] font-bold rounded-full">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight size={14} className="text-gray-300" />
                </button>
              );
            })}
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </aside>

        <main className="md:col-span-3">
          {activeTab === "dashboard" && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="font-serif text-2xl font-bold text-gray-900">
                Welcome back, {(user?.name || "there").split(" ")[0]}! 👋
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    label: "Total Orders",
                    value: totalCount,
                    icon: ShoppingBag,
                    color: "text-blue-600",
                    bg: "bg-blue-50",
                  },
                  {
                    label: "Delivered",
                    value: deliveredCount,
                    icon: CheckCircle2,
                    color: "text-green-600",
                    bg: "bg-green-50",
                  },
                  {
                    label: "Returned",
                    value: returnedCount,
                    icon: RotateCcw,
                    color: "text-orange-600",
                    bg: "bg-orange-50",
                  },
                  {
                    label: "Success Rate",
                    value: `${successRate}%`,
                    icon: Star,
                    color: "text-brand-600",
                    bg: "bg-brand-50",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-white border border-gray-100 rounded-2xl p-4"
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center mb-3",
                        s.bg,
                      )}
                    >
                      <s.icon size={16} className={s.color} />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-0.5">
                      {s.value}
                    </div>
                    <div className="text-xs text-gray-400">{s.label}</div>
                  </div>
                ))}
              </div>

              {!user?.codAllowed && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-700">
                  Cash on Delivery is currently restricted on your account due
                  to your delivery success rate. Online payment is still
                  available.
                </div>
              )}

              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">Recent Orders</h3>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-xs text-brand-600 hover:underline"
                  >
                    View All
                  </button>
                </div>
                {ordersLoading && <LoadingState label="Loading orders..." />}
                {!ordersLoading && (!orders || orders.length === 0) && (
                  <EmptyState
                    title="No orders yet"
                    description="Your orders will show up here once you make a purchase."
                  />
                )}
                {!ordersLoading && orders && orders.length > 0 && (
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((order) => {
                      const s =
                        statusConfig[order.orderStatus] ?? statusConfig.PENDING;
                      const Icon = s.icon;
                      const id = getOrderId(order);
                      return (
                        <Link
                          key={id}
                          href={`/orders/${id}`}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-xl border block",
                            s.bg,
                          )}
                        >
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              #{order.orderNumber}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(order.createdAt).toLocaleDateString()} ·{" "}
                              {order.items.length} items
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-gray-800">
                              {formatPriceBDT(order.totalPayable)}
                            </span>
                            <span
                              className={cn(
                                "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-white border",
                                s.color,
                              )}
                            >
                              <Icon size={11} /> {s.label}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="animate-fade-in">
              <h2 className="font-serif text-2xl font-bold text-gray-900 mb-5">
                My Orders
              </h2>
              {ordersLoading && <LoadingState label="Loading orders..." />}
              {ordersError && (
                <ErrorState
                  message="Couldn't load your orders."
                  onRetry={() => refetchOrders()}
                />
              )}
              {!ordersLoading &&
                !ordersError &&
                (!orders || orders.length === 0) && (
                  <EmptyState
                    title="No orders yet"
                    description="When you place an order, it will appear here."
                  />
                )}
              {!ordersLoading && orders && orders.length > 0 && (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const s =
                      statusConfig[order.orderStatus] ?? statusConfig.PENDING;
                    const Icon = s.icon;
                    const id = getOrderId(order);
                    return (
                      <div
                        key={id}
                        className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-brand-200 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="font-semibold text-gray-800">
                              Order #{order.orderNumber}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString()} ·{" "}
                              {order.items.length} item
                              {order.items.length > 1 ? "s" : ""}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full border",
                              s.color,
                              s.bg,
                            )}
                          >
                            <Icon size={11} /> {s.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-bold text-gray-900">
                              {formatPriceBDT(order.totalPayable)}
                            </span>
                            {order.paymentStatus === "PAID" && (
                              <p className="text-[11px] text-green-600 mt-0.5">
                                Paid
                              </p>
                            )}
                          </div>
                          <Link
                            href={`/orders/${id}`}
                            className="px-3 py-1.5 text-xs font-medium bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition-colors"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="animate-fade-in">
              <h2 className="font-serif text-2xl font-bold text-gray-900 mb-5">
                My Reviews
              </h2>
              {reviewsLoading && <LoadingState label="Loading reviews..." />}
              {!reviewsLoading && (!reviews || reviews.length === 0) && (
                <EmptyState
                  title="No reviews yet"
                  description="Reviews you write will show up here."
                />
              )}
              {!reviewsLoading && reviews && reviews.length > 0 && (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div
                      key={r._id ?? r.id}
                      className="bg-white border border-gray-100 rounded-2xl p-5"
                    >
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={12}
                            className={cn(
                              s <= r.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-200 fill-gray-200",
                            )}
                          />
                        ))}
                        <span className="text-xs text-gray-400 ml-2">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] font-semibold px-2 py-0.5 rounded-full ml-auto",
                            r.status === "APPROVED"
                              ? "bg-green-50 text-green-600"
                              : r.status === "HIDDEN"
                                ? "bg-gray-100 text-gray-400"
                                : "bg-amber-50 text-amber-600",
                          )}
                        >
                          {r.status === "PENDING"
                            ? "Awaiting approval"
                            : r.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">
                        {r.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="animate-fade-in space-y-5">
              <h2 className="font-serif text-2xl font-bold text-gray-900">
                Account Settings
              </h2>
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User size={16} className="text-brand-600" /> Personal
                  Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                      Full Name
                    </label>
                    <input
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm((f) => ({ ...f, name: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-400 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                      Phone Number
                    </label>
                    <input
                      defaultValue={user?.mobile}
                      disabled
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                      Email
                    </label>
                    <input
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm((f) => ({ ...f, email: e.target.value }))
                      }
                      type="email"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-400 text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={saveProfile}
                  disabled={updateProfileMutation.isPending}
                  className="mt-4 px-6 py-2.5 bg-brand-700 text-white rounded-xl text-sm font-medium hover:bg-brand-800 disabled:opacity-60 transition-colors flex items-center gap-2"
                >
                  {updateProfileMutation.isPending && (
                    <Loader2 size={14} className="animate-spin" />
                  )}{" "}
                  Save Changes
                </button>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Settings size={16} className="text-brand-600" /> Change
                  Password
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                      Current Password
                    </label>
                    <input
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm((f) => ({
                          ...f,
                          currentPassword: e.target.value,
                        }))
                      }
                      type="password"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-400 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                      New Password
                    </label>
                    <input
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm((f) => ({
                          ...f,
                          newPassword: e.target.value,
                        }))
                      }
                      type="password"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-400 text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={savePassword}
                  disabled={changePasswordMutation.isPending}
                  className="mt-4 px-6 py-2.5 bg-brand-700 text-white rounded-xl text-sm font-medium hover:bg-brand-800 disabled:opacity-60 transition-colors flex items-center gap-2"
                >
                  {changePasswordMutation.isPending && (
                    <Loader2 size={14} className="animate-spin" />
                  )}{" "}
                  Update Password
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <AccountContent />
    </ProtectedRoute>
  );
}

// "use client";
// import { useState } from "react";
// import Link from "next/link";
// import {
//   User,
//   Package,
//   Heart,
//   Settings,
//   LogOut,
//   ChevronRight,
//   ShoppingBag,
//   Star,
//   RotateCcw,
//   Truck,
//   CheckCircle2,
//   Clock,
//   XCircle,
//   Loader2,
// } from "lucide-react";
// import { cn, formatPriceBDT } from "@/lib/utils";
// import ProtectedRoute from "@/components/auth/ProtectedRoute";
// import { useAuthContext } from "@/context/AuthContext";
// import { useMyOrders } from "@/hooks/queries/useOrders";
// import { useMyReviews } from "@/hooks/queries/useReviews";
// import { useUpdateProfile, useChangePassword } from "@/hooks/queries/useAuth";
// import { LoadingState } from "@/components/shared/LoadingState";
// import { ErrorState } from "@/components/shared/ErrorState";
// import { EmptyState } from "@/components/shared/EmptyState";
// import { getOrderId } from "@/types/api/order";
// import { getErrorMessage } from "@/lib/api/client";
// import toast from "react-hot-toast";

// type Tab = "dashboard" | "orders" | "reviews" | "settings";

// const statusConfig: Record<
//   string,
//   { label: string; icon: any; color: string; bg: string }
// > = {
//   PENDING: {
//     label: "Pending",
//     icon: Clock,
//     color: "text-yellow-600",
//     bg: "bg-yellow-50 border-yellow-100",
//   },
//   APPROVED: {
//     label: "Approved",
//     icon: CheckCircle2,
//     color: "text-blue-600",
//     bg: "bg-blue-50 border-blue-100",
//   },
//   PROCESSING: {
//     label: "Processing",
//     icon: Package,
//     color: "text-purple-600",
//     bg: "bg-purple-50 border-purple-100",
//   },
//   SHIPPED: {
//     label: "Shipped",
//     icon: Truck,
//     color: "text-indigo-600",
//     bg: "bg-indigo-50 border-indigo-100",
//   },
//   DELIVERED: {
//     label: "Delivered",
//     icon: CheckCircle2,
//     color: "text-green-600",
//     bg: "bg-green-50 border-green-100",
//   },
//   RETURNED: {
//     label: "Returned",
//     icon: RotateCcw,
//     color: "text-orange-600",
//     bg: "bg-orange-50 border-orange-100",
//   },
//   CANCELLED: {
//     label: "Cancelled",
//     icon: XCircle,
//     color: "text-red-600",
//     bg: "bg-red-50 border-red-100",
//   },
// };

// function AccountContent() {
//   const { user, logout, refreshUser } = useAuthContext();
//   const [activeTab, setActiveTab] = useState<Tab>("dashboard");
//   const {
//     data: orders,
//     isLoading: ordersLoading,
//     isError: ordersError,
//     refetch: refetchOrders,
//   } = useMyOrders();
//   const { data: reviews, isLoading: reviewsLoading } = useMyReviews();

//   const updateProfileMutation = useUpdateProfile();
//   const changePasswordMutation = useChangePassword();
//   const [profileForm, setProfileForm] = useState({
//     name: user?.name ?? "",
//     email: user?.email ?? "",
//   });
//   const [passwordForm, setPasswordForm] = useState({
//     currentPassword: "",
//     newPassword: "",
//   });

//   const navItems: { id: Tab; label: string; icon: any; badge?: number }[] = [
//     { id: "dashboard", label: "Dashboard", icon: User },
//     { id: "orders", label: "My Orders", icon: Package, badge: orders?.length },
//     { id: "reviews", label: "My Reviews", icon: Star },
//     { id: "settings", label: "Settings", icon: Settings },
//   ];

//   const deliveredCount =
//     orders?.filter((o) => o.orderStatus === "DELIVERED").length ?? 0;
//   const returnedCount =
//     orders?.filter((o) => o.orderStatus === "RETURNED").length ?? 0;
//   const totalCount = orders?.length ?? 0;
//   const successRate =
//     totalCount > 0 ? Math.round((deliveredCount / totalCount) * 100) : 100;

//   const saveProfile = () => {
//     updateProfileMutation.mutate(profileForm, {
//       onSuccess: async () => {
//         toast.success("Profile updated");
//         await refreshUser();
//       },
//       onError: (err) => toast.error(getErrorMessage(err)),
//     });
//   };

//   const savePassword = () => {
//     if (!passwordForm.currentPassword || !passwordForm.newPassword) {
//       toast.error("Please fill both password fields");
//       return;
//     }
//     changePasswordMutation.mutate(passwordForm, {
//       onSuccess: () => {
//         toast.success("Password changed");
//         setPasswordForm({ currentPassword: "", newPassword: "" });
//       },
//       onError: (err) => toast.error(getErrorMessage(err)),
//     });
//   };

//   return (
//     <div className="max-w-6xl mx-auto px-4 py-8">
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <aside className="md:col-span-1">
//           <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4 text-center">
//             <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-3">
//               <span className="font-serif text-2xl font-bold text-brand-700">
//                 {(user?.name || "U")[0]}
//               </span>
//             </div>
//             <h3 className="font-semibold text-gray-800">
//               {user?.name || "Customer"}
//             </h3>
//             <p className="text-xs text-gray-400 mt-0.5">{user?.mobile}</p>
//             {user?.isMobileVerified && (
//               <div className="mt-3 px-3 py-2 bg-green-50 rounded-xl border border-green-100 inline-block">
//                 <span className="text-xs font-semibold text-green-700">
//                   ✓ Verified Customer
//                 </span>
//               </div>
//             )}
//           </div>

//           <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
//             {navItems.map((item) => {
//               const Icon = item.icon;
//               return (
//                 <button
//                   key={item.id}
//                   onClick={() => setActiveTab(item.id)}
//                   className={cn(
//                     "w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors border-b border-gray-50 last:border-none",
//                     activeTab === item.id
//                       ? "bg-brand-50 text-brand-700 border-l-2 border-l-brand-600"
//                       : "text-gray-600 hover:bg-gray-50 hover:text-gray-800",
//                   )}
//                 >
//                   <Icon size={16} />
//                   <span className="flex-1 text-left">{item.label}</span>
//                   {!!item.badge && (
//                     <span className="px-1.5 py-0.5 bg-brand-100 text-brand-700 text-[10px] font-bold rounded-full">
//                       {item.badge}
//                     </span>
//                   )}
//                   <ChevronRight size={14} className="text-gray-300" />
//                 </button>
//               );
//             })}
//             <button
//               onClick={logout}
//               className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
//             >
//               <LogOut size={16} /> Sign Out
//             </button>
//           </div>
//         </aside>

//         <main className="md:col-span-3">
//           {activeTab === "dashboard" && (
//             <div className="space-y-5 animate-fade-in">
//               <h2 className="font-serif text-2xl font-bold text-gray-900">
//                 Welcome back, {(user?.name || "there").split(" ")[0]}! 👋
//               </h2>

//               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//                 {[
//                   {
//                     label: "Total Orders",
//                     value: totalCount,
//                     icon: ShoppingBag,
//                     color: "text-blue-600",
//                     bg: "bg-blue-50",
//                   },
//                   {
//                     label: "Delivered",
//                     value: deliveredCount,
//                     icon: CheckCircle2,
//                     color: "text-green-600",
//                     bg: "bg-green-50",
//                   },
//                   {
//                     label: "Returned",
//                     value: returnedCount,
//                     icon: RotateCcw,
//                     color: "text-orange-600",
//                     bg: "bg-orange-50",
//                   },
//                   {
//                     label: "Success Rate",
//                     value: `${successRate}%`,
//                     icon: Star,
//                     color: "text-brand-600",
//                     bg: "bg-brand-50",
//                   },
//                 ].map((s) => (
//                   <div
//                     key={s.label}
//                     className="bg-white border border-gray-100 rounded-2xl p-4"
//                   >
//                     <div
//                       className={cn(
//                         "w-9 h-9 rounded-xl flex items-center justify-center mb-3",
//                         s.bg,
//                       )}
//                     >
//                       <s.icon size={16} className={s.color} />
//                     </div>
//                     <div className="text-2xl font-bold text-gray-900 mb-0.5">
//                       {s.value}
//                     </div>
//                     <div className="text-xs text-gray-400">{s.label}</div>
//                   </div>
//                 ))}
//               </div>

//               {!user?.codAllowed && (
//                 <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-700">
//                   Cash on Delivery is currently restricted on your account due
//                   to your delivery success rate. Online payment is still
//                   available.
//                 </div>
//               )}

//               <div className="bg-white border border-gray-100 rounded-2xl p-5">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="font-semibold text-gray-800">Recent Orders</h3>
//                   <button
//                     onClick={() => setActiveTab("orders")}
//                     className="text-xs text-brand-600 hover:underline"
//                   >
//                     View All
//                   </button>
//                 </div>
//                 {ordersLoading && <LoadingState label="Loading orders..." />}
//                 {!ordersLoading && (!orders || orders.length === 0) && (
//                   <EmptyState
//                     title="No orders yet"
//                     description="Your orders will show up here once you make a purchase."
//                   />
//                 )}
//                 {!ordersLoading && orders && orders.length > 0 && (
//                   <div className="space-y-3">
//                     {orders.slice(0, 3).map((order) => {
//                       const s =
//                         statusConfig[order.orderStatus] ?? statusConfig.PENDING;
//                       const Icon = s.icon;
//                       const id = getOrderId(order);
//                       return (
//                         <Link
//                           key={id}
//                           href={`/orders/${id}`}
//                           className={cn(
//                             "flex items-center justify-between p-3 rounded-xl border block",
//                             s.bg,
//                           )}
//                         >
//                           <div>
//                             <p className="text-sm font-semibold text-gray-800">
//                               #{order.orderNumber}
//                             </p>
//                             <p className="text-xs text-gray-400">
//                               {new Date(order.createdAt).toLocaleDateString()} ·{" "}
//                               {order.items.length} items
//                             </p>
//                           </div>
//                           <div className="flex items-center gap-3">
//                             <span className="text-sm font-bold text-gray-800">
//                               {formatPriceBDT(order.totalPayable)}
//                             </span>
//                             <span
//                               className={cn(
//                                 "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-white border",
//                                 s.color,
//                               )}
//                             >
//                               <Icon size={11} /> {s.label}
//                             </span>
//                           </div>
//                         </Link>
//                       );
//                     })}
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {activeTab === "orders" && (
//             <div className="animate-fade-in">
//               <h2 className="font-serif text-2xl font-bold text-gray-900 mb-5">
//                 My Orders
//               </h2>
//               {ordersLoading && <LoadingState label="Loading orders..." />}
//               {ordersError && (
//                 <ErrorState
//                   message="Couldn't load your orders."
//                   onRetry={() => refetchOrders()}
//                 />
//               )}
//               {!ordersLoading &&
//                 !ordersError &&
//                 (!orders || orders.length === 0) && (
//                   <EmptyState
//                     title="No orders yet"
//                     description="When you place an order, it will appear here."
//                   />
//                 )}
//               {!ordersLoading && orders && orders.length > 0 && (
//                 <div className="space-y-4">
//                   {orders.map((order) => {
//                     const s =
//                       statusConfig[order.orderStatus] ?? statusConfig.PENDING;
//                     const Icon = s.icon;
//                     const id = getOrderId(order);
//                     return (
//                       <div
//                         key={id}
//                         className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-brand-200 transition-colors"
//                       >
//                         <div className="flex items-start justify-between mb-4">
//                           <div>
//                             <p className="font-semibold text-gray-800">
//                               Order #{order.orderNumber}
//                             </p>
//                             <p className="text-xs text-gray-400 mt-0.5">
//                               {new Date(order.createdAt).toLocaleDateString()} ·{" "}
//                               {order.items.length} item
//                               {order.items.length > 1 ? "s" : ""}
//                             </p>
//                           </div>
//                           <span
//                             className={cn(
//                               "flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full border",
//                               s.color,
//                               s.bg,
//                             )}
//                           >
//                             <Icon size={11} /> {s.label}
//                           </span>
//                         </div>
//                         <div className="flex items-center justify-between">
//                           <div>
//                             <span className="text-sm font-bold text-gray-900">
//                               {formatPriceBDT(order.totalPayable)}
//                             </span>
//                             {!order.isStockDeducted === false &&
//                               order.paymentStatus === "PAID" && (
//                                 <p className="text-[11px] text-green-600 mt-0.5">
//                                   Paid
//                                 </p>
//                               )}
//                           </div>
//                           <Link
//                             href={`/orders/${id}`}
//                             className="px-3 py-1.5 text-xs font-medium bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition-colors"
//                           >
//                             View Details
//                           </Link>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           )}

//           {activeTab === "reviews" && (
//             <div className="animate-fade-in">
//               <h2 className="font-serif text-2xl font-bold text-gray-900 mb-5">
//                 My Reviews
//               </h2>
//               {reviewsLoading && <LoadingState label="Loading reviews..." />}
//               {!reviewsLoading && (!reviews || reviews.length === 0) && (
//                 <EmptyState
//                   title="No reviews yet"
//                   description="Reviews you write will show up here."
//                 />
//               )}
//               {!reviewsLoading && reviews && reviews.length > 0 && (
//                 <div className="space-y-4">
//                   {reviews.map((r) => (
//                     <div
//                       key={r._id ?? r.id}
//                       className="bg-white border border-gray-100 rounded-2xl p-5"
//                     >
//                       <div className="flex items-center gap-1 mb-2">
//                         {[1, 2, 3, 4, 5].map((s) => (
//                           <Star
//                             key={s}
//                             size={12}
//                             className={cn(
//                               s <= r.rating
//                                 ? "fill-amber-400 text-amber-400"
//                                 : "text-gray-200 fill-gray-200",
//                             )}
//                           />
//                         ))}
//                         <span className="text-xs text-gray-400 ml-2">
//                           {new Date(r.createdAt).toLocaleDateString()}
//                         </span>
//                         <span
//                           className={cn(
//                             "text-[10px] font-semibold px-2 py-0.5 rounded-full ml-auto",
//                             r.status === "APPROVED"
//                               ? "bg-green-50 text-green-600"
//                               : r.status === "HIDDEN"
//                                 ? "bg-gray-100 text-gray-400"
//                                 : "bg-amber-50 text-amber-600",
//                           )}
//                         >
//                           {r.status === "PENDING"
//                             ? "Awaiting approval"
//                             : r.status}
//                         </span>
//                       </div>
//                       <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">
//                         {r.comment}
//                       </p>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}

//           {activeTab === "settings" && (
//             <div className="animate-fade-in space-y-5">
//               <h2 className="font-serif text-2xl font-bold text-gray-900">
//                 Account Settings
//               </h2>
//               <div className="bg-white border border-gray-100 rounded-2xl p-5">
//                 <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                   <User size={16} className="text-brand-600" /> Personal
//                   Information
//                 </h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
//                       Full Name
//                     </label>
//                     <input
//                       value={profileForm.name}
//                       onChange={(e) =>
//                         setProfileForm((f) => ({ ...f, name: e.target.value }))
//                       }
//                       className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-400 text-sm"
//                     />
//                   </div>
//                   <div>
//                     <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
//                       Phone Number
//                     </label>
//                     <input
//                       defaultValue={user?.mobile}
//                       disabled
//                       className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-400"
//                     />
//                   </div>
//                   <div>
//                     <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
//                       Email
//                     </label>
//                     <input
//                       value={profileForm.email}
//                       onChange={(e) =>
//                         setProfileForm((f) => ({ ...f, email: e.target.value }))
//                       }
//                       type="email"
//                       className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-400 text-sm"
//                     />
//                   </div>
//                 </div>
//                 <button
//                   onClick={saveProfile}
//                   disabled={updateProfileMutation.isPending}
//                   className="mt-4 px-6 py-2.5 bg-brand-700 text-white rounded-xl text-sm font-medium hover:bg-brand-800 disabled:opacity-60 transition-colors flex items-center gap-2"
//                 >
//                   {updateProfileMutation.isPending && (
//                     <Loader2 size={14} className="animate-spin" />
//                   )}{" "}
//                   Save Changes
//                 </button>
//               </div>

//               <div className="bg-white border border-gray-100 rounded-2xl p-5">
//                 <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                   <Settings size={16} className="text-brand-600" /> Change
//                   Password
//                 </h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
//                       Current Password
//                     </label>
//                     <input
//                       value={passwordForm.currentPassword}
//                       onChange={(e) =>
//                         setPasswordForm((f) => ({
//                           ...f,
//                           currentPassword: e.target.value,
//                         }))
//                       }
//                       type="password"
//                       className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-400 text-sm"
//                     />
//                   </div>
//                   <div>
//                     <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
//                       New Password
//                     </label>
//                     <input
//                       value={passwordForm.newPassword}
//                       onChange={(e) =>
//                         setPasswordForm((f) => ({
//                           ...f,
//                           newPassword: e.target.value,
//                         }))
//                       }
//                       type="password"
//                       className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-400 text-sm"
//                     />
//                   </div>
//                 </div>
//                 <button
//                   onClick={savePassword}
//                   disabled={changePasswordMutation.isPending}
//                   className="mt-4 px-6 py-2.5 bg-brand-700 text-white rounded-xl text-sm font-medium hover:bg-brand-800 disabled:opacity-60 transition-colors flex items-center gap-2"
//                 >
//                   {changePasswordMutation.isPending && (
//                     <Loader2 size={14} className="animate-spin" />
//                   )}{" "}
//                   Update Password
//                 </button>
//               </div>
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }

// export default function AccountPage() {
//   return (
//     <ProtectedRoute>
//       <AccountContent />
//     </ProtectedRoute>
//   );
// }
