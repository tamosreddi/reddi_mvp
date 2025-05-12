"use client"

import { usePathname, useRouter } from "next/navigation"
import { Home, FileBarChart, DollarSign, Package, Grid } from "lucide-react"
import { cn } from "@/lib/utils"

export default function BottomNavigation() {
  const pathname = usePathname()
  const router = useRouter()

  // Navigation items configuration
  const navItems = [
    {
      name: "Inicio",
      icon: Home,
      path: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      name: "Balance",
      icon: FileBarChart,
      path: "/balance",
      active: pathname.startsWith("/balance"),
    },
    {
      name: "Deudas",
      icon: DollarSign,
      path: "/deudas",
      active: pathname.startsWith("/deudas"),
    },
    {
      name: "Inventario",
      icon: Package,
      path: "/inventario",
      active: pathname.startsWith("/inventario"),
    },
    {
      name: "Explorar",
      icon: Grid,
      path: "/explorar",
      active:
        pathname.startsWith("/explorar") ||
        pathname.startsWith("/estadisticas") ||
        pathname.startsWith("/empleados") ||
        pathname.startsWith("/catalogo") ||
        pathname.startsWith("/pedidos"),
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-gray-800 px-2 py-2 w-full">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => router.push(item.path)}
            className={cn("flex flex-col items-center relative", item.active && "text-yellow-400")}
          >
            <item.icon className={cn("h-6 w-6", item.active ? "text-yellow-400" : "text-gray-300")} />
            <span className={cn("mt-1 text-xs", item.active ? "text-yellow-400" : "text-gray-400")}>{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}