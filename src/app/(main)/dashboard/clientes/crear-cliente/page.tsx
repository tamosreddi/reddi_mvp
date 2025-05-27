import { Suspense } from "react";
import CrearClienteForm from "@/components/clientes/crear-cliente-form";

export default function CrearClientePage() {
  return (
    <Suspense>
      <CrearClienteForm />
    </Suspense>
  );
}