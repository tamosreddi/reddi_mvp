"use client";
import { Suspense } from "react";
import ProductSale from "@/components/ventas/venta-productos";
import { useSearchParams } from "next/navigation";

function ProductSaleWithParams() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transaction_id");
  return <ProductSale transactionId={transactionId || undefined} />;
}

export default function ProductSalePage() {
  return (
    <Suspense>
      <ProductSaleWithParams />
    </Suspense>
  );
}
