"use client";
import { useParams } from "next/navigation";
import ProductForm from "@/components/products/ProductForm";
import { useProduct } from "@/hooks/queries/useProducts";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, isError, refetch } = useProduct(id);

  if (isLoading) return <LoadingState label="Loading product..." />;
  if (isError || !product) return <ErrorState message="Couldn't load this product." onRetry={() => refetch()} />;

  return <ProductForm mode="edit" productId={id} initial={product} />;
}
