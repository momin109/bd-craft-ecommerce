"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import Sidebar from "./Sidebar";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/products": "Products",
  "/categories": "Categories",
  "/orders": "Orders",
  "/customers": "Customers",
  "/coupons": "Coupons",
  "/offers": "Offers",
  "/reviews": "Reviews",
  "/reports": "Reports",
  "/notifications": "Notifications",
};

export default function Topbar() {
  const pathname = usePathname();
  const { logout } = useAuthContext();
  const [mobileOpen, setMobileOpen] = useState(false);

  const segment = "/" + (pathname.split("/")[1] ?? "");
  const title = TITLES[segment] ?? "Admin";

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 -ml-1.5 text-gray-600">
            <Menu size={22} />
          </button>
          <h1 className="font-serif text-xl font-bold text-gray-900">{title}</h1>
        </div>
        <button onClick={logout} className="lg:hidden p-2 text-red-500">
          <LogOut size={18} />
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full">
            <div className="relative h-full">
              <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-[-44px] w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md">
                <X size={18} />
              </button>
              <Sidebar />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
