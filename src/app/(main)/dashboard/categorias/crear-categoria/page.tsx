import { Suspense } from "react";
import CrearCategoriaForm from "@/components/categorias/crear-categoria-form";

export default function CrearCategoriaPage() {
  return (
    <Suspense>
      <CrearCategoriaForm />
    </Suspense>
  );
}