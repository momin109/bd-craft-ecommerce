import Image from "next/image";
import Link from "next/link";
import { categories } from "@/data/products";

export default function CategoryGrid() {
  return (
    <section className="py-14 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <p className="text-brand-500 text-xs tracking-[0.3em] uppercase font-medium mb-2">Explore</p>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-900">Shop by Category</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/category/${cat.slug}`} className="group flex flex-col items-center">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-brand-50 mb-3">
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="font-medium text-sm text-gray-800 group-hover:text-brand-700 transition-colors text-center">
              {cat.name}
            </span>
            <span className="text-xs text-gray-400 mt-0.5">{cat.productCount} items</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
