"use client";
import ProductDetailView from "@/components/inventario/product-detail-view";
import { useParams } from "next/navigation";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  return <ProductDetailView productId={params.id} />;
}
