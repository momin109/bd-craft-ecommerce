"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { heroSlides } from "@/data/products";
import { cn } from "@/lib/utils";

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const go = useCallback((next: number) => {
    setCurrent(next);
  }, []);

  const prev = () => go((current - 1 + heroSlides.length) % heroSlides.length);
  const next = () => go((current + 1) % heroSlides.length);

  useEffect(() => {
    if (!mounted) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % heroSlides.length), 5500);
    return () => clearInterval(t);
  }, [mounted]);

  const slide = heroSlides[current];

  return (
    <section className="relative overflow-hidden bg-brand-900" style={{ height: "clamp(320px, 60vh, 680px)" }}>
      {/* Images */}
      {heroSlides.map((s, i) => (
        <div
          key={s.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            i === current ? "opacity-100" : "opacity-0"
          )}
        >
          <Image
            src={s.image}
            alt={s.title}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 md:px-10 w-full">
          <div className="max-w-xl">
            <span className="inline-block px-3 py-1 bg-brand-500 text-white text-xs font-semibold rounded-full mb-4 tracking-widest uppercase">
              {slide.badge}
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-3">
              {slide.title}
            </h1>
            <p className="text-brand-100 text-lg md:text-xl font-light mb-2">{slide.subtitle}</p>
            <p className="text-brand-200 text-sm md:text-base mb-8 max-w-md leading-relaxed">
              {slide.description}
            </p>
            <Link
              href={slide.href}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-brand-800 font-semibold rounded-lg hover:bg-brand-50 transition-all duration-200 text-sm shadow-lg hover:shadow-xl"
            >
              {slide.cta}
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={next}
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={cn(
              "transition-all duration-300 rounded-full",
              i === current ? "w-8 h-2 bg-white" : "w-2 h-2 bg-white/50 hover:bg-white/80"
            )}
          />
        ))}
      </div>
    </section>
  );
}
