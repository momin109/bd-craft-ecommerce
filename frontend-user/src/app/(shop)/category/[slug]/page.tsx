"use client";
import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Grid2x2, LayoutList } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { cn } from "@/lib/utils";
import { useCategory } from "@/hooks/queries/useCategories";
import { useProducts } from "@/hooks/queries/useProducts";
import { LoadingGrid } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { ProductQueryParams, normalizeProductList, getProductId } from "@/types/api/product";
import { getCategoryId } from "@/types/api/category";

const SORT_OPTIONS: { value: ProductQueryParams["sort"]; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "bestseller", label: "Bestseller" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: category } = useCategory(slug);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [gridView, setGridView] = useState<2 | 3>(3);
  const [openSections, setOpenSections] = useState({ price: true, color: true, size: true });
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [inStock, setInStock] = useState(false);
  const [sortBy, setSortBy] = useState<ProductQueryParams["sort"]>("newest");

  const toggleSection = (k: keyof typeof openSections) => setOpenSections((p) => ({ ...p, [k]: !p[k] }));

  const queryParams: ProductQueryParams = useMemo(() => ({
    // Backend filters products by category _id, not slug — wait for the
    // category lookup to resolve before sending the id-based filter.
    category: category ? getCategoryId(category) : undefined,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    sort: sortBy,
    inStock: inStock || undefined,
    color: colors[0],
    size: sizes[0],
  }), [category, priceRange, sortBy, inStock, colors, sizes]);

  const { data, isLoading, isError, refetch } = useProducts(queryParams);
  const products = normalizeProductList(data);

  // Static option lists — ideally these would come from a facets endpoint
  const allColors = [
    { name: "Crimson Red", hex: "#DC143C" }, { name: "Royal Blue", hex: "#4169E1" },
    { name: "Forest Green", hex: "#228B22" }, { name: "Golden", hex: "#FFD700" },
    { name: "Off White", hex: "#FAF0E6" }, { name: "Mustard", hex: "#FFDB58" },
  ];
  const allSizes = ["XS", "S", "M", "L", "XL", "XXL"];

  const toggleColor = (name: string) => setColors((c) => (c.includes(name) ? c.filter((v) => v !== name) : [name]));
  const toggleSize = (s: string) => setSizes((arr) => (arr.includes(s) ? arr.filter((v) => v !== s) : [s]));

  const activeFilterCount = colors.length + sizes.length + (inStock ? 1 : 0);
  const clearAll = () => { setColors([]); setSizes([]); setInStock(false); setPriceRange([0, 10000]); };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 capitalize mb-1">
          {category?.name ?? slug}
        </h1>
        <p className="text-gray-400 text-sm">{products.length} products found</p>
      </div>

      <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:border-brand-300 hover:text-brand-700 transition-all"
          >
            <SlidersHorizontal size={15} /> Filters
            {activeFilterCount > 0 && (
              <span className="min-w-[18px] h-[18px] bg-brand-600 text-white text-[10px] rounded-full flex items-center justify-center px-1">{activeFilterCount}</span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button onClick={clearAll} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors">
              <X size={12} /> Clear All
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 border border-gray-200 rounded-lg p-0.5">
            <button onClick={() => setGridView(3)} className={cn("p-1.5 rounded", gridView === 3 ? "bg-brand-100 text-brand-700" : "text-gray-400")}><Grid2x2 size={14} /></button>
            <button onClick={() => setGridView(2)} className={cn("p-1.5 rounded", gridView === 2 ? "bg-brand-100 text-brand-700" : "text-gray-400")}><LayoutList size={14} /></button>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as ProductQueryParams["sort"])}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-300 bg-white"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        {filtersOpen && (
          <aside className="hidden md:block w-60 shrink-0 animate-fade-in">
            <div className="sticky top-24 space-y-1">
              <FilterSection title="Price Range" open={openSections.price} onToggle={() => toggleSection("price")}>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>৳{priceRange[0].toLocaleString()}</span><span>৳{priceRange[1].toLocaleString()}</span>
                  </div>
                  <input type="range" min={0} max={10000} step={500} value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], +e.target.value])} className="w-full accent-brand-600" />
                  <div className="flex gap-2">
                    {[2000, 5000, 10000].map((v) => (
                      <button key={v} onClick={() => setPriceRange([0, v])}
                        className={cn("flex-1 py-1 text-[11px] border rounded-md transition-colors",
                          priceRange[1] === v ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-500 hover:border-brand-300")}>
                        ৳{v / 1000}k
                      </button>
                    ))}
                  </div>
                </div>
              </FilterSection>

              <FilterSection title="Color" open={openSections.color} onToggle={() => toggleSection("color")}>
                <div className="flex flex-wrap gap-2">
                  {allColors.map((color) => (
                    <button key={color.name} onClick={() => toggleColor(color.name)} title={color.name}
                      className={cn("w-7 h-7 rounded-full border-2 transition-all hover:scale-110",
                        colors.includes(color.name) ? "border-brand-600 scale-110" : "border-gray-200")}
                      style={{ background: color.hex }} />
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Size" open={openSections.size} onToggle={() => toggleSection("size")}>
                <div className="flex flex-wrap gap-1.5">
                  {allSizes.map((size) => (
                    <button key={size} onClick={() => toggleSize(size)}
                      className={cn("px-2.5 py-1 border rounded-md text-xs font-medium transition-all",
                        sizes.includes(size) ? "border-brand-600 bg-brand-600 text-white" : "border-gray-200 text-gray-600 hover:border-brand-300")}>
                      {size}
                    </button>
                  ))}
                </div>
              </FilterSection>

              <div className="py-3 border-b border-gray-100">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="w-4 h-4 accent-brand-600 rounded" />
                  <span className="text-sm font-medium text-gray-700">In Stock Only</span>
                </label>
              </div>
            </div>
          </aside>
        )}

        <div className="flex-1">
          {isLoading && <LoadingGrid count={9} />}
          {isError && <ErrorState message="Couldn't load products." onRetry={() => refetch()} />}
          {!isLoading && !isError && products.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-5xl mb-4">🛍️</div>
              <h3 className="font-serif text-xl text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-400 text-sm mb-5">Try adjusting your filters</p>
              <button onClick={clearAll} className="px-5 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
                Clear Filters
              </button>
            </div>
          )}
          {!isLoading && !isError && products.length > 0 && (
            <div className={cn("grid gap-4 md:gap-5", gridView === 3 ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1 sm:grid-cols-2")}>
              {products.map((p) => <ProductCard key={getProductId(p)} product={p} />)}
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
