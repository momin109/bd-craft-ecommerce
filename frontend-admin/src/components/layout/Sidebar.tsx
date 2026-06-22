"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, FolderTree, ShoppingCart, Users, Tag, Sparkles,
  Star, FileBarChart, Bell, LogOut, Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/context/AuthContext";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/categories", label: "Categories", icon: FolderTree },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/coupons", label: "Coupons", icon: Tag },
  { href: "/offers", label: "Offers", icon: Sparkles },
  { href: "/reviews", label: "Reviews", icon: Star },
  { href: "/reports", label: "Reports", icon: FileBarChart },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthContext();

  return (
    <aside className="hidden lg:flex flex-col w-60 h-screen sticky top-0 bg-white border-r border-gray-100">
      <div className="px-5 py-5 border-b border-gray-100 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-brand-700 flex items-center justify-center">
          <Store size={16} className="text-white" />
        </div>
        <div>
          <p className="font-serif text-lg font-bold text-brand-800 leading-none">Shopora</p>
          <p className="text-[10px] text-gray-400 tracking-widest uppercase">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition-colors",
                active ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm shrink-0">
            {(user?.name || "A")[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
            <p className="text-[11px] text-gray-400">{user?.role}</p>
          </div>
        </div>
        <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
