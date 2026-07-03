import { Types } from "mongoose";
import { AppError } from "../../errors/AppError.js";
import { httpStatus } from "../../constants/httpStatus.js";
import { Product } from "../product/product.model.js";
import { Wishlist } from "./wishlist.model.js";

const wishlistProductSelect =
  "name slug images baseSellingPrice baseRegularPrice averageRating reviewCount totalStock variants status";

const validateProductId = (productId: string) => {
  if (!Types.ObjectId.isValid(productId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid product ID");
  }
};

const getOrCreateWishlist = async (userId: string) => {
  let wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      products: [],
    });
  }

  return wishlist;
};

const getMyWishlist = async (userId: string) => {
  await getOrCreateWishlist(userId);

  const wishlist = (await Wishlist.findOne({ user: userId })
    .populate({
      path: "products",
      match: { status: "ACTIVE" },
      select: wishlistProductSelect,
    })
    .lean()) as { products?: unknown[] } | null;

  return wishlist?.products ?? [];
};

const addToWishlist = async (userId: string, productId: string) => {
  validateProductId(productId);

  const product = await Product.findOne({
    _id: productId,
    status: "ACTIVE",
  }).select("_id");

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }

  await Wishlist.findOneAndUpdate(
    { user: userId },
    {
      $setOnInsert: {
        user: new Types.ObjectId(userId),
      },
      $addToSet: {
        products: new Types.ObjectId(productId),
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  return getMyWishlist(userId);
};

const removeFromWishlist = async (userId: string, productId: string) => {
  validateProductId(productId);

  await Wishlist.findOneAndUpdate(
    { user: userId },
    {
      $setOnInsert: {
        user: new Types.ObjectId(userId),
      },
      $pull: {
        products: new Types.ObjectId(productId),
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  return getMyWishlist(userId);
};

const checkWishlistProduct = async (userId: string, productId: string) => {
  validateProductId(productId);

  const wishlist = await getOrCreateWishlist(userId);

  const isWishlisted = wishlist.products.some((id) => {
    return String(id) === productId;
  });

  return {
    productId,
    isWishlisted,
  };
};

export const WishlistService = {
  getMyWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlistProduct,
};
