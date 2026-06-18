import Image from "next/image";
import Link from "next/link";

export default function PromoBanner() {
  return (
    <section className="py-10 px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Large Banner */}
        <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden group">
          <Image
            src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80"
            alt="Eid Special"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <span className="text-xs font-semibold tracking-widest uppercase text-brand-300 block mb-1">Limited Offer</span>
            <h3 className="font-serif text-3xl font-bold mb-2">Eid Special<br />Collection</h3>
            <p className="text-sm text-gray-200 mb-4">Up to 30% off on selected items</p>
            <Link href="/category/women" className="inline-block px-5 py-2.5 bg-white text-brand-800 text-sm font-semibold rounded-lg hover:bg-brand-50 transition-colors">
              Shop Now
            </Link>
          </div>
        </div>

        {/* Two small banners */}
        <div className="grid grid-rows-2 gap-4">
          {[
            { title: "Men's Collection", sub: "Elegant Panjabis", img: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80", href: "/category/men" },
            { title: "Home & Crafts", sub: "Artisan Made", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80", href: "/category/home-living" },
          ].map((b) => (
            <div key={b.title} className="relative h-40 rounded-2xl overflow-hidden group">
              <Image
                src={b.img}
                alt={b.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
              <div className="absolute inset-0 flex items-center px-6 text-white">
                <div>
                  <p className="text-xs text-brand-200 uppercase tracking-wider mb-1">{b.sub}</p>
                  <h3 className="font-serif text-xl font-bold mb-2">{b.title}</h3>
                  <Link href={b.href} className="text-xs underline underline-offset-2 hover:no-underline">Explore →</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
