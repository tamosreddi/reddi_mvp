"use client";
import { useSearchParams } from "next/navigation";
import ProductSale from "@/components/ventas/venta-productos"

export default function ProductSalePage() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transaction_id");
  return <ProductSale transactionId={transactionId || undefined} />
}
