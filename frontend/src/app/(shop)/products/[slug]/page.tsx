"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Star, Heart, ShoppingBag, Truck, RotateCcw, Shield, ChevronRight, Minus, Plus, Check } from "lucide-react";
import { products } from "@/data/products";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { addToCart, toggleCart } from "@/store/slices/cartSlice";
import { toggleWishlist, selectIsWishlisted } from "@/store/slices/wishlistSlice";
import { formatPriceBDT, calculateDiscount, cn } from "@/lib/utils";
import ProductCard from "@/components/product/ProductCard";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const product = products.find((p) => p.slug === slug) ?? products[0];
  const dispatch = useAppDispatch();
  const isWishlisted = useAppSelector(selectIsWishlisted(product.id));

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(product.variants.sizes?.[0]);
  const [selectedColor, setSelectedColor] = useState(product.variants.colors?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<"desc" | "shipping" | "reviews">("desc");

  const discount = product.originalPrice ? calculateDiscount(product.originalPrice, product.price) : 0;
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    setAdding(true);
    dispatch(addToCart({ product, quantity, size: selectedSize, color: selectedColor }));
    dispatch(toggleCart());
    setTimeout(() => setAdding(false), 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <ChevronRight size={12} />
        <Link href={`/category/${product.category}`} className="hover:text-brand-600 capitalize">{product.category}</Link>
        <ChevronRight size={12} />
        <span className="text-gray-700 truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        {/* Images */}
        <div className="flex gap-3">
          {/* Thumbnails */}
          <div className="flex flex-col gap-2 w-16 shrink-0">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={cn(
                  "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                  i === selectedImage ? "border-brand-600 shadow-sm" : "border-gray-100 hover:border-brand-200"
                )}
              >
                <Image src={img} alt="" fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
              </button>
            ))}
          </div>
          {/* Main Image */}
          <div className="relative flex-1 aspect-[3/4] rounded-2xl overflow-hidden bg-brand-50">
            <Image src={product.images[selectedImage]} alt={product.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
            {discount > 0 && (
              <div className="absolute top-4 left-4 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                -{discount}% OFF
              </div>
            )}
            <button
              onClick={() => dispatch(toggleWishlist(product))}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-all"
            >
              <Heart size={18} className={cn(isWishlisted ? "fill-red-500 text-red-500" : "text-gray-500")} />
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          {/* Badges */}
          <div className="flex gap-2 mb-3">
            {product.isNew && <span className="px-2.5 py-0.5 bg-brand-100 text-brand-700 text-xs font-semibold rounded-full">New Arrival</span>}
            {product.isBestseller && <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">Bestseller</span>}
          </div>

          <h1 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={14} className={cn("transition-colors", s <= Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200")} />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-700">{product.rating}</span>
            <span className="text-sm text-gray-400">({product.reviewCount} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-gray-100">
            <span className="text-3xl font-bold text-brand-700">{formatPriceBDT(product.price)}</span>
            {product.originalPrice && (
              <span className="text-lg text-gray-400 line-through">{formatPriceBDT(product.originalPrice)}</span>
            )}
            {discount > 0 && (
              <span className="px-2 py-0.5 bg-red-50 text-red-600 text-sm font-semibold rounded">Save {formatPriceBDT(product.originalPrice! - product.price)}</span>
            )}
          </div>

          {/* Colors */}
          {product.variants.colors && (
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-2.5">
                Color: <span className="font-normal text-gray-500">{selectedColor?.name}</span>
              </p>
              <div className="flex gap-2.5 flex-wrap">
                {product.variants.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    title={color.name}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all hover:scale-110 relative",
                      selectedColor?.name === color.name ? "border-brand-600 scale-110" : "border-gray-200"
                    )}
                    style={{ background: color.hex }}
                  >
                    {selectedColor?.name === color.name && (
                      <Check size={12} className="absolute inset-0 m-auto text-white drop-shadow" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.variants.sizes && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-sm font-semibold text-gray-700">Size: <span className="font-normal text-gray-500">{selectedSize}</span></p>
                <button className="text-xs text-brand-600 underline underline-offset-2">Size Guide</button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {product.variants.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "px-3.5 py-2 border rounded-lg text-sm font-medium transition-all",
                      selectedSize === size
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-700"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-2.5">Quantity</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Minus size={14} />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Plus size={14} />
                </button>
              </div>
              <span className="text-sm text-gray-400">{product.stock} available</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-brand-700 hover:bg-brand-800 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-70"
            >
              <ShoppingBag size={18} />
              {adding ? "Added to Bag ✓" : "Add to Bag"}
            </button>
            <button
              onClick={() => dispatch(toggleWishlist(product))}
              className={cn(
                "w-12 h-12 flex items-center justify-center rounded-xl border-2 transition-all",
                isWishlisted ? "border-red-200 bg-red-50" : "border-gray-200 hover:border-brand-200"
              )}
            >
              <Heart size={18} className={cn(isWishlisted ? "fill-red-500 text-red-500" : "text-gray-500")} />
            </button>
          </div>

          {/* SKU */}
          <p className="text-xs text-gray-400 mb-4">SKU: {product.sku}</p>

          {/* Trust */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-brand-50 rounded-xl">
            {[
              { icon: Truck, text: "Free delivery above ৳1,500" },
              { icon: RotateCcw, text: "7-day easy returns" },
              { icon: Shield, text: "100% authentic" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center text-center gap-1.5">
                <Icon size={16} className="text-brand-600" />
                <span className="text-[10px] text-gray-500 leading-tight">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-16">
        <div className="flex gap-0 border-b border-gray-200 mb-6">
          {(["desc", "shipping", "reviews"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-3 text-sm font-medium capitalize transition-all border-b-2 -mb-px",
                activeTab === tab ? "border-brand-600 text-brand-700" : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {tab === "desc" ? "Description" : tab === "shipping" ? "Shipping & Returns" : `Reviews (${product.reviewCount})`}
            </button>
          ))}
        </div>

        {activeTab === "desc" && (
          <div className="max-w-2xl prose text-gray-600 text-sm leading-relaxed animate-fade-in">
            <p className="mb-4">{product.description}</p>
            <p>Each piece is carefully crafted by skilled artisans using traditional techniques passed down through generations. The quality of materials and attention to detail make this a truly exceptional product.</p>
            <ul className="mt-4 space-y-1 list-disc list-inside">
              <li>Handcrafted by skilled Bangladeshi artisans</li>
              <li>Premium quality materials</li>
              <li>Traditional techniques with modern appeal</li>
              <li>Unique, each piece may have slight variations</li>
            </ul>
          </div>
        )}

        {activeTab === "shipping" && (
          <div className="max-w-2xl text-sm text-gray-600 space-y-4 animate-fade-in">
            <div className="p-4 bg-green-50 rounded-xl border border-green-100">
              <p className="font-semibold text-green-700 mb-1">Free Delivery</p>
              <p>On all orders above ৳1,500. Standard delivery 3-5 business days across Bangladesh.</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="font-semibold text-blue-700 mb-1">Express Delivery</p>
              <p>Available in Dhaka, Chittagong, Sylhet — delivered within 24 hours for ৳150 extra.</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <p className="font-semibold text-amber-700 mb-1">Returns Policy</p>
              <p>Easy 7-day returns. Item must be in original condition with tags. Free pickup from your doorstep.</p>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="max-w-2xl animate-fade-in">
            <div className="flex items-center gap-6 p-5 bg-brand-50 rounded-xl mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-brand-700">{product.rating}</div>
                <div className="flex gap-0.5 justify-center my-1">
                  {[1,2,3,4,5].map((s) => <Star key={s} size={12} className={cn(s <= Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200")} />)}
                </div>
                <div className="text-xs text-gray-400">{product.reviewCount} reviews</div>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5,4,3,2,1].map((star) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-4">{star}</span>
                    <Star size={10} className="fill-amber-400 text-amber-400" />
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${star === 5 ? 65 : star === 4 ? 20 : star === 3 ? 10 : 5}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {[
              { name: "Fatema K.", rating: 5, comment: "Absolutely beautiful quality! The fabric is so soft and the embroidery is stunning. Delivered in 3 days.", date: "2 days ago" },
              { name: "Rahim A.", rating: 4, comment: "Very happy with the purchase. Exactly as described. Will order again!", date: "1 week ago" },
              { name: "Nusrat J.", rating: 5, comment: "Perfect for Eid! Got so many compliments. The packaging was also lovely.", date: "2 weeks ago" },
            ].map((r, i) => (
              <div key={i} className="py-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm">
                      {r.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{r.name}</p>
                      <div className="flex gap-0.5">{[1,2,3,4,5].map((s) => <Star key={s} size={10} className={cn(s <= r.rating ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200")} />)}</div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{r.date}</span>
                </div>
                <p className="text-sm text-gray-600">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
