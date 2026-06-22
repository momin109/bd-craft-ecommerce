"use client";
import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Star, Heart, ShoppingBag, Truck, RotateCcw, Shield, ChevronRight, Minus, Plus, Check, Loader2 } from "lucide-react";
import { useProduct, useProducts } from "@/hooks/queries/useProducts";
import { useProductReviews, useCreateReview } from "@/hooks/queries/useReviews";
import { useMyOrders } from "@/hooks/queries/useOrders";
import { useAddToCart } from "@/hooks/queries/useCart";
import { useToggleWishlist, useWishlistCheck } from "@/hooks/queries/useWishlist";
import { useAuthContext } from "@/context/AuthContext";
import { useAppDispatch } from "@/hooks/redux";
import { toggleCart } from "@/store/slices/cartSlice";
import { formatPriceBDT, cn } from "@/lib/utils";
import ProductCard from "@/components/product/ProductCard";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { getErrorMessage } from "@/lib/api/client";
import { getProductId, getVariantId, normalizeProductList, ProductVariant } from "@/types/api/product";
import { getOrderId } from "@/types/api/order";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuthContext();

  const { data: product, isLoading, isError, refetch } = useProduct(slug);
  const productId = product ? getProductId(product) : "";
  const { data: wishlistStatus } = useWishlistCheck(productId);
  const isWishlisted = !!wishlistStatus?.wishlisted;

  const addToCartMutation = useAddToCart();
  const toggleWishlistMutation = useToggleWishlist();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"desc" | "shipping" | "reviews">("desc");

  const variants = product?.variants ?? [];
  const availableSizes = [...new Set(variants.map((v) => v.size).filter(Boolean))] as string[];
  const availableColors = [...new Map(variants.filter((v) => v.color).map((v) => [v.color, v.colorCode])).entries()];

  // Resolve the exact variant matching the currently selected size/color.
  // Falls back to the first variant once the product loads so price/stock
  // always have something sensible to display before the user picks anything.
  const selectedVariant: ProductVariant | undefined = useMemo(() => {
    if (!variants.length) return undefined;
    const match = variants.find((v) =>
      (selectedSize === undefined || v.size === selectedSize) &&
      (selectedColor === undefined || v.color === selectedColor)
    );
    return match ?? variants[0];
  }, [variants, selectedSize, selectedColor]);

  if (product && selectedSize === undefined && availableSizes.length) setSelectedSize(availableSizes[0]);
  if (product && selectedColor === undefined && availableColors.length) setSelectedColor(availableColors[0][0] as string);

  const { data: relatedRaw } = useProducts(product ? { category: typeof product.category === "string" ? product.category : (product.category as any)?._id, limit: 5 } : {});
  const related = normalizeProductList(relatedRaw).filter((p) => getProductId(p) !== productId).slice(0, 4);

  const { data: reviewsData, isLoading: reviewsLoading } = useProductReviews(productId);
  const { data: myOrders } = useMyOrders();
  const createReviewMutation = useCreateReview();
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "", orderId: "" });
  const [reviewError, setReviewError] = useState("");

  // A customer can only review a product from an order where it was actually
  // delivered — surface those eligible orders as the orderId picker.
  const eligibleOrders = (myOrders ?? []).filter(
    (o) => o.orderStatus === "DELIVERED" && o.items.some((i) => i.productId === productId)
  );

  if (isLoading) return <LoadingState label="Loading product..." />;
  if (isError || !product) return <ErrorState message="Couldn't load this product." onRetry={() => refetch()} />;

  const images = product.images?.length ? product.images : ["/placeholder.jpg"];
  const price = selectedVariant?.sellingPrice ?? product.baseSellingPrice;
  const stock = selectedVariant?.stock ?? 0;

  const handleAddToCart = () => {
    if (!isAuthenticated) { router.push("/login"); return; }
    if (!selectedVariant) { toast.error("Please select a size/color"); return; }
    addToCartMutation.mutate(
      { productId, variantId: getVariantId(selectedVariant), quantity },
      {
        onSuccess: () => { dispatch(toggleCart()); toast.success("Added to bag!"); },
        onError: (err) => toast.error(getErrorMessage(err)),
      }
    );
  };

  const handleWishlist = () => {
    if (!isAuthenticated) { router.push("/login"); return; }
    toggleWishlistMutation.mutate({ productId, isWishlisted });
  };

  const submitReview = () => {
    if (!isAuthenticated) { router.push("/login"); return; }
    if (!reviewForm.orderId) { setReviewError("Select which delivered order this review is for"); return; }
    if (!reviewForm.comment.trim()) { setReviewError("Please write a comment"); return; }
    setReviewError("");
    createReviewMutation.mutate(
      { orderId: reviewForm.orderId, productId, variantId: selectedVariant ? getVariantId(selectedVariant) : undefined, rating: reviewForm.rating, comment: reviewForm.comment },
      {
        onSuccess: () => { toast.success("Review submitted! Awaiting admin approval."); setReviewForm({ rating: 5, comment: "", orderId: "" }); },
        onError: (err) => setReviewError(getErrorMessage(err)),
      }
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <ChevronRight size={12} />
        <span className="text-gray-700 truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        <div className="flex gap-3">
          <div className="flex flex-col gap-2 w-16 shrink-0">
            {images.map((img, i) => (
              <button key={i} onClick={() => setSelectedImage(i)}
                className={cn("relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                  i === selectedImage ? "border-brand-600 shadow-sm" : "border-gray-100 hover:border-brand-200")}>
                <Image src={img} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
          <div className="relative flex-1 aspect-[3/4] rounded-2xl overflow-hidden bg-brand-50">
            <Image src={images[selectedImage]} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            <button onClick={handleWishlist} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-all">
              <Heart size={18} className={cn(isWishlisted ? "fill-red-500 text-red-500" : "text-gray-500")} />
            </button>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex gap-2 mb-3">
            {product.isNew && <span className="px-2.5 py-0.5 bg-brand-100 text-brand-700 text-xs font-semibold rounded-full">New Arrival</span>}
            {product.isBestseller && <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">Bestseller</span>}
            {product.brand && <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">{product.brand}</span>}
          </div>

          <h1 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map((s) => <Star key={s} size={14} className={cn(s <= Math.round(product.averageRating ?? 0) ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200")} />)}
            </div>
            <span className="text-sm font-medium text-gray-700">{product.averageRating ?? 0}</span>
            <span className="text-sm text-gray-400">({product.reviewCount ?? 0} reviews)</span>
          </div>

          <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-gray-100">
            <span className="text-3xl font-bold text-brand-700">{formatPriceBDT(price)}</span>
          </div>

          {availableColors.length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-2.5">Color: <span className="font-normal text-gray-500">{selectedColor}</span></p>
              <div className="flex gap-2.5 flex-wrap">
                {availableColors.map(([color, hex]) => (
                  <button key={color} onClick={() => setSelectedColor(color as string)} title={color as string}
                    className={cn("w-8 h-8 rounded-full border-2 transition-all hover:scale-110 relative",
                      selectedColor === color ? "border-brand-600 scale-110" : "border-gray-200")}
                    style={{ background: (hex as string) || "#ccc" }}>
                    {selectedColor === color && <Check size={12} className="absolute inset-0 m-auto text-white drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {availableSizes.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-2.5">Size: <span className="font-normal text-gray-500">{selectedSize}</span></p>
              <div className="flex gap-2 flex-wrap">
                {availableSizes.map((size) => (
                  <button key={size} onClick={() => setSelectedSize(size)}
                    className={cn("px-3.5 py-2 border rounded-lg text-sm font-medium transition-all",
                      selectedSize === size ? "border-brand-600 bg-brand-600 text-white" : "border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-700")}>
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-2.5">Quantity</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"><Minus size={14} /></button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(stock, quantity + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"><Plus size={14} /></button>
              </div>
              <span className="text-sm text-gray-400">{stock} available</span>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending || stock === 0}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-brand-700 hover:bg-brand-800 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-70"
            >
              {addToCartMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <ShoppingBag size={18} />}
              {stock === 0 ? "Out of Stock" : "Add to Bag"}
            </button>
            <button onClick={handleWishlist} className={cn("w-12 h-12 flex items-center justify-center rounded-xl border-2 transition-all", isWishlisted ? "border-red-200 bg-red-50" : "border-gray-200 hover:border-brand-200")}>
              <Heart size={18} className={cn(isWishlisted ? "fill-red-500 text-red-500" : "text-gray-500")} />
            </button>
          </div>

          {selectedVariant?.sku && <p className="text-xs text-gray-400 mb-4">SKU: {selectedVariant.sku}</p>}

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

      <div className="mb-16">
        <div className="flex gap-0 border-b border-gray-200 mb-6">
          {(["desc", "shipping", "reviews"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn("px-6 py-3 text-sm font-medium capitalize transition-all border-b-2 -mb-px",
                activeTab === tab ? "border-brand-600 text-brand-700" : "border-transparent text-gray-500 hover:text-gray-700")}>
              {tab === "desc" ? "Description" : tab === "shipping" ? "Shipping & Returns" : `Reviews (${product.reviewCount ?? 0})`}
            </button>
          ))}
        </div>

        {activeTab === "desc" && (
          <div className="max-w-2xl prose text-gray-600 text-sm leading-relaxed animate-fade-in">
            <p className="mb-4">{product.shortDescription || product.description}</p>
            <p>{product.description}</p>
          </div>
        )}

        {activeTab === "shipping" && (
          <div className="max-w-2xl text-sm text-gray-600 space-y-4 animate-fade-in">
            <div className="p-4 bg-green-50 rounded-xl border border-green-100">
              <p className="font-semibold text-green-700 mb-1">Free Delivery</p>
              <p>On all orders above ৳1,500. Standard delivery 3-5 business days across Bangladesh.</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <p className="font-semibold text-amber-700 mb-1">Returns Policy</p>
              <p>Easy 7-day returns. Item must be in original condition with tags.</p>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="max-w-2xl animate-fade-in space-y-6">
            {isAuthenticated && (
              <div className="p-4 border border-gray-100 rounded-xl bg-gray-50">
                <p className="text-sm font-semibold text-gray-700 mb-2">Write a Review</p>
                {eligibleOrders.length === 0 ? (
                  <p className="text-xs text-gray-400">You can review this product once you have a delivered order containing it.</p>
                ) : (
                  <>
                    <select
                      value={reviewForm.orderId}
                      onChange={(e) => setReviewForm((f) => ({ ...f, orderId: e.target.value }))}
                      className="w-full mb-3 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-300 bg-white"
                    >
                      <option value="">Select your delivered order...</option>
                      {eligibleOrders.map((o) => (
                        <option key={getOrderId(o)} value={getOrderId(o)}>#{o.orderNumber} — {new Date(o.createdAt).toLocaleDateString()}</option>
                      ))}
                    </select>
                    <div className="flex gap-1 mb-3">
                      {[1,2,3,4,5].map((s) => (
                        <button key={s} onClick={() => setReviewForm((f) => ({ ...f, rating: s }))}>
                          <Star size={18} className={cn(s <= reviewForm.rating ? "fill-amber-400 text-amber-400" : "text-gray-300")} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                      placeholder="Share your experience..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-300 resize-none mb-2"
                    />
                    {reviewError && <p className="text-xs text-red-500 mb-2">{reviewError}</p>}
                    <button
                      onClick={submitReview}
                      disabled={createReviewMutation.isPending}
                      className="px-5 py-2 bg-brand-700 text-white text-sm font-medium rounded-lg hover:bg-brand-800 disabled:opacity-60 transition-colors"
                    >
                      {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                    </button>
                  </>
                )}
              </div>
            )}

            {reviewsLoading && <LoadingState label="Loading reviews..." />}

            {!reviewsLoading && (reviewsData?.length ?? 0) === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No reviews yet. Be the first to review!</p>
            )}

            {!reviewsLoading && reviewsData?.map((r) => (
              <div key={r._id ?? r.id} className="py-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm">
                      {(r.userName || "U")[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{r.userName || "Customer"}</p>
                      <div className="flex gap-0.5">{[1,2,3,4,5].map((s) => <Star key={s} size={10} className={cn(s <= r.rating ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200")} />)}</div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {related.length > 0 && (
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => <ProductCard key={getProductId(p)} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
