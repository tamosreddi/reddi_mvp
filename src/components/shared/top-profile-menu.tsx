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
import { useDemo } from "@/lib/contexts/DemoContext"

interface TopProfileMenuProps {
  userRole?: string
  showSearch?: boolean
  onSearchClick?: () => void
  className?: string
  simpleMode?: boolean
  title?: string
  onBackClick?: () => void
  rightContent?: React.ReactNode
}

export default function TopProfileMenu({
  userRole = "Propietario",
  showSearch = true,
  onSearchClick,
  className,
  simpleMode = false,
  title = "",
  onBackClick,
  rightContent,
}: TopProfileMenuProps) {
  const { selectedStore } = useStore()
  const { isDemoMode, store: demoStore } = useDemo();
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  const handleSettings = () => {
    router.push("/perfil")
  }

  // If in simple mode, render a simple header with back button
  if (simpleMode) {
    return (
      <header className={cn("fixed left-0 right-0 top-0 z-10 bg-reddi-top p-4", className)}>
        <div className="flex items-center justify-between h-8">
          <button 
            onClick={onBackClick} 
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-merriweather">{title}</h1>
          {rightContent ? rightContent : <div className="w-12"></div>}
        </div>
      </header>
    )
  }

  // Otherwise, render the full profile menu
  return (
    <header className={cn("relative bg-reddi-top p-4", className)}>
      <div className="relative flex items-center justify-between h-8"> {/* h-10 es el alto del header */}
        {/* Perfil a la izquierda */}
        <div className="flex items-center">
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm focus:outline-none">
                <User className="h-5 w-5 text-gray-600" />
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

        {/* Nombre de la tienda centrado */}
        <div className="absolute left-0 right-0 flex justify-center pointer-events-none">
          <h1 className="font-merriweather text-base font-light text-gray-900 truncate max-w-[70vw] text-center pointer-events-auto">
            {isDemoMode
              ? demoStore.store_name
              : selectedStore
                ? selectedStore.store_name
                : "Cargando..."}
          </h1>
        </div>

        {/* Botón de ayuda a la derecha */}
        <div className="flex items-center">
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
      </div>
    </header>
  )
}