import { Product, Category } from "@/types";

export const categories: Category[] = [
  { id: "1", name: "Women", slug: "women", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80", productCount: 245 },
  { id: "2", name: "Men", slug: "men", image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&q=80", productCount: 189 },
  { id: "3", name: "Kids", slug: "kids", image: "https://images.unsplash.com/photo-1560472355-536de3962603?w=400&q=80", productCount: 97 },
  { id: "4", name: "Home & Living", slug: "home-living", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80", productCount: 153 },
  { id: "5", name: "Jewellery", slug: "jewellery", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80", productCount: 78 },
  { id: "6", name: "Accessories", slug: "accessories", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80", productCount: 112 },
];

export const products: Product[] = [
  {
    id: "1", name: "Hand-Woven Muslin Saree", slug: "hand-woven-muslin-saree",
    description: "Exquisite hand-woven muslin saree crafted by skilled artisans of Bangladesh. Features intricate jamdani motifs.",
    price: 4500, originalPrice: 6000,
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
      "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80",
    ],
    category: "women", subcategory: "sarees", tags: ["saree", "muslin", "handwoven"],
    variants: {
      colors: [
        { name: "Crimson Red", hex: "#DC143C" },
        { name: "Royal Blue", hex: "#4169E1" },
        { name: "Forest Green", hex: "#228B22" },
        { name: "Golden", hex: "#FFD700" },
      ]
    },
    stock: 15, sku: "WS-MUS-001", rating: 4.8, reviewCount: 124, isFeatured: true, isBestseller: true,
  },
  {
    id: "2", name: "Aarong Nakshi Kantha Kurti", slug: "nakshi-kantha-kurti",
    description: "Beautiful kurti with traditional Nakshi Kantha embroidery, crafted by rural women artisans.",
    price: 1850, originalPrice: 2200,
    images: [
      "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
    ],
    category: "women", subcategory: "kurtis", tags: ["kurti", "kantha", "embroidery"],
    variants: {
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      colors: [
        { name: "Off White", hex: "#FAF0E6" },
        { name: "Mustard", hex: "#FFDB58" },
        { name: "Rust", hex: "#B7410E" },
      ]
    },
    stock: 32, sku: "WK-NKK-002", rating: 4.6, reviewCount: 89, isNew: true,
  },
  {
    id: "3", name: "Block Print Punjabi", slug: "block-print-punjabi",
    description: "Elegant hand block-printed punjabi in premium cotton. Perfect for Eid and festive occasions.",
    price: 2200, originalPrice: 2800,
    images: [
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80",
    ],
    category: "men", subcategory: "punjabi", tags: ["punjabi", "blockprint", "cotton"],
    variants: {
      sizes: ["S", "M", "L", "XL", "XXL", "3XL"],
      colors: [
        { name: "White", hex: "#FFFFFF" },
        { name: "Sky Blue", hex: "#87CEEB" },
        { name: "Beige", hex: "#F5F5DC" },
      ]
    },
    stock: 28, sku: "MP-BPP-003", rating: 4.7, reviewCount: 156, isFeatured: true,
  },
  {
    id: "4", name: "Terracotta Decorative Pot", slug: "terracotta-decorative-pot",
    description: "Handcrafted terracotta pot with traditional Bengali motifs. Perfect home decor piece.",
    price: 750, originalPrice: 950,
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
    ],
    category: "home-living", subcategory: "decor", tags: ["terracotta", "decor", "handcraft"],
    variants: { sizes: ["Small", "Medium", "Large"] },
    stock: 45, sku: "HL-TRP-004", rating: 4.5, reviewCount: 67, isNew: true,
  },
  {
    id: "5", name: "Silver Filigree Necklace", slug: "silver-filigree-necklace",
    description: "Delicate silver filigree necklace inspired by traditional Bengali craftsmanship.",
    price: 3200, originalPrice: 4000,
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80",
    ],
    category: "jewellery", subcategory: "necklaces", tags: ["silver", "filigree", "traditional"],
    variants: {},
    stock: 12, sku: "JW-SFN-005", rating: 4.9, reviewCount: 43, isFeatured: true,
  },
  {
    id: "6", name: "Jamdani Panjabi", slug: "jamdani-panjabi",
    description: "Premium jamdani fabric panjabi with intricate woven patterns. A true masterpiece.",
    price: 5500, originalPrice: 7000,
    images: [
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80",
    ],
    category: "men", subcategory: "punjabi", tags: ["jamdani", "panjabi", "premium"],
    variants: {
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: [{ name: "Ivory", hex: "#FFFFF0" }, { name: "Light Grey", hex: "#D3D3D3" }]
    },
    stock: 8, sku: "MP-JDP-006", rating: 4.9, reviewCount: 28, isBestseller: true,
  },
  {
    id: "7", name: "Kids Cotton Frock", slug: "kids-cotton-frock",
    description: "Adorable hand-embroidered cotton frock for girls. Comfortable and vibrant.",
    price: 850, originalPrice: 1100,
    images: [
      "https://images.unsplash.com/photo-1560472355-536de3962603?w=600&q=80",
    ],
    category: "kids", subcategory: "girls", tags: ["kids", "frock", "cotton"],
    variants: {
      sizes: ["2-3Y", "3-4Y", "4-5Y", "5-6Y", "6-7Y"],
      colors: [{ name: "Pink", hex: "#FFB6C1" }, { name: "Yellow", hex: "#FFFF99" }]
    },
    stock: 54, sku: "KD-GFR-007", rating: 4.7, reviewCount: 91, isNew: true,
  },
  {
    id: "8", name: "Bamboo Serving Tray", slug: "bamboo-serving-tray",
    description: "Eco-friendly bamboo serving tray with handles. Sustainably sourced from Bangladesh.",
    price: 1200, originalPrice: 1500,
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
    ],
    category: "home-living", subcategory: "kitchen", tags: ["bamboo", "eco", "kitchen"],
    variants: { sizes: ["Small", "Large"] },
    stock: 38, sku: "HL-BST-008", rating: 4.4, reviewCount: 52,
  },
];

export const heroSlides = [
  {
    id: 1,
    title: "Eid Collection 2024",
    subtitle: "Celebrate with timeless elegance",
    description: "Discover our exclusive hand-crafted pieces made by skilled artisans of Bangladesh",
    cta: "Shop Eid Collection",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1400&q=90",
    href: "/category/women",
    badge: "New Arrivals",
  },
  {
    id: 2,
    title: "Men's Festive Wear",
    subtitle: "Look your finest this season",
    description: "Premium punjabis and panjabis crafted with finest muslin and jamdani fabrics",
    cta: "Explore Men's",
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1400&q=90",
    href: "/category/men",
    badge: "Bestsellers",
  },
  {
    id: 3,
    title: "Home & Artisan Crafts",
    subtitle: "Bring heritage into your home",
    description: "Unique terracotta, bamboo, and brass pieces — each with a story to tell",
    cta: "Explore Home",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1400&q=90",
    href: "/category/home-living",
    badge: "Handcrafted",
  },
];
