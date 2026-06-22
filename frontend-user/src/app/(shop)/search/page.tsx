"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Search } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { useProducts } from "@/hooks/queries/useProducts";
import { LoadingGrid } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { ProductQueryParams, normalizeProductList, getProductId } from "@/types/api/product";

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const sort = (searchParams.get("sort") as ProductQueryParams["sort"]) ?? undefined;

  const { data, isLoading, isError, refetch } = useProducts({ search: q || undefined, sort });
  const results = normalizeProductList(data);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-gray-900 mb-1">
          {q ? `Search results for "${q}"` : "All Products"}
        </h1>
        <p className="text-gray-400 text-sm">{results.length} products found</p>
      </div>

      {isLoading && <LoadingGrid count={8} />}
      {isError && <ErrorState message="Couldn't load search results." onRetry={() => refetch()} />}

      {!isLoading && !isError && results.length === 0 && (
        <div className="text-center py-20">
          <Search size={52} className="text-brand-200 mx-auto mb-4" />
          <h3 className="font-serif text-xl text-gray-700 mb-2">No results for "{q}"</h3>
          <p className="text-gray-400 text-sm">Try searching for saree, kurti, panjabi, or jewellery</p>
        </div>
      )}

      {!isLoading && !isError && results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {results.map((p) => <ProductCard key={getProductId(p)} product={p} />)}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return <Suspense><SearchResults /></Suspense>;
}
