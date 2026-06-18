"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  Phone,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { selectCartCount, toggleCart } from "@/store/slices/cartSlice";
import { selectWishlistItems } from "@/store/slices/wishlistSlice";
import { cn } from "@/lib/utils";
import { categories } from "@/data/products";

const navLinks = [
  { label: "Women", href: "/category/women", mega: true },
  { label: "Men", href: "/category/men", mega: true },
  { label: "Kids", href: "/category/kids", mega: true },
  { label: "Home & Living", href: "/category/home-living", mega: true },
  { label: "Jewellery", href: "/category/jewellery" },
  { label: "Sale", href: "/sale", highlight: true },
];

export default function Header() {
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector(selectCartCount);
  const wishlistItems = useAppSelector(selectWishlistItems);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Top Bar */}
      {/* <div className="bg-brand-800 text-brand-100 text-xs py-2 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Phone size={11} /> 16577 (Hotline)</span>
            <span>Free delivery on orders above ৳1,500</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/track" className="hover:text-white transition-colors">Track Order</Link>
            <Link href="/stores" className="hover:text-white transition-colors">Store Locator</Link>
          </div>
        </div>
      </div> */}

      {/* Main Header */}
      <header
        className={cn(
          "sticky top-0 z-50 bg-white transition-all duration-300",
          scrolled ? "shadow-md" : "border-b border-brand-100",
        )}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile Menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 -ml-2 text-brand-700 hover:text-brand-900"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0 mx-auto md:mx-0">
              <div className="flex flex-col items-center">
                <span className="font-serif text-2xl md:text-3xl font-bold text-brand-800 tracking-tight leading-none">
                  Shopora
                </span>
                <span className="text-[10px] tracking-[0.3em] text-brand-500 uppercase font-medium">
                  Bangladesh
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1 group",
                    link.highlight
                      ? "text-red-600 hover:text-red-700 font-semibold"
                      : "text-gray-700 hover:text-brand-700 hover:bg-brand-50",
                  )}
                >
                  {link.label}
                  {link.mega && (
                    <ChevronDown
                      size={13}
                      className="opacity-50 group-hover:opacity-100 transition-opacity"
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Action Icons */}
            <div className="flex items-center gap-1 md:gap-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-gray-600 hover:text-brand-700 transition-colors"
              >
                <Search size={20} />
              </button>
              <Link
                href="/wishlist"
                className="relative p-2 text-gray-600 hover:text-brand-700 transition-colors hidden sm:flex"
              >
                <Heart size={20} />
                {wishlistItems.length > 0 && (
                  <span
                    suppressHydrationWarning
                    className="absolute top-0.5 right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center px-1"
                  >
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
              <Link
                href="/account"
                className="p-2 text-gray-600 hover:text-brand-700 transition-colors hidden sm:flex"
              >
                <User size={20} />
              </Link>
              <button
                onClick={() => dispatch(toggleCart())}
                className="relative p-2 text-gray-600 hover:text-brand-700 transition-colors"
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span
                    suppressHydrationWarning
                    className="absolute top-0.5 right-0.5 min-w-[16px] h-4 bg-brand-600 text-white text-[10px] rounded-full flex items-center justify-center px-1"
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="border-t border-brand-100 bg-cream py-4 px-4 animate-fade-in">
            <div className="max-w-2xl mx-auto relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400"
              />
              <input
                autoFocus
                type="search"
                placeholder="Search for sarees, kurtis, panjabi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-brand-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent text-sm"
              />
              {searchQuery && (
                <Link
                  href={`/search?q=${searchQuery}`}
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-600 hover:text-brand-800 font-medium"
                >
                  Search →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-brand-100 animate-fade-in">
            <nav className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-3 py-3 rounded-lg text-sm font-medium border-b border-brand-50",
                    link.highlight
                      ? "text-red-600 font-semibold"
                      : "text-gray-700",
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 flex gap-3">
                <Link
                  href="/account"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2.5 border border-brand-200 rounded-lg text-sm text-brand-700 font-medium"
                >
                  Account
                </Link>
                <Link
                  href="/wishlist"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2.5 border border-brand-200 rounded-lg text-sm text-brand-700 font-medium"
                >
                  Wishlist ({wishlistItems.length})
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
