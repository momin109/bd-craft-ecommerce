import {
  BundleItem,
  CreateOfferPayload,
  FlashSaleItem,
  OfferStatus,
} from "@/types/api/offer";

export const statusOptions: OfferStatus[] = [
  "DRAFT",
  "SCHEDULED",
  "ACTIVE",
  "PAUSED",
  "EXPIRED",
  "INACTIVE",
];

export const emptyBundleItem: BundleItem = {
  product: "",
  variantId: "",
  quantity: 1,
};

export const emptyFlashItem: FlashSaleItem = {
  product: "",
  variantId: "",
  regularPrice: undefined,
  flashPrice: 0,
  stockLimit: undefined,
  perUserLimit: undefined,
  status: "ACTIVE",
};

export const createEmptyOfferForm = (): CreateOfferPayload => ({
  code: "",
  title: "",
  description: "",
  type: "FLASH_SALE",

  startDate: "",
  endDate: "",

  priority: 5,
  usageLimit: 100,

  bannerImage: "",

  flashSaleItems: [{ ...emptyFlashItem }],

  bundle: {
    items: [{ ...emptyBundleItem }, { ...emptyBundleItem }],
    discountType: "FIXED",
    discountValue: 0,
    maxDiscount: undefined,
  },

  status: "DRAFT",
});

export const toDateTimeLocalValue = (iso?: string) => {
  if (!iso) return "";

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return "";

  const timezoneOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - timezoneOffset);

  return localDate.toISOString().slice(0, 16);
};

export const fromDateTimeLocalToIso = (value: string) => {
  if (!value) return "";

  return new Date(value).toISOString();
};

export const cleanOptionalString = (value?: string) => {
  const trimmed = value?.trim();

  return trimmed || undefined;
};

export const cleanOptionalNumber = (value?: number) => {
  if (value === undefined || value === null) return undefined;

  const num = Number(value);

  if (Number.isNaN(num) || num <= 0) return undefined;

  return num;
};

export const getUploadUrl = (res: unknown) => {
  const data = res as any;

  return (
    data?.data?.secure_url ??
    data?.data?.url ??
    data?.secure_url ??
    data?.url ??
    data?.data?.data?.url ??
    data?.data?.data?.secure_url
  );
};

export const validateOfferForm = (form: CreateOfferPayload): string | null => {
  if (
    !form.code.trim() ||
    !form.title.trim() ||
    !form.startDate ||
    !form.endDate
  ) {
    return "Code, title, start date and end date are required";
  }

  const startDate = new Date(form.startDate);
  const endDate = new Date(form.endDate);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return "Invalid start or end date";
  }

  if (endDate <= startDate) {
    return "End date must be greater than start date";
  }

  if (form.type === "FLASH_SALE") {
    const items = form.flashSaleItems ?? [];

    if (items.length === 0) {
      return "Flash sale needs at least one product";
    }

    const itemKeys = new Set<string>();

    for (const item of items) {
      if (!item.product.trim()) {
        return "Every flash sale item needs a Product ID";
      }

      if (!item.flashPrice || Number(item.flashPrice) <= 0) {
        return "Every flash sale item needs a flash price greater than 0";
      }

      if (
        item.regularPrice &&
        item.regularPrice > 0 &&
        item.flashPrice >= item.regularPrice
      ) {
        return "Flash price must be lower than regular price";
      }

      if (
        item.stockLimit &&
        item.perUserLimit &&
        item.perUserLimit > item.stockLimit
      ) {
        return "Per user limit cannot be greater than stock limit";
      }

      const key = `${item.product}:${item.variantId || ""}`;

      if (itemKeys.has(key)) {
        return "Duplicate product/variant found in flash sale items";
      }

      itemKeys.add(key);
    }
  }

  if (form.type === "BUNDLE") {
    const items = form.bundle?.items ?? [];

    if (items.length < 2) {
      return "A bundle needs at least 2 products";
    }

    for (const item of items) {
      if (!item.product.trim()) {
        return "Every bundle item needs a Product ID";
      }

      if (!item.quantity || item.quantity < 1) {
        return "Every bundle item needs a quantity of at least 1";
      }
    }

    if (!form.bundle?.discountValue || form.bundle.discountValue <= 0) {
      return "Set a bundle discount value greater than 0";
    }

    if (
      form.bundle.discountType === "PERCENTAGE" &&
      form.bundle.discountValue > 100
    ) {
      return "Percentage discount cannot be more than 100";
    }
  }

  return null;
};

export const buildOfferPayload = (
  form: CreateOfferPayload,
): CreateOfferPayload => {
  if (form.type === "FLASH_SALE") {
    return {
      ...form,
      description: cleanOptionalString(form.description),
      bannerImage: cleanOptionalString(form.bannerImage),
      bundle: undefined,
      flashSaleItems: (form.flashSaleItems ?? []).map((item) => ({
        product: item.product.trim(),
        variantId: cleanOptionalString(item.variantId),
        regularPrice: cleanOptionalNumber(item.regularPrice),
        flashPrice: Number(item.flashPrice),
        stockLimit: cleanOptionalNumber(item.stockLimit),
        perUserLimit: cleanOptionalNumber(item.perUserLimit),
        status: item.status ?? "ACTIVE",
      })),
    };
  }

  return {
    ...form,
    description: cleanOptionalString(form.description),
    bannerImage: cleanOptionalString(form.bannerImage),
    flashSaleItems: undefined,
    bundle: {
      items: (form.bundle?.items ?? []).map((item) => ({
        product: item.product.trim(),
        variantId: cleanOptionalString(item.variantId),
        quantity: Number(item.quantity),
      })),
      discountType: form.bundle?.discountType ?? "FIXED",
      discountValue: Number(form.bundle?.discountValue ?? 0),
      maxDiscount: cleanOptionalNumber(form.bundle?.maxDiscount),
    },
  };
};
