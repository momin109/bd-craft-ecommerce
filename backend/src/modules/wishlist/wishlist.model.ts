import { Schema, model } from "mongoose";
import { IWishlist } from "./wishlist.interface.js";

const wishlistSchema = new Schema<IWishlist>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const Wishlist = model<IWishlist>("Wishlist", wishlistSchema);
