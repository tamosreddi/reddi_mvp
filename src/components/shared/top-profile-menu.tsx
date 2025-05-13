"use client"

import { useState } from "react"
import { ChevronDown, User, Settings, LogOut, HelpCircle, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase/supabaseClient"
import { useStore } from "@/lib/contexts/StoreContext"

interface TopProfileMenuProps {
  userRole?: string
  showSearch?: boolean
  onSearchClick?: () => void
  className?: string
  simpleMode?: boolean
  title?: string
  onBackClick?: () => void
}

export default function TopProfileMenu({
  userRole = "Propietario",
  showSearch = true,
  onSearchClick,
  className,
  simpleMode = false,
  title = "",
  onBackClick,
}: TopProfileMenuProps) {
  const { selectedStore } = useStore()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  const handleSettings = () => {
    // Implementar navegación a configuración aquí
    router.push("/perfil")
  }

  // If in simple mode, render a simple header with back button
  if (simpleMode) {
    return (
      <header className={cn("bg-yellow-400 p-4", className)}>
        <div className="flex items-center">
          <button onClick={onBackClick} className="mr-4" aria-label="Volver">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
      </header>
    )
  }

  // Otherwise, render the full profile menu
  return (
    <header className={cn("bg-yellow-400 p-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
            <User className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center focus:outline-none">
                  <div className="text-left">
                    <div className="flex items-center">
                      <h1 className="text-base font-semibold text-gray-900">
                        {selectedStore ? selectedStore.store_name : "Cargando..."}
                      </h1>
                      <ChevronDown className={cn("ml-1 h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                    </div>
                    <p className="text-xs text-gray-700">{userRole}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 px-1"
                sideOffset={8}
              >
                <DropdownMenuItem
                  onClick={handleSettings}
                  className="cursor-pointer flex items-center rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors"
                >
                  <Settings className="mr-2 h-4 w-4 text-gray-600" />
                  <span className="text-gray-900">Mi Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-gray-200" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer flex items-center rounded-lg px-3 py-2 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="mr-2 h-4 w-4 text-red-600" />
                  <span className="text-red-600 font-medium">Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {showSearch && (
          <button
            onClick={onSearchClick}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-transparent"
            aria-label="Ayuda"
          >
            <HelpCircle className="h-5 w-5 text-gray-900 stroke-2" />
          </button>
        )}
      </div>
    </header>
  )
}