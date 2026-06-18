import { Types } from "mongoose";
import { AppError } from "../../errors/AppError.js";
import { httpStatus } from "../../constants/httpStatus.js";
import { Product } from "../product/product.model.js";
import { Cart } from "./cart.model.js";

type TAddToCartPayload = {
  productId: string;
  variantId: string;
  quantity: number;
};

type TUpdateCartItemPayload = {
  quantity: number;
};

const recalculateCart = (cart: any) => {
  cart.totalItems = cart.items.reduce((sum: number, item: any) => {
    return sum + item.quantity;
  }, 0);

  cart.subtotal = cart.items.reduce((sum: number, item: any) => {
    item.itemTotal = item.unitPrice * item.quantity;
    return sum + item.itemTotal;
  }, 0);

  return cart;
};

const getOrCreateCart = async (userId: string) => {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
      totalItems: 0,
      subtotal: 0,
    });
  }

  return cart;
};

const getMyCart = async (userId: string) => {
  const cart = await getOrCreateCart(userId);

  return cart;
};

const addToCart = async (userId: string, payload: TAddToCartPayload) => {
  const product = await Product.findOne({
    _id: payload.productId,
    status: "ACTIVE",
  });

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }

  const variant = product.variants.find((item) => {
    return String(item._id) === payload.variantId && item.isActive;
  });

  if (!variant) {
    throw new AppError(httpStatus.NOT_FOUND, "Product variant not found");
  }

  const cart = await getOrCreateCart(userId);

  const existingItem = cart.items.find((item) => {
    return (
      String(item.product) === payload.productId &&
      String(item.variantId) === payload.variantId
    );
  });

  const newQuantity = existingItem
    ? existingItem.quantity + payload.quantity
    : payload.quantity;

  if (variant.stock < newQuantity) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Only ${variant.stock} item(s) available in stock`,
    );
  }

  if (existingItem) {
    existingItem.quantity = newQuantity;
    existingItem.unitPrice = variant.sellingPrice;
    existingItem.itemTotal = existingItem.quantity * existingItem.unitPrice;
  } else {
    cart.items.push({
      product: new Types.ObjectId(payload.productId),
      variantId: new Types.ObjectId(payload.variantId),
      sku: variant.sku,
      name: product.name,
      image: product.images?.[0],
      size: variant.size,
      color: variant.color,
      unitPrice: variant.sellingPrice,
      quantity: payload.quantity,
      itemTotal: variant.sellingPrice * payload.quantity,
    });
  }

  recalculateCart(cart);
  await cart.save();

  return cart;
};

const updateCartItem = async (
  userId: string,
  itemId: string,
  payload: TUpdateCartItemPayload,
) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new AppError(httpStatus.NOT_FOUND, "Cart not found");
  }

  const cartItem = cart.items.find((item) => {
    return String(item._id) === itemId;
  });

  if (!cartItem) {
    throw new AppError(httpStatus.NOT_FOUND, "Cart item not found");
  }

  const product = await Product.findOne({
    _id: cartItem.product,
    status: "ACTIVE",
  });

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }

  const variant = product.variants.find((item) => {
    return String(item._id) === String(cartItem.variantId) && item.isActive;
  });

  if (!variant) {
    throw new AppError(httpStatus.NOT_FOUND, "Product variant not found");
  }

  if (variant.stock < payload.quantity) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Only ${variant.stock} item(s) available in stock`,
    );
  }

  cartItem.quantity = payload.quantity;
  cartItem.unitPrice = variant.sellingPrice;
  cartItem.itemTotal = cartItem.quantity * cartItem.unitPrice;

  recalculateCart(cart);
  await cart.save();

  return cart;
};

const removeCartItem = async (userId: string, itemId: string) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new AppError(httpStatus.NOT_FOUND, "Cart not found");
  }

  const itemExists = cart.items.some((item) => {
    return String(item._id) === itemId;
  });

  if (!itemExists) {
    throw new AppError(httpStatus.NOT_FOUND, "Cart item not found");
  }

  cart.items = cart.items.filter((item) => {
    return String(item._id) !== itemId;
  });

  recalculateCart(cart);
  await cart.save();

  return cart;
};

const clearCart = async (userId: string) => {
  const cart = await getOrCreateCart(userId);

  cart.items = [];
  cart.totalItems = 0;
  cart.subtotal = 0;

  await cart.save();

  return cart;
};

export const CartService = {
  getMyCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
