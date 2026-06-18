"use client";
import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Grid2x2, LayoutList } from "lucide-react";
import { products, categories } from "@/data/products";
import ProductCard from "@/components/product/ProductCard";
import { FilterState, SortOption } from "@/types";
import { cn } from "@/lib/utils";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "bestseller", label: "Bestseller" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export default function CategoryPage() {
  const { slug } = useParams();
  const category = categories.find((c) => c.slug === slug);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [gridView, setGridView] = useState<2 | 3>(3);
  const [openSections, setOpenSections] = useState({ price: true, color: true, size: true, rating: true });
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 10000],
    colors: [],
    sizes: [],
    inStock: false,
    sortBy: "newest",
  });

  const toggleSection = (k: keyof typeof openSections) =>
    setOpenSections((p) => ({ ...p, [k]: !p[k] }));

  const categoryProducts = useMemo(() => {
    let list = products.filter((p) => slug === "all" || p.category === slug);

    if (filters.inStock) list = list.filter((p) => p.stock > 0);
    if (filters.colors.length) list = list.filter((p) => p.variants.colors?.some((c) => filters.colors.includes(c.name)));
    if (filters.sizes.length) list = list.filter((p) => p.variants.sizes?.some((s) => filters.sizes.includes(s)));
    list = list.filter((p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]);

    switch (filters.sortBy) {
      case "price-asc": list = [...list].sort((a, b) => a.price - b.price); break;
      case "price-desc": list = [...list].sort((a, b) => b.price - a.price); break;
      case "rating": list = [...list].sort((a, b) => b.rating - a.rating); break;
      case "bestseller": list = list.filter((p) => p.isBestseller).concat(list.filter((p) => !p.isBestseller)); break;
    }
    return list;
  }, [slug, filters]);

  const allColors = [...new Set(products.flatMap((p) => p.variants.colors?.map((c) => c.name) ?? []))];
  const allSizes = [...new Set(products.flatMap((p) => p.variants.sizes ?? []))];

  const toggleFilter = (type: "colors" | "sizes", value: string) => {
    setFilters((f) => ({
      ...f,
      [type]: f[type].includes(value) ? f[type].filter((v) => v !== value) : [...f[type], value],
    }));
  };

  const activeFilterCount = filters.colors.length + filters.sizes.length + (filters.inStock ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 capitalize mb-1">
          {category?.name ?? slug}
        </h1>
        <p className="text-gray-400 text-sm">{categoryProducts.length} products found</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:border-brand-300 hover:text-brand-700 transition-all"
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span className="min-w-[18px] h-[18px] bg-brand-600 text-white text-[10px] rounded-full flex items-center justify-center px-1">
                {activeFilterCount}
              </span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button
              onClick={() => setFilters((f) => ({ ...f, colors: [], sizes: [], inStock: false }))}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={12} /> Clear All
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 border border-gray-200 rounded-lg p-0.5">
            <button onClick={() => setGridView(3)} className={cn("p-1.5 rounded", gridView === 3 ? "bg-brand-100 text-brand-700" : "text-gray-400")}>
              <Grid2x2 size={14} />
            </button>
            <button onClick={() => setGridView(2)} className={cn("p-1.5 rounded", gridView === 2 ? "bg-brand-100 text-brand-700" : "text-gray-400")}>
              <LayoutList size={14} />
            </button>
          </div>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value as SortOption }))}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-300 bg-white"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        {filtersOpen && (
          <aside className="hidden md:block w-60 shrink-0 animate-fade-in">
            <div className="sticky top-24 space-y-1">

              {/* Price Range */}
              <FilterSection title="Price Range" open={openSections.price} onToggle={() => toggleSection("price")}>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>৳{filters.priceRange[0].toLocaleString()}</span>
                    <span>৳{filters.priceRange[1].toLocaleString()}</span>
                  </div>
                  <input
                    type="range" min={0} max={10000} step={500}
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters((f) => ({ ...f, priceRange: [f.priceRange[0], +e.target.value] }))}
                    className="w-full accent-brand-600"
                  />
                  <div className="flex gap-2">
                    {[2000, 5000, 10000].map((v) => (
                      <button key={v} onClick={() => setFilters((f) => ({ ...f, priceRange: [0, v] }))}
                        className={cn("flex-1 py-1 text-[11px] border rounded-md transition-colors",
                          filters.priceRange[1] === v ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-500 hover:border-brand-300"
                        )}>
                        ৳{v / 1000}k
                      </button>
                    ))}
                  </div>
                </div>
              </FilterSection>

              {/* Colors */}
              <FilterSection title="Color" open={openSections.color} onToggle={() => toggleSection("color")}>
                <div className="flex flex-wrap gap-2">
                  {allColors.slice(0, 10).map((color) => {
                    const hex = products.flatMap((p) => p.variants.colors ?? []).find((c) => c.name === color)?.hex ?? "#ccc";
                    return (
                      <button key={color} onClick={() => toggleFilter("colors", color)}
                        title={color}
                        className={cn("w-7 h-7 rounded-full border-2 transition-all hover:scale-110",
                          filters.colors.includes(color) ? "border-brand-600 scale-110" : "border-gray-200"
                        )}
                        style={{ background: hex }}
                      />
                    );
                  })}
                </div>
              </FilterSection>

              {/* Sizes */}
              <FilterSection title="Size" open={openSections.size} onToggle={() => toggleSection("size")}>
                <div className="flex flex-wrap gap-1.5">
                  {allSizes.map((size) => (
                    <button key={size} onClick={() => toggleFilter("sizes", size)}
                      className={cn("px-2.5 py-1 border rounded-md text-xs font-medium transition-all",
                        filters.sizes.includes(size) ? "border-brand-600 bg-brand-600 text-white" : "border-gray-200 text-gray-600 hover:border-brand-300"
                      )}>
                      {size}
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* In Stock */}
              <div className="py-3 border-b border-gray-100">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => setFilters((f) => ({ ...f, inStock: e.target.checked }))}
                    className="w-4 h-4 accent-brand-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">In Stock Only</span>
                </label>
              </div>
            </div>
          </aside>
        )}

        {/* Products Grid */}
        <div className="flex-1">
          {categoryProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-5xl mb-4">🛍️</div>
              <h3 className="font-serif text-xl text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-400 text-sm mb-5">Try adjusting your filters</p>
              <button onClick={() => setFilters((f) => ({ ...f, colors: [], sizes: [], inStock: false, priceRange: [0, 10000] }))}
                className="px-5 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={cn("grid gap-4 md:gap-5",
              gridView === 3 ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"
            )}>
              {categoryProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterSection({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="py-3 border-b border-gray-100">
      <button onClick={onToggle} className="flex items-center justify-between w-full mb-3">
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
      </button>
      {open && children}
    </div>
  );
}
