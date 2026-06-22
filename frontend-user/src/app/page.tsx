"use client";
import HeroCarousel from "@/components/home/HeroCarousel";
import AarongShowcase from "@/components/home/AarongShowcase";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import PromoBanner from "@/components/home/PromoBanner";
import TrustBadges from "@/components/home/TrustBadges";
import PromoPopup from "@/components/home/PromoPopup";
import { useProducts } from "@/hooks/queries/useProducts";
import { normalizeProductList } from "@/types/api/product";

export default function HomePage() {
  // Backend exposes a single /products listing endpoint (no dedicated
  // featured/new-arrivals/bestseller routes), so we fetch once and slice
  // client-side using whatever flags the product carries.
  const newest = useProducts({ sort: "newest", limit: 8 });
  const bestseller = useProducts({ sort: "bestseller", limit: 8 });
  const all = useProducts({ limit: 8 });

  const newestItems = normalizeProductList(newest.data);
  const bestsellerItems = normalizeProductList(bestseller.data);
  const allItems = normalizeProductList(all.data);

  return (
    <>
      <PromoPopup />
      <HeroCarousel />
      <AarongShowcase />

      <FeaturedProducts
        title="New Arrivals"
        subtitle="Just In"
        products={newestItems}
        isLoading={newest.isLoading}
        isError={newest.isError}
        onRetry={() => newest.refetch()}
        viewAllHref="/search?sort=newest"
      />

      <PromoBanner />

      <FeaturedProducts
        title="Bestsellers"
        subtitle="Most Loved"
        products={bestsellerItems}
        isLoading={bestseller.isLoading}
        isError={bestseller.isError}
        onRetry={() => bestseller.refetch()}
        viewAllHref="/search?sort=bestseller"
      />

      <FeaturedProducts
        title="Featured Collection"
        subtitle="Handpicked"
        products={allItems}
        isLoading={all.isLoading}
        isError={all.isError}
        onRetry={() => all.refetch()}
        viewAllHref="/search"
      />

      <TrustBadges />
    </>
  );
}
