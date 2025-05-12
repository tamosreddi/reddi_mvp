"use client";
   import { usePathname } from "next/navigation";
   import BottomNavigation from "@/components/shared/bottom-navigation";

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
     const showNavigation = navigationVisibleRoutes.includes(pathname);

     return (
       <>
         {children}
         {showNavigation && <BottomNavigation />}
       </>
     );
   }