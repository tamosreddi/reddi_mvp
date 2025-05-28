"use client";
import { usePathname } from "next/navigation";
import BottomNavigation from "@/components/shared/bottom-navigation";
import { StoreProvider } from "@/lib/contexts/StoreContext";
import { Toaster } from "sonner";

// Lista de rutas donde SÍ quieres mostrar el navigation menu
const navigationVisibleRoutes = [
  "/dashboard",
  "/balance",
  "/inventario",
  "/deudas",
  "/explorar"
];

// Lista de rutas donde NO quieres mostrar el navigation menu
const navigationHiddenRoutes = [
  "/balance/income-detail-view",
  "/balance/expense-detail-view",
  // Agrega aquí otras rutas de detalle donde no debe mostrarse
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNavigation = navigationVisibleRoutes.includes(pathname) && !navigationHiddenRoutes.includes(pathname);

  return (
    <StoreProvider>
      {children}
      {showNavigation && <BottomNavigation />}
      <Toaster />
    </StoreProvider>
  );
}