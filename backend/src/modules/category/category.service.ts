import { AppError } from "../../errors/AppError.js";
import { httpStatus } from "../../constants/httpStatus.js";
import { createSlug } from "../../utils/createSlug.js";
import { Category } from "./category.model.js";

type TCreateCategoryPayload = {
  name: string;
  description?: string;
  image?: string;
  parentCategory?: string;
  status?: "ACTIVE" | "INACTIVE";
  sortOrder?: number;
};

const createCategory = async (payload: TCreateCategoryPayload) => {
  const slug = createSlug(payload.name);

  const existingCategory = await Category.findOne({ slug });

  if (existingCategory) {
    throw new AppError(httpStatus.CONFLICT, "Category already exists");
  }

  const category = await Category.create({
    ...payload,
    slug,
  });

  return category;
};

const getAllCategories = async () => {
  const categories = await Category.find()
    .populate("parentCategory", "name slug")
    .sort({ sortOrder: 1, createdAt: -1 });

  return categories;
};

const getSingleCategory = async (slug: string) => {
  const category = await Category.findOne({ slug }).populate(
    "parentCategory",
    "name slug",
  );

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }

  return category;
};

const updateCategory = async (
  id: string,
  payload: Partial<TCreateCategoryPayload>,
) => {
  const updateData: Record<string, unknown> = { ...payload };

  if (payload.name) {
    updateData.slug = createSlug(payload.name);
  }

  const category = await Category.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }

  return category;
};

const deleteCategory = async (id: string) => {
  const category = await Category.findByIdAndUpdate(
    id,
    { status: "INACTIVE" },
    { new: true },
  );

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }

  return category;
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};
