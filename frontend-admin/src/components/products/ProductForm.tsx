"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, ImagePlus, X } from "lucide-react";
import { useCategories } from "@/hooks/queries/useCategories";
import {
  useCreateProduct,
  useUpdateProduct,
} from "@/hooks/queries/useProducts";
import {
  ApiProduct,
  CreateProductPayload,
  ProductVariant,
  ProductStatus,
} from "@/types/api/product";
import { getCategoryId } from "@/types/api/category";
import { getErrorMessage } from "@/lib/api/client";
import { uploadService } from "@/services/upload.service"; // adjust path to wherever you placed it
import toast from "react-hot-toast";

interface Props {
  mode: "create" | "edit";
  productId?: string;
  initial?: ApiProduct;
}

type VariantRow = Omit<ProductVariant, "_id" | "id">;

const emptyVariant: VariantRow = {
  sku: "",
  size: "",
  color: "",
  colorCode: "#000000",
  purchasePrice: 0,
  sellingPrice: 0,
  stock: 0,
  lowStockAlert: 5,
  warehouse: "",
};

const MAX_IMAGES = 8;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type UploadingItem = { tempId: string; previewUrl: string; fileName: string };

export default function ProductForm({ mode, productId, initial }: Props) {
  const router = useRouter();
  const { data: categories } = useCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const [name, setName] = useState(initial?.name ?? "");
  const [shortDescription, setShortDescription] = useState(
    initial?.shortDescription ?? "",
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState(
    initial
      ? typeof initial.category === "string"
        ? initial.category
        : getCategoryId(initial.category as any)
      : "",
  );
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageInput, setImageInput] = useState("");
  const [uploadingItems, setUploadingItems] = useState<UploadingItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [basePurchasePrice, setBasePurchasePrice] = useState(
    initial?.basePurchasePrice ?? 0,
  );
  const [baseSellingPrice, setBaseSellingPrice] = useState(
    initial?.baseSellingPrice ?? 0,
  );
  const [variants, setVariants] = useState<VariantRow[]>(
    initial?.variants?.length ? initial.variants : [{ ...emptyVariant }],
  );
  const [tags, setTags] = useState(initial?.tags?.join(", ") ?? "");
  const [metaTitle, setMetaTitle] = useState(initial?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(
    initial?.metaDescription ?? "",
  );
  const [status, setStatus] = useState<ProductStatus>(
    initial?.status ?? "ACTIVE",
  );
  const [error, setError] = useState("");

  const addVariant = () => setVariants((v) => [...v, { ...emptyVariant }]);
  const removeVariant = (i: number) =>
    setVariants((v) => v.filter((_, idx) => idx !== i));
  const updateVariant = (i: number, patch: Partial<VariantRow>) =>
    setVariants((v) =>
      v.map((row, idx) => (idx === i ? { ...row, ...patch } : row)),
    );

  const removeImage = (i: number) =>
    setImages((arr) => arr.filter((_, idx) => idx !== i));

  const addImageByUrl = () => {
    if (imageInput.trim()) {
      setImages((arr) => [...arr, imageInput.trim()]);
      setImageInput("");
    }
  };

  const handleFiles = (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    const remainingSlots = MAX_IMAGES - images.length - uploadingItems.length;

    if (remainingSlots <= 0) {
      toast.error(`You can add up to ${MAX_IMAGES} images`);
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);
    if (files.length > filesToUpload.length) {
      toast.error(`Only ${remainingSlots} more image(s) can be added`);
    }

    filesToUpload.forEach((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: unsupported file type`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: file is larger than 5MB`);
        return;
      }

      const tempId = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const previewUrl = URL.createObjectURL(file);
      setUploadingItems((items) => [
        ...items,
        { tempId, previewUrl, fileName: file.name },
      ]);

      uploadService
        .uploadSingle(file)
        .then((res) => {
          setImages((arr) => [...arr, res.data.url]);
        })
        .catch((err) => {
          toast.error(`${file.name}: ${getErrorMessage(err)}`);
        })
        .finally(() => {
          setUploadingItems((items) =>
            items.filter((it) => it.tempId !== tempId),
          );
          URL.revokeObjectURL(previewUrl);
        });
    });
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFiles(e.target.files);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const validate = (): string | null => {
    if (!name.trim()) return "Product name is required";
    if (!description.trim()) return "Description is required";
    if (!categoryId) return "Please select a category";
    if (uploadingItems.length > 0)
      return "Please wait for images to finish uploading";
    if (images.length === 0) return "Add at least one image";
    if (variants.length === 0) return "Add at least one variant";
    for (const v of variants) {
      if (!v.sku.trim()) return "Every variant needs a SKU";
      if (v.sellingPrice <= 0)
        return "Every variant needs a selling price greater than 0";
    }
    return null;
  };

  const submit = () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");

    const payload: CreateProductPayload = {
      name,
      shortDescription: shortDescription || undefined,
      description,
      category: categoryId,
      brand: brand || undefined,
      images,
      basePurchasePrice: Number(basePurchasePrice),
      baseSellingPrice: Number(baseSellingPrice),
      variants: variants.map((v) => ({
        ...v,
        purchasePrice: Number(v.purchasePrice),
        sellingPrice: Number(v.sellingPrice),
        stock: Number(v.stock),
        lowStockAlert: Number(v.lowStockAlert),
      })),
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      metaTitle: metaTitle || undefined,
      metaDescription: metaDescription || undefined,
      status,
    };

    if (mode === "edit" && productId) {
      updateMutation.mutate(
        { id: productId, payload },
        {
          onSuccess: () => {
            toast.success("Product updated");
            router.push("/products");
          },
          onError: (err) => setError(getErrorMessage(err)),
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Product created");
          router.push("/products");
        },
        onError: (err) => setError(getErrorMessage(err)),
      });
    }
  };

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    uploadingItems.length > 0;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* ...Basic Information block unchanged... */}

      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Images *</h3>
          <button
            type="button"
            onClick={() => setShowUrlInput((s) => !s)}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            {showUrlInput ? "Hide URL input" : "Add by URL instead"}
          </button>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? "border-brand-400 bg-brand-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onFileInputChange}
          />
          <ImagePlus size={22} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">
            Drag & drop images here, or click to browse
          </p>
          <p className="text-xs text-gray-400 mt-1">
            JPG, PNG, WEBP, GIF up to 5MB • max {MAX_IMAGES} images
          </p>
        </div>

        {showUrlInput && (
          <div className="flex gap-2 mt-3">
            <input
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addImageByUrl();
                }
              }}
              placeholder="https://example.com/image.jpg"
              className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"
            />
            <button
              onClick={addImageByUrl}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Add
            </button>
          </div>
        )}

        {(images.length > 0 || uploadingItems.length > 0) && (
          <div className="flex flex-wrap gap-2 mt-3">
            {images.map((img, i) => (
              <div key={img + i} className="relative group">
                <img
                  src={img}
                  alt=""
                  className="w-16 h-20 object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
            {uploadingItems.map((item) => (
              <div
                key={item.tempId}
                className="relative w-16 h-20 rounded-lg overflow-hidden border border-gray-200"
              >
                <img
                  src={item.previewUrl}
                  alt=""
                  className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <Loader2 size={16} className="animate-spin text-white" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ...Variants, SEO, error, and action buttons unchanged... */}
    </div>
  );
}

// "use client";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Plus, Trash2, Loader2, ImagePlus, X } from "lucide-react";
// import { useCategories } from "@/hooks/queries/useCategories";
// import { useCreateProduct, useUpdateProduct } from "@/hooks/queries/useProducts";
// import { ApiProduct, CreateProductPayload, ProductVariant, ProductStatus } from "@/types/api/product";
// import { getCategoryId } from "@/types/api/category";
// import { getErrorMessage } from "@/lib/api/client";
// import toast from "react-hot-toast";

// interface Props {
//   mode: "create" | "edit";
//   productId?: string;
//   initial?: ApiProduct;
// }

// type VariantRow = Omit<ProductVariant, "_id" | "id">;

// const emptyVariant: VariantRow = { sku: "", size: "", color: "", colorCode: "#000000", purchasePrice: 0, sellingPrice: 0, stock: 0, lowStockAlert: 5, warehouse: "" };

// export default function ProductForm({ mode, productId, initial }: Props) {
//   const router = useRouter();
//   const { data: categories } = useCategories();
//   const createMutation = useCreateProduct();
//   const updateMutation = useUpdateProduct();

//   const [name, setName] = useState(initial?.name ?? "");
//   const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? "");
//   const [description, setDescription] = useState(initial?.description ?? "");
//   const [categoryId, setCategoryId] = useState(initial ? (typeof initial.category === "string" ? initial.category : getCategoryId(initial.category as any)) : "");
//   const [brand, setBrand] = useState(initial?.brand ?? "");
//   const [images, setImages] = useState<string[]>(initial?.images ?? []);
//   const [imageInput, setImageInput] = useState("");
//   const [basePurchasePrice, setBasePurchasePrice] = useState(initial?.basePurchasePrice ?? 0);
//   const [baseSellingPrice, setBaseSellingPrice] = useState(initial?.baseSellingPrice ?? 0);
//   const [variants, setVariants] = useState<VariantRow[]>(initial?.variants?.length ? initial.variants : [{ ...emptyVariant }]);
//   const [tags, setTags] = useState(initial?.tags?.join(", ") ?? "");
//   const [metaTitle, setMetaTitle] = useState(initial?.metaTitle ?? "");
//   const [metaDescription, setMetaDescription] = useState(initial?.metaDescription ?? "");
//   const [status, setStatus] = useState<ProductStatus>(initial?.status ?? "ACTIVE");
//   const [error, setError] = useState("");

//   const addVariant = () => setVariants((v) => [...v, { ...emptyVariant }]);
//   const removeVariant = (i: number) => setVariants((v) => v.filter((_, idx) => idx !== i));
//   const updateVariant = (i: number, patch: Partial<VariantRow>) =>
//     setVariants((v) => v.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

//   const addImage = () => {
//     if (imageInput.trim()) { setImages((arr) => [...arr, imageInput.trim()]); setImageInput(""); }
//   };
//   const removeImage = (i: number) => setImages((arr) => arr.filter((_, idx) => idx !== i));

//   const validate = (): string | null => {
//     if (!name.trim()) return "Product name is required";
//     if (!description.trim()) return "Description is required";
//     if (!categoryId) return "Please select a category";
//     if (images.length === 0) return "Add at least one image URL";
//     if (variants.length === 0) return "Add at least one variant";
//     for (const v of variants) {
//       if (!v.sku.trim()) return "Every variant needs a SKU";
//       if (v.sellingPrice <= 0) return "Every variant needs a selling price greater than 0";
//     }
//     return null;
//   };

//   const submit = () => {
//     const validationError = validate();
//     if (validationError) { setError(validationError); return; }
//     setError("");

//     const payload: CreateProductPayload = {
//       name, shortDescription: shortDescription || undefined, description,
//       category: categoryId, brand: brand || undefined, images,
//       basePurchasePrice: Number(basePurchasePrice), baseSellingPrice: Number(baseSellingPrice),
//       variants: variants.map((v) => ({ ...v, purchasePrice: Number(v.purchasePrice), sellingPrice: Number(v.sellingPrice), stock: Number(v.stock), lowStockAlert: Number(v.lowStockAlert) })),
//       tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
//       metaTitle: metaTitle || undefined, metaDescription: metaDescription || undefined,
//       status,
//     };

//     if (mode === "edit" && productId) {
//       updateMutation.mutate({ id: productId, payload }, {
//         onSuccess: () => { toast.success("Product updated"); router.push("/products"); },
//         onError: (err) => setError(getErrorMessage(err)),
//       });
//     } else {
//       createMutation.mutate(payload, {
//         onSuccess: () => { toast.success("Product created"); router.push("/products"); },
//         onError: (err) => setError(getErrorMessage(err)),
//       });
//     }
//   };

//   const isPending = createMutation.isPending || updateMutation.isPending;

//   return (
//     <div className="space-y-6 max-w-4xl">
//       <div className="bg-white border border-gray-100 rounded-2xl p-6">
//         <h3 className="font-semibold text-gray-800 mb-4">Basic Information</h3>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <div className="sm:col-span-2">
//             <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Product Name *</label>
//             <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
//           </div>
//           <div className="sm:col-span-2">
//             <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Short Description</label>
//             <input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
//           </div>
//           <div className="sm:col-span-2">
//             <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Description *</label>
//             <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 resize-none" />
//           </div>
//           <div>
//             <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Category *</label>
//             <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 bg-white">
//               <option value="">Select category...</option>
//               {categories?.map((c) => <option key={getCategoryId(c)} value={getCategoryId(c)}>{c.name}</option>)}
//             </select>
//           </div>
//           <div>
//             <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Brand</label>
//             <input value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
//           </div>
//           <div>
//             <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Base Purchase Price</label>
//             <input type="number" value={basePurchasePrice} onChange={(e) => setBasePurchasePrice(Number(e.target.value))} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
//           </div>
//           <div>
//             <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Base Selling Price</label>
//             <input type="number" value={baseSellingPrice} onChange={(e) => setBaseSellingPrice(Number(e.target.value))} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
//           </div>
//           <div>
//             <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Status</label>
//             <select value={status} onChange={(e) => setStatus(e.target.value as ProductStatus)} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 bg-white">
//               <option value="ACTIVE">Active</option>
//               <option value="INACTIVE">Inactive</option>
//               <option value="DRAFT">Draft</option>
//             </select>
//           </div>
//           <div>
//             <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Tags (comma separated)</label>
//             <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tshirt, cotton, men" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
//           </div>
//         </div>
//       </div>

//       <div className="bg-white border border-gray-100 rounded-2xl p-6">
//         <h3 className="font-semibold text-gray-800 mb-4">Images *</h3>
//         <div className="flex gap-2 mb-3">
//           <input
//             value={imageInput}
//             onChange={(e) => setImageInput(e.target.value)}
//             onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImage(); } }}
//             placeholder="https://example.com/image.jpg"
//             className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"
//           />
//           <button onClick={addImage} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-1.5">
//             <ImagePlus size={15} /> Add
//           </button>
//         </div>
//         {images.length > 0 && (
//           <div className="flex flex-wrap gap-2">
//             {images.map((img, i) => (
//               <div key={i} className="relative group">
//                 <img src={img} alt="" className="w-16 h-20 object-cover rounded-lg border border-gray-200" />
//                 <button onClick={() => removeImage(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
//                   <X size={11} />
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       <div className="bg-white border border-gray-100 rounded-2xl p-6">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="font-semibold text-gray-800">Variants *</h3>
//           <button onClick={addVariant} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg text-xs font-semibold hover:bg-brand-100 transition-colors">
//             <Plus size={13} /> Add Variant
//           </button>
//         </div>
//         <div className="space-y-3">
//           {variants.map((v, i) => (
//             <div key={i} className="border border-gray-100 rounded-xl p-4 relative">
//               {variants.length > 1 && (
//                 <button onClick={() => removeVariant(i)} className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors">
//                   <Trash2 size={14} />
//                 </button>
//               )}
//               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//                 <div className="col-span-2 sm:col-span-1">
//                   <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block">SKU *</label>
//                   <input value={v.sku} onChange={(e) => updateVariant(i, { sku: e.target.value })} className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400" />
//                 </div>
//                 <div>
//                   <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Size</label>
//                   <input value={v.size} onChange={(e) => updateVariant(i, { size: e.target.value })} className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400" />
//                 </div>
//                 <div>
//                   <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Color</label>
//                   <input value={v.color} onChange={(e) => updateVariant(i, { color: e.target.value })} className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400" />
//                 </div>
//                 <div>
//                   <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Color Code</label>
//                   <div className="flex items-center gap-1.5">
//                     <input type="color" value={v.colorCode || "#000000"} onChange={(e) => updateVariant(i, { colorCode: e.target.value })} className="w-8 h-8 rounded border border-gray-200 shrink-0" />
//                     <input value={v.colorCode} onChange={(e) => updateVariant(i, { colorCode: e.target.value })} className="w-full px-2 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-brand-400" />
//                   </div>
//                 </div>
//                 <div>
//                   <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Purchase Price</label>
//                   <input type="number" value={v.purchasePrice} onChange={(e) => updateVariant(i, { purchasePrice: Number(e.target.value) })} className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400" />
//                 </div>
//                 <div>
//                   <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Selling Price *</label>
//                   <input type="number" value={v.sellingPrice} onChange={(e) => updateVariant(i, { sellingPrice: Number(e.target.value) })} className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400" />
//                 </div>
//                 <div>
//                   <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Stock</label>
//                   <input type="number" value={v.stock} onChange={(e) => updateVariant(i, { stock: Number(e.target.value) })} className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400" />
//                 </div>
//                 <div>
//                   <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Low Stock Alert</label>
//                   <input type="number" value={v.lowStockAlert} onChange={(e) => updateVariant(i, { lowStockAlert: Number(e.target.value) })} className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400" />
//                 </div>
//                 <div className="col-span-2">
//                   <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Warehouse</label>
//                   <input value={v.warehouse} onChange={(e) => updateVariant(i, { warehouse: e.target.value })} className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400" />
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="bg-white border border-gray-100 rounded-2xl p-6">
//         <h3 className="font-semibold text-gray-800 mb-4">SEO</h3>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <div>
//             <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Meta Title</label>
//             <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
//           </div>
//           <div>
//             <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Meta Description</label>
//             <input value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
//           </div>
//         </div>
//       </div>

//       {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

//       <div className="flex gap-3">
//         <button onClick={() => router.push("/products")} className="px-5 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
//           Cancel
//         </button>
//         <button onClick={submit} disabled={isPending} className="flex-1 py-3 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
//           {isPending && <Loader2 size={15} className="animate-spin" />}
//           {mode === "edit" ? "Save Changes" : "Create Product"}
//         </button>
//       </div>
//     </div>
//   );
// }
