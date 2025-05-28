import { Suspense } from "react";
import CreateSupplierForm from "@/components/proveedores/crear-proveedor-form";

export default function CrearProveedorPage() {
  return (
    <Suspense>
      <CreateSupplierForm />
    </Suspense>
  );
}