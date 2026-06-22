"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { heroSlides } from "@/data/products";
import { cn } from "@/lib/utils";

// Custom premium arrow SVG icons
function ArrowLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [direction, setDirection] = useState<"left" | "right">("left");
  const [animating, setAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const goTo = useCallback((next: number, dir: "left" | "right" = "left") => {
    if (animating || next === current) return;
    setDirection(dir);
    setPrev(current);
    setCurrent(next);
    setAnimating(true);
    setTimeout(() => {
      setPrev(null);
      setAnimating(false);
    }, 650);
  }, [animating, current]);

  const goNext = useCallback(() => {
    goTo((current + 1) % heroSlides.length, "left");
  }, [current, goTo]);

  const goPrev = useCallback(() => {
    goTo((current - 1 + heroSlides.length) % heroSlides.length, "right");
  }, [current, goTo]);

  // Auto slide
  useEffect(() => {
    if (!mounted) return;
    timerRef.current = setInterval(goNext, 5500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [mounted, goNext]);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(goNext, 5500);
  };

  const handlePrev = () => { goPrev(); resetTimer(); };
  const handleNext = () => { goNext(); resetTimer(); };
  const handleDot  = (i: number) => { goTo(i, i > current ? "left" : "right"); resetTimer(); };

  const slide = heroSlides[current];

  // Slide animation classes
  const getSlideClass = (i: number) => {
    if (i === current) {
      // entering slide
      return animating
        ? direction === "left"
          ? "translate-x-full opacity-0"
          : "-translate-x-full opacity-0"
        : "translate-x-0 opacity-100";
    }
    if (i === prev) {
      // leaving slide
      return direction === "left"
        ? "-translate-x-full opacity-0"
        : "translate-x-full opacity-0";
    }
    return "translate-x-full opacity-0 pointer-events-none";
  };

  return (
    <section
      className="relative overflow-hidden bg-brand-900 w-full"
      style={{ height: "clamp(420px, 72vh, 760px)" }}
    >
      {/* Slides */}
      {heroSlides.map((s, i) => (
        <div
          key={s.id}
          className={cn(
            "absolute inset-0 transition-all duration-[650ms] ease-in-out",
            getSlideClass(i)
          )}
          style={{ willChange: "transform, opacity" }}
        >
          <Image
            src={s.image}
            alt={s.title}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/30 to-black/60" />
        </div>
      ))}

      {/* Content — center aligned */}
      <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
        <div className="max-w-2xl mx-auto">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-[10px] font-semibold rounded-full mb-5 tracking-[0.25em] uppercase">
            {slide.badge}
          </span>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-white leading-tight mb-3 drop-shadow-sm">
            {slide.title}
          </h1>
          <p className="text-white/80 text-sm md:text-[15px] font-light mb-2 tracking-wide">
            {slide.subtitle}
          </p>
          <p className="text-white/55 text-xs md:text-sm mb-8 max-w-md mx-auto leading-relaxed">
            {slide.description}
          </p>
          <Link
            href={slide.href}
            className="inline-flex items-center gap-2 px-7 py-2.5 bg-white text-brand-800 font-semibold rounded text-[11px] tracking-[0.2em] uppercase hover:bg-brand-50 transition-all duration-200 shadow-lg"
          >
            {slide.cta}
          </Link>
        </div>
      </div>

      {/* Left Arrow */}
      <button
        onClick={handlePrev}
        aria-label="Previous slide"
        className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/15 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 hover:scale-110 transition-all duration-200"
      >
        <ArrowLeft />
      </button>

      {/* Right Arrow */}
      <button
        onClick={handleNext}
        aria-label="Next slide"
        className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/15 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 hover:scale-110 transition-all duration-200"
      >
        <ArrowRight />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => handleDot(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={cn(
              "rounded-full transition-all duration-400",
              i === current
                ? "w-7 h-[3px] bg-white"
                : "w-[6px] h-[6px] bg-white/40 hover:bg-white/70"
            )}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-6 right-6 z-20 text-white/50 text-[11px] font-medium tracking-widest">
        {String(current + 1).padStart(2, "0")} / {String(heroSlides.length).padStart(2, "0")}
      </div>
    </section>
  );
}
