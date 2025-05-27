import { Suspense } from "react";
import CartView from "@/components/ventas/cart-view"

export default function CanastaPage() {
  return (
    <Suspense>
      <CartView />
    </Suspense>
  )
}
