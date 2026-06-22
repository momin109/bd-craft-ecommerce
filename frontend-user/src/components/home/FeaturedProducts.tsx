"use client";
import ProductCard from "@/components/product/ProductCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ApiProduct, getProductId } from "@/types/api/product";
import { LoadingGrid } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";

interface Props {
  title: string;
  subtitle?: string;
  products?: ApiProduct[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  viewAllHref?: string;
}

export default function FeaturedProducts({
  title, subtitle, products = [], isLoading, isError, onRetry, viewAllHref,
}: Props) {
  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          {subtitle && <p className="text-brand-500 text-xs tracking-[0.3em] uppercase font-medium mb-1">{subtitle}</p>}
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-900">{title}</h2>
        </div>
        {viewAllHref && (
          <Link href={viewAllHref} className="hidden sm:flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-800 font-medium group">
            View All <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {isLoading && <LoadingGrid count={4} />}
      {isError && <ErrorState message={`Couldn't load ${title.toLowerCase()}.`} onRetry={onRetry} />}
      {!isLoading && !isError && products.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-10">No products to show right now.</p>
      )}
      {!isLoading && !isError && products.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={getProductId(product)} product={product} />
          ))}
        </div>
      )}

      {viewAllHref && (
        <div className="mt-6 sm:hidden text-center">
          <Link href={viewAllHref} className="inline-flex items-center gap-1.5 text-sm text-brand-600 font-medium">
            View All <ArrowRight size={15} />
          </Link>
        </div>
      )}
    </section>
  );
}
