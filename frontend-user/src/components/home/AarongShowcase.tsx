"use client";
import Image from "next/image";
import Link from "next/link";
import { useCategories } from "@/hooks/queries/useCategories";

// Fallback static images keyed by likely category slugs — used only if backend category has no image
const FALLBACK_IMAGES: Record<string, string> = {
  women:
    "https://res.cloudinary.com/photo-1610030469983-98e550d6193c?w=600&q=85",
  men: "https://res.cloudinary.com/photo-1617137968427-85924c800a22?w=600&q=85",
  kids: "https://res.cloudinary.com/photo-1560472355-536de3962603?w=600&q=85",
  "home-living":
    "https://res.cloudinary.com/photo-1555041469-a586c61ea9bc?w=600&q=85",
  jewellery:
    "https://res.cloudinary.com/photo-1599643478518-a784e5dc4c8f?w=600&q=85",
  beauty:
    "https://res.cloudinary.com/photo-1586495777744-4e6232bf4668?w=600&q=85",
};

export default function AarongShowcase() {
  const { data: categories, isLoading } = useCategories();

  const items = (categories?.length ? categories : []).slice(0, 6);

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className="w-full skeleton rounded-sm"
                style={{ aspectRatio: "272/233" }}
              />
              <div className="mt-3 h-3 w-16 skeleton rounded" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!items.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="grid grid-cols-3 gap-4 md:gap-6">
        {items.map((cat, idx) => (
          <Link
            key={cat.id || cat.slug || idx}
            href={`/category/${cat.slug}`}
            className="group flex flex-col items-center"
          >
            <div
              className="w-full overflow-hidden rounded-sm bg-brand-50"
              style={{ aspectRatio: "272/233" }}
            >
              <div className="relative w-full h-full">
                <Image
                  src={
                    cat.image ||
                    FALLBACK_IMAGES[cat.slug] ||
                    "https://res.cloudinary.com/photo-1610030469983-98e550d6193c?w=600&q=85"
                  }
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 33vw, 272px"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            <span className="mt-3 text-xs md:text-sm font-medium text-brand-900 text-center tracking-wide group-hover:text-brand-600 transition-colors">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
