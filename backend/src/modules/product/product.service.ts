import { QueryFilter } from "mongoose";
import { AppError } from "../../errors/AppError.js";
import { httpStatus } from "../../constants/httpStatus.js";
import { createSlug } from "../../utils/createSlug.js";
import { Category } from "../category/category.model.js";
import { IProduct } from "./product.interface.js";
import { Product } from "./product.model.js";

type TProductQuery = {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  size?: string;
  color?: string;
  status?: "DRAFT" | "ACTIVE" | "INACTIVE";
  sort?: string;
  page?: string;
  limit?: string;
};

const createProduct = async (payload: IProduct) => {
  const category = await Category.findById(payload.category);

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }

  const slug = createSlug(payload.name);

  const existingProduct = await Product.findOne({ slug });

  if (existingProduct) {
    throw new AppError(httpStatus.CONFLICT, "Product already exists");
  }

  const skuList = payload.variants.map((variant) => variant.sku.toUpperCase());
  const uniqueSkuList = new Set(skuList);

  if (skuList.length !== uniqueSkuList.size) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Duplicate SKU found in variants",
    );
  }

  const existingSku = await Product.findOne({
    "variants.sku": { $in: skuList },
  });

  if (existingSku) {
    throw new AppError(httpStatus.CONFLICT, "SKU already exists");
  }

  const product = await Product.create({
    ...payload,
    slug,
  });

  return product;
};

const getAllProducts = async (query: TProductQuery) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: QueryFilter<IProduct> = {};

  if (query.status) {
    filter.status = query.status;
  } else {
    filter.status = "ACTIVE";
  }

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.brand) {
    filter.brand = new RegExp(query.brand, "i");
  }

  if (query.size) {
    filter["variants.size"] = new RegExp(query.size, "i");
  }

  if (query.color) {
    filter["variants.color"] = new RegExp(query.color, "i");
  }

  if (query.minPrice || query.maxPrice) {
    filter.baseSellingPrice = {};

    if (query.minPrice) {
      filter.baseSellingPrice.$gte = Number(query.minPrice);
    }

    if (query.maxPrice) {
      filter.baseSellingPrice.$lte = Number(query.maxPrice);
    }
  }

  let sort: Record<string, 1 | -1> = { createdAt: -1 };

  if (query.sort === "price_asc") {
    sort = { baseSellingPrice: 1 };
  }

  if (query.sort === "price_desc") {
    sort = { baseSellingPrice: -1 };
  }

  if (query.sort === "stock_desc") {
    sort = { totalStock: -1 };
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: products,
  };
};

const getSingleProduct = async (slug: string) => {
  const product = await Product.findOne({ slug }).populate(
    "category",
    "name slug",
  );

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }

  return product;
};

const updateProduct = async (id: string, payload: Partial<IProduct>) => {
  const updateData: Record<string, unknown> = { ...payload };

  if (payload.name) {
    updateData.slug = createSlug(payload.name);
  }

  if (payload.variants?.length) {
    updateData.totalStock = payload.variants.reduce((sum, variant) => {
      return sum + Number(variant.stock || 0);
    }, 0);
  }

  const product = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }

  return product;
};

const deleteProduct = async (id: string) => {
  const product = await Product.findByIdAndUpdate(
    id,
    { status: "INACTIVE" },
    { new: true },
  );

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }

  return product;
};

const adjustVariantStock = async (
  productId: string,
  variantId: string,
  payload: {
    type: "INCREASE" | "DECREASE" | "SET";
    quantity: number;
    note?: string;
  },
) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }

  const variant = product.variants.find((item) => {
    return String(item._id) === variantId;
  });

  if (!variant) {
    throw new AppError(httpStatus.NOT_FOUND, "Variant not found");
  }

  if (payload.type === "INCREASE") {
    variant.stock += payload.quantity;
  }

  if (payload.type === "DECREASE") {
    if (variant.stock < payload.quantity) {
      throw new AppError(httpStatus.BAD_REQUEST, "Insufficient stock");
    }

    variant.stock -= payload.quantity;
  }

  if (payload.type === "SET") {
    variant.stock = payload.quantity;
  }

  product.totalStock = product.variants.reduce((sum, item) => {
    return sum + Number(item.stock || 0);
  }, 0);

  await product.save();

  return product;
};

const getLowStockProducts = async () => {
  const products = await Product.find({
    status: "ACTIVE",
    variants: {
      $elemMatch: {
        $expr: {
          $lte: ["$stock", "$lowStockAlert"],
        },
      },
    },
  }).populate("category", "name slug");

  return products;
};

export const ProductService = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  adjustVariantStock,
  getLowStockProducts,
};
