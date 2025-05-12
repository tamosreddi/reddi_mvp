"use client";
import { usePathname } from "next/navigation";
import BottomNavigation from "@/components/shared/bottom-navigation";
import { StoreProvider } from "@/lib/contexts/StoreContext";

// Lista de rutas donde SÍ quieres mostrar el navigation menu
const navigationVisibleRoutes = [
  "/dashboard",
  "/deudas",
  "/explorar",
  "/inventario",
  "/balance",
  // ...agrega más rutas principales aquí
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNavigation = navigationVisibleRoutes.some(route =>
    pathname.startsWith(route)
  );

  return (
    <StoreProvider>
      {children}
      {showNavigation && <BottomNavigation />}
    </StoreProvider>
  );
}