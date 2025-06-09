import { Suspense } from "react";
import VerClientes from "@/components/clientes/ver-clientes";

export default function VerClientePage() {
  return (
    <Suspense>
      <VerClientes />
    </Suspense>
  );
}