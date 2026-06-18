import { Schema, model } from "mongoose";
import { IProduct, IProductVariant } from "./product.interface.js";

const productVariantSchema = new Schema<IProductVariant>(
  {
    sku: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    size: {
      type: String,
      trim: true,
    },

    color: {
      type: String,
      trim: true,
    },

    colorCode: {
      type: String,
      trim: true,
    },

    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    lowStockAlert: {
      type: Number,
      default: 5,
      min: 0,
    },

    warehouse: {
      type: String,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: true,
  },
);

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: "text",
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    shortDescription: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    brand: {
      type: String,
      trim: true,
      index: true,
    },

    images: {
      type: [String],
      default: [],
    },

    basePurchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    baseSellingPrice: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },

    variants: {
      type: [productVariantSchema],
      default: [],
    },

    totalStock: {
      type: Number,
      default: 0,
      index: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    metaTitle: {
      type: String,
      trim: true,
    },

    metaDescription: {
      type: String,
      trim: true,
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "INACTIVE"],
      default: "DRAFT",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ "variants.sku": 1 }, { unique: true, sparse: true });

productSchema.pre("save", function () {
  this.totalStock = this.variants.reduce((sum, variant) => {
    return sum + Number(variant.stock || 0);
  }, 0);
});

export const Product = model<IProduct>("Product", productSchema);
