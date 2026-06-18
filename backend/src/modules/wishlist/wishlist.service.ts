import { Types } from "mongoose";
import { AppError } from "../../errors/AppError.js";
import { httpStatus } from "../../constants/httpStatus.js";
import { Product } from "../product/product.model.js";
import { Wishlist } from "./wishlist.model.js";

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
  const wishlist = await getOrCreateWishlist(userId);

  await wishlist.populate({
    path: "products",
    select:
      "name slug images baseSellingPrice averageRating reviewCount totalStock",
  });

  return wishlist;
};

const addToWishlist = async (userId: string, productId: string) => {
  const product = await Product.findOne({
    _id: productId,
    status: "ACTIVE",
  });

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }

  const wishlist = await getOrCreateWishlist(userId);

  const alreadyExists = wishlist.products.some((id) => {
    return String(id) === productId;
  });

  if (!alreadyExists) {
    wishlist.products.push(new Types.ObjectId(productId));
    await wishlist.save();
  }

  await wishlist.populate({
    path: "products",
    select:
      "name slug images baseSellingPrice averageRating reviewCount totalStock",
  });

  return wishlist;
};

const removeFromWishlist = async (userId: string, productId: string) => {
  const wishlist = await getOrCreateWishlist(userId);

  wishlist.products = wishlist.products.filter((id) => {
    return String(id) !== productId;
  });

  await wishlist.save();

  await wishlist.populate({
    path: "products",
    select:
      "name slug images baseSellingPrice averageRating reviewCount totalStock",
  });

  return wishlist;
};

const checkWishlistProduct = async (userId: string, productId: string) => {
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
