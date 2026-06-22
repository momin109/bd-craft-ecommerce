import Image from "next/image";
import Link from "next/link";

const categories = [
  { name: "WOMEN", slug: "women", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=85" },
  { name: "MEN", slug: "men", image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=85" },
  { name: "KIDS", slug: "kids", image: "https://images.unsplash.com/photo-1560472355-536de3962603?w=600&q=85" },
  { name: "HOME DECOR", slug: "home-living", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=85" },
  { name: "JEWELLERY", slug: "jewellery", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=85" },
  { name: "BEAUTY", slug: "beauty", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=85" },
  { name: "LIFESTYLE", slug: "accessories", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=85" },
  { name: "FESTIVE", slug: "festive", image: "https://images.unsplash.com/photo-1609743522653-52354461eb27?w=600&q=85" },
];

export default function CategoryGrid() {
  return (
    <section className="w-full">
      {/* Top 4 — big tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4">
        {categories.slice(0, 4).map((cat) => (
          <Link
            key={cat.name}
            href={`/category/${cat.slug}`}
            className="group relative overflow-hidden"
            style={{ aspectRatio: "3/4" }}
          >
            <Image
              src={cat.image}
              alt={cat.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-all duration-500" />
            {/* Label */}
            <div className="absolute bottom-0 left-0 right-0 bg-white py-3 px-4 text-center border-t border-gray-100">
              <span className="text-xs font-semibold tracking-[0.15em] text-gray-900 group-hover:text-brand-700 transition-colors">
                {cat.name}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom 4 — slightly shorter */}
      <div className="grid grid-cols-2 md:grid-cols-4">
        {categories.slice(4).map((cat) => (
          <Link
            key={cat.name}
            href={`/category/${cat.slug}`}
            className="group relative overflow-hidden"
            style={{ aspectRatio: "3/3.2" }}
          >
            <Image
              src={cat.image}
              alt={cat.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-all duration-500" />
            <div className="absolute bottom-0 left-0 right-0 bg-white py-3 px-4 text-center border-t border-gray-100">
              <span className="text-xs font-semibold tracking-[0.15em] text-gray-900 group-hover:text-brand-700 transition-colors">
                {cat.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
