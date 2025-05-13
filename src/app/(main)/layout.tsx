"use client";
import { usePathname } from "next/navigation";
import BottomNavigation from "@/components/shared/bottom-navigation";
import { StoreProvider } from "@/lib/contexts/StoreContext";

// Lista de rutas donde SÍ quieres mostrar el navigation menu
const navigationVisibleRoutes = [
  "/dashboard",
  "/balance",
  "/inventario",
  "/deudas",
  "/explorar"
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNavigation = navigationVisibleRoutes.includes(pathname);

  return (
    <StoreProvider>
      {children}
      {showNavigation && <BottomNavigation />}
    </StoreProvider>
  );
}