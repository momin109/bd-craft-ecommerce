import HeroCarousel from "@/components/home/HeroCarousel";
import CategoryGrid from "@/components/home/CategoryGrid";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import PromoBanner from "@/components/home/PromoBanner";
import TrustBadges from "@/components/home/TrustBadges";

export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      <TrustBadges />
      <CategoryGrid />
      <FeaturedProducts
        title="New Arrivals"
        subtitle="Just In"
        filter={(p) => !!p.isNew}
        viewAllHref="/products?filter=new"
      />
      <PromoBanner />
      <FeaturedProducts
        title="Bestsellers"
        subtitle="Most Loved"
        filter={(p) => !!p.isBestseller}
        viewAllHref="/products?filter=bestseller"
      />
      <FeaturedProducts
        title="Featured Collection"
        subtitle="Handpicked"
        filter={(p) => !!p.isFeatured}
        viewAllHref="/products"
      />
    </>
  );
}
