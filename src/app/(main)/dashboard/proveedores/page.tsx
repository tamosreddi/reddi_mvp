// Página principal para ver proveedores

"use client"

import { Suspense } from "react";
import ViewSuppliers from "@/components/proveedores/ver-proveedores";

export default function VerProveedorPage() {
  return (
    <Suspense>
      <ViewSuppliers />
    </Suspense>
  );
}