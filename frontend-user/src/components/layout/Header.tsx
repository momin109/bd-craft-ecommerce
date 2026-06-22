"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown } from "lucide-react";
import { useAppDispatch } from "@/hooks/redux";
import { toggleCart } from "@/store/slices/cartSlice";
import { useCart } from "@/hooks/queries/useCart";
import { useWishlist } from "@/hooks/queries/useWishlist";
import { useAuthContext } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Women", href: "/category/women" },
  { label: "Men", href: "/category/men" },
  { label: "Kids", href: "/category/kids" },
  { label: "Home & Living", href: "/category/home-living" },
  { label: "Jewellery", href: "/category/jewellery" },
  { label: "Beauty", href: "/category/beauty" },
  { label: "Sale", href: "/sale", highlight: true },
];

export default function Header() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuthContext();
  const { data: cart } = useCart();
  const { data: wishlistItems } = useWishlist();
  const cartCount = cart?.items?.length ?? 0;
  const wishlistCount = wishlistItems?.length ?? 0;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Top announcement bar */}
      <div className="bg-brand-900 text-white text-center py-2 px-4 text-[11px] tracking-wider hidden md:block">
        Free delivery on orders above ৳1,500 &nbsp;|&nbsp; Use code <span className="font-bold">SAVE10</span> for 10% off
      </div>

      {/* Main Header */}
      <header className={cn(
        "sticky top-0 z-50 bg-white transition-all duration-300",
        scrolled ? "shadow-md" : "border-b border-gray-200"
      )}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-16">

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-1.5 text-gray-700"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Logo — center on mobile, left on desktop */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:left-auto">
              <div className="text-center">
                <span className="font-serif text-xl md:text-2xl font-bold text-brand-900 tracking-tight leading-none">
                  Shopora
                </span>
                <span className="block text-[8px] tracking-[0.35em] text-brand-400 uppercase font-medium mt-0.5">
                  Bangladesh
                </span>
              </div>
            </Link>

            {/* Desktop Nav — centered */}
            <nav className="hidden md:flex items-center gap-0 absolute left-1/2 -translate-x-1/2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "px-3.5 py-2 text-[11px] font-semibold tracking-wider uppercase transition-colors",
                    link.highlight
                      ? "text-red-600 hover:text-red-700"
                      : "text-gray-700 hover:text-brand-700"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Action Icons */}
            <div className="flex items-center gap-0.5 md:gap-1">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-gray-600 hover:text-brand-700 transition-colors"
              >
                <Search size={18} />
              </button>
              <Link href="/wishlist" className="relative p-2 text-gray-600 hover:text-brand-700 transition-colors hidden sm:flex">
                <Heart size={18} />
                {wishlistCount > 0 && (
                  <span suppressHydrationWarning className="absolute top-1 right-1 min-w-[14px] h-3.5 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center px-0.5">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link href="/account" className="p-2 text-gray-600 hover:text-brand-700 transition-colors hidden sm:flex">
                <User size={18} />
              </Link>
              <button
                onClick={() => dispatch(toggleCart())}
                className="relative p-2 text-gray-600 hover:text-brand-700 transition-colors"
              >
                <ShoppingBag size={18} />
                {cartCount > 0 && (
                  <span suppressHydrationWarning className="absolute top-1 right-1 min-w-[14px] h-3.5 bg-brand-700 text-white text-[9px] rounded-full flex items-center justify-center px-0.5">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Dropdown */}
        {searchOpen && (
          <div className="border-t border-gray-100 bg-white py-4 px-4 shadow-sm">
            <div className="max-w-xl mx-auto relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                type="search"
                placeholder="Search for sarees, kurtis, panjabi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery) {
                    window.location.href = `/search?q=${searchQuery}`;
                    setSearchOpen(false);
                  }
                }}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-sm bg-gray-50 focus:outline-none focus:border-brand-400 focus:bg-white text-sm"
              />
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <nav className="px-4 py-3">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center justify-between py-3 text-sm font-medium border-b border-gray-50",
                    link.highlight ? "text-red-600" : "text-gray-700"
                  )}
                >
                  {link.label}
                  <ChevronDown size={14} className="text-gray-300 -rotate-90" />
                </Link>
              ))}
              <div className="pt-3 flex gap-2">
                <Link href="/account" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 border border-gray-200 text-xs font-semibold text-gray-700 tracking-wider uppercase">
                  Account
                </Link>
                <Link href="/wishlist" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 border border-gray-200 text-xs font-semibold text-gray-700 tracking-wider uppercase">
                  Wishlist
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
