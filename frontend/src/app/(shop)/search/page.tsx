"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Search } from "lucide-react";
import { products } from "@/data/products";
import ProductCard from "@/components/product/ProductCard";

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const results = products.filter(
    (p) => p.name.toLowerCase().includes(q.toLowerCase()) ||
           p.tags.some((t) => t.includes(q.toLowerCase())) ||
           p.category.includes(q.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-gray-900 mb-1">
          {q ? `Search results for "${q}"` : "All Products"}
        </h1>
        <p className="text-gray-400 text-sm">{results.length} products found</p>
      </div>
      {results.length === 0 ? (
        <div className="text-center py-20">
          <Search size={52} className="text-brand-200 mx-auto mb-4" />
          <h3 className="font-serif text-xl text-gray-700 mb-2">No results for "{q}"</h3>
          <p className="text-gray-400 text-sm">Try searching for saree, kurti, panjabi, or jewellery</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {results.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return <Suspense><SearchResults /></Suspense>;
}
