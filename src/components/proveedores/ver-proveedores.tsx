"use client"

import { useState, useEffect } from "react"
import { Search, User, Plus, MoreVertical, Edit, Trash2 } from "lucide-react"
import Button from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import TopProfileMenu from "@/components/shared/top-profile-menu"
import { useStore } from "@/lib/contexts/StoreContext"

export default function ViewSuppliers() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState("")
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { selectedStore } = useStore()

  // Check if we're in selection mode (coming from a sale)
  const isSelecting = searchParams.get("select") === "true"
  const returnTo = searchParams.get("returnTo") || "/"

  // Fetch suppliers from API
  useEffect(() => {
    const fetchSuppliers = async () => {
      if (!selectedStore) {
        setSuppliers([])
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(
          `/api/proveedores?storeId=${selectedStore.store_id}${
            searchTerm.trim() ? `&searchTerm=${encodeURIComponent(searchTerm.trim())}` : ""
          }`
        )
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "Error al cargar proveedores")
        }
        setSuppliers(data || [])
      } catch (err: any) {
        setError(err.message)
        setSuppliers([])
      }
      setLoading(false)
    }
    fetchSuppliers()
  }, [selectedStore, searchTerm])

  // Navegar a la página de crear proveedor
  const navigateToCreateSupplier = () => {
    router.push(`/dashboard/proveedores/crear-proveedor?returnTo=${encodeURIComponent(returnTo)}`)
  }

  // Handle supplier selection
  const selectSupplier = (supplierId: number) => {
    console.log('🔍 [Ver Proveedores] Iniciando selección de proveedor:', { supplierId, isSelecting, returnTo });
    
    if (isSelecting) {
      // Find the selected supplier
      const selectedSupplier = suppliers.find((supplier) => supplier.supplier_id === supplierId)
      console.log('🔍 [Ver Proveedores] Proveedor encontrado:', selectedSupplier);

      // Store the selected supplier in localStorage with the correct structure
      if (selectedSupplier) {
        const formattedSupplier = {
          supplier_id: selectedSupplier.supplier_id,
          name: selectedSupplier.name,
          notes: selectedSupplier.notes || ""
        }
        console.log('🔍 [Ver Proveedores] Proveedor formateado para guardar:', formattedSupplier);
        localStorage.setItem("selectedSupplier", JSON.stringify(formattedSupplier))
        
        // Verificar que se guardó correctamente
        const savedSupplier = localStorage.getItem("selectedSupplier");
        console.log('🔍 [Ver Proveedores] Proveedor guardado en localStorage:', savedSupplier);
      }

      // Return to the previous screen
      console.log('🔍 [Ver Proveedores] Redirigiendo a:', returnTo);
      if (returnTo) {
        router.push(returnTo)
      } else {
        router.back()
      }
    }
  }

  // Handle supplier edit
  const handleEdit = (supplierId: number) => {
    router.push(`/dashboard/proveedores/crear-proveedor?supplierId=${supplierId}&returnTo=${encodeURIComponent(returnTo)}`)
  }

  // Handle supplier delete
  const handleDelete = async (supplierId: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este proveedor?")) {
      return
    }

    try {
      const response = await fetch(`/api/proveedores?supplierId=${supplierId}`, {
        method: "DELETE",
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar el proveedor")
      }
      // Actualizar la lista de proveedores
      setSuppliers(suppliers.filter(s => s.supplier_id !== supplierId))
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <TopProfileMenu
        simpleMode={true}
        title={isSelecting ? "Seleccionar Proveedor" : "Proveedores"}
        onBackClick={() => {
          if (returnTo) {
            router.push(returnTo)
          } else {
            router.back()
          }
        }}
      />

      {/* Main Content */}
      <div className="flex-1 p-4 pb-24 space-y-4 mt-16">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar proveedor por nombre"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        {/* Supplier List */}
        <div className="space-y-3 mt-4">
          {loading ? (
            <div className="py-8 text-center text-gray-500">Cargando proveedores...</div>
          ) : error ? (
            <div className="py-8 text-center text-red-500">{error}</div>
          ) : suppliers.length > 0 ? (
            suppliers.map((supplier) => (
              <div
                key={supplier.supplier_id}
                className="flex items-center w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:bg-gray-50"
              >
                <button
                  className="flex-1 flex items-center text-left"
                  onClick={() => selectSupplier(supplier.supplier_id)}
                >
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                    <User className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-normal text-gray-900">{supplier.name}</h3>
                    {supplier.notes && <p className="text-sm text-gray-600 line-clamp-1">{supplier.notes}</p>}
                  </div>
                </button>
                {!isSelecting && (
                  <div className="relative ml-2">
                    <button
                      className="p-2 hover:bg-gray-100 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        const menu = document.getElementById(`menu-${supplier.supplier_id}`)
                        if (menu) {
                          menu.classList.toggle("hidden")
                        }
                      }}
                    >
                      <MoreVertical className="h-5 w-5 text-gray-600" />
                    </button>
                    <div
                      id={`menu-${supplier.supplier_id}`}
                      className="hidden absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                    >
                      <div className="py-1">
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => handleEdit(supplier.supplier_id)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </button>
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          onClick={() => handleDelete(supplier.supplier_id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-gray-500">
              No se encontraron proveedores que coincidan con tu búsqueda.
            </div>
          )}
        </div>
      </div>

      {/* Fixed Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg z-40">
        <Button
          onClick={navigateToCreateSupplier}
          className="w-full rounded-xl bg-gray-800 p-6 text-lg font-medium text-white hover:bg-gray-700"
        >
          <Plus className="mr-2 h-5 w-5" />
          Agregar Proveedor
        </Button>
      </div>
    </div>
  )
}