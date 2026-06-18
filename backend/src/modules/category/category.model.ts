import { Schema, model } from "mongoose";
import { ICategory } from "./category.interface.js";

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
      trim: true,
    },

    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
      index: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const Category = model<ICategory>("Category", categorySchema);
