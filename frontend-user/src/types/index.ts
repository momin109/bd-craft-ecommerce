export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  subcategory?: string;
  tags: string[];
  variants: {
    sizes?: string[];
    colors?: ProductColor[];
  };
  stock: number;
  sku: string;
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: ProductColor;
}

export interface WishlistItem {
  product: Product;
  addedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
  subcategories?: Category[];
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  paymentStatus: "pending" | "paid" | "failed";
  courierInfo?: CourierInfo;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "returned" | "cancelled";
export type PaymentMethod = "bkash" | "nagad" | "rocket" | "card" | "cod" | "sslcommerz" | "aamarpay";

export interface Address {
  name: string;
  phone: string;
  email?: string;
  division: string;
  district: string;
  area: string;
  address: string;
  postalCode?: string;
}

export interface CourierInfo {
  provider: "steadfast" | "pathao";
  consignmentId: string;
  trackingCode: string;
  status: string;
  estimatedDelivery?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  addresses: Address[];
  successRate: number;
  totalOrders: number;
  deliveredOrders: number;
  returnedOrders: number;
  verifiedAt?: string;
}

export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  colors: string[];
  sizes: string[];
  rating?: number;
  inStock: boolean;
  sortBy: SortOption;
}

export type SortOption = "newest" | "price-asc" | "price-desc" | "rating" | "bestseller";
