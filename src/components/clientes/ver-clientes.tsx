"use client"

import { useState, useEffect } from "react"
import { Search, User, Plus } from "lucide-react"
import Button from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import TopProfileMenu from "@/components/shared/top-profile-menu"
import { supabase } from "@/lib/supabase/supabaseClient"
import { useStore } from "@/lib/contexts/StoreContext"

export default function ViewCustomers() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState("")
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { selectedStore } = useStore()

  // Check if we're in selection mode (coming from a sale)
  const isSelecting = searchParams.get("select") === "true"
  const returnTo = searchParams.get("returnTo") || "/"

  // Fetch customers from Supabase for the current store or search term
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!selectedStore) {
        setCustomers([])
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      let query = supabase
        .from("clients")
        .select("client_id, name, notes")
        .eq("store_id", selectedStore.store_id)
        .order("created_at", { ascending: false })
      if (searchTerm.trim() !== "") {
        query = query.ilike("name", `%${searchTerm.trim()}%`)
      }
      const { data, error } = await query
      if (error) {
        setError("Error al cargar clientes: " + error.message)
        setCustomers([])
      } else {
        setCustomers(data || [])
      }
      setLoading(false)
    }
    fetchCustomers()
  }, [selectedStore, searchTerm])

  // Navigate to create customer form
  const navigateToCreateCustomer = () => {
    // Guarda la ruta actual para volver después de crear el cliente
    const currentPath = "/dashboard/clientes/ver-cliente"
    router.push(`/dashboard/clientes/crear-cliente?returnTo=${encodeURIComponent(currentPath)}`)
  }

  // Handle customer selection
  const selectCustomer = (customerId: number) => {
    console.log('🔍 [Ver Clientes] Iniciando selección de cliente:', { customerId, isSelecting, returnTo });
    
    if (isSelecting) {
      // Find the selected customer
      const selectedCustomer = customers.find((customer) => customer.client_id === customerId)
      console.log('🔍 [Ver Clientes] Cliente encontrado:', selectedCustomer);

      // Store the selected customer in localStorage with the correct structure
      if (selectedCustomer) {
        const formattedCustomer = {
          client_id: selectedCustomer.client_id,
          name: selectedCustomer.name,
          notes: selectedCustomer.notes || ""
        }
        console.log('🔍 [Ver Clientes] Cliente formateado para guardar:', formattedCustomer);
        localStorage.setItem("selectedCustomer", JSON.stringify(formattedCustomer))
        
        // Verificar que se guardó correctamente
        const savedCustomer = localStorage.getItem("selectedCustomer");
        console.log('🔍 [Ver Clientes] Cliente guardado en localStorage:', savedCustomer);
      }

      // Return to the previous screen
      console.log('🔍 [Ver Clientes] Redirigiendo a:', returnTo);
      console.log('[VerClientes] Navegando a:', returnTo)
      if (returnTo) {
        router.push(returnTo)
      } else {
        router.back()
      }
    } else {
      // In the future, this could navigate to a customer detail view
      alert(`Ver detalles del cliente ${customerId}`)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <TopProfileMenu
        simpleMode={true}
        title={isSelecting ? "Seleccionar Cliente" : "Clientes"}
        onBackClick={() => {
          if (returnTo) {
            router.push(returnTo)
          } else {
            router.back()
          }
        }}
      />

      {/* Main Content - Add padding at the bottom to prevent content from being hidden behind the fixed button */}
      <div className="flex-1 p-4 pb-24 space-y-4 mt-20">
        {/* Title */}
        {/* <h1 className="text-xl font-bold text-center">{isSelecting ? "Seleccionar Cliente" : "Clientes"}</h1> */}

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar cliente por nombre"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        {/* Customer List */}
        <div className="space-y-3 mt-4">
          {loading ? (
            <div className="py-8 text-center text-gray-500">Cargando clientes...</div>
          ) : error ? (
            <div className="py-8 text-center text-red-500">{error}</div>
          ) : customers.length > 0 ? (
            customers.map((customer) => (
              <button
                key={customer.client_id}
                className="flex items-center w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm text-left hover:bg-gray-50"
                onClick={() => selectCustomer(customer.client_id)}
              >
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                  <User className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{customer.name}</h3>
                  {customer.notes && <p className="text-sm text-gray-600 line-clamp-1">{customer.notes}</p>}
                </div>
              </button>
            ))
          ) : (
            <div className="py-8 text-center text-gray-500">
              No se encontraron clientes que coincidan con tu búsqueda.
            </div>
          )}
        </div>
      </div>

      {/* Fixed Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg z-40">
        <Button
          onClick={navigateToCreateCustomer}
          className="w-full rounded-xl bg-gray-800 p-6 text-lg font-medium text-white hover:bg-gray-700"
        >
          <Plus className="mr-2 h-5 w-5" />
          Agregar Cliente
        </Button>
      </div>
    </div>
  )
}
