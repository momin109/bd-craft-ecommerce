import Image from "next/image";
import Link from "next/link";

export default function PromoBanner() {
  return (
    <section className="px-4 py-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Left large */}
        <div className="relative overflow-hidden group" style={{ aspectRatio: "4/3" }}>
          <Image
            src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=85"
            alt="Eid Special"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-brand-200 mb-1">Limited Time</p>
            <h3 className="font-serif text-2xl md:text-3xl font-bold mb-3 leading-tight">
              Eid Special<br />Collection
            </h3>
            <Link
              href="/category/women"
              className="inline-block px-5 py-2 bg-white text-brand-900 text-xs font-bold tracking-widest uppercase rounded-sm hover:bg-brand-50 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>

        {/* Right two stacked */}
        <div className="flex flex-col gap-3">
          {[
            { title: "Men's Collection", sub: "Panjabi & Punjabi", img: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=85", href: "/category/men" },
            { title: "Home & Crafts", sub: "Artisan Made Pieces", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=85", href: "/category/home-living" },
          ].map((b) => (
            <div key={b.title} className="relative overflow-hidden group flex-1" style={{ minHeight: "160px" }}>
              <Image
                src={b.img}
                alt={b.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/55 to-transparent" />
              <div className="absolute inset-0 flex items-center px-6">
                <div className="text-white">
                  <p className="text-[10px] tracking-widest uppercase text-white/70 mb-1">{b.sub}</p>
                  <h4 className="font-serif text-xl font-bold mb-2">{b.title}</h4>
                  <Link
                    href={b.href}
                    className="text-[10px] tracking-[0.15em] uppercase text-white/90 hover:text-white border-b border-white/40 hover:border-white pb-0.5 transition-colors"
                  >
                    Explore
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
