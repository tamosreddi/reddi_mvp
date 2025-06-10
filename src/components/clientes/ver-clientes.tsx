"use client"

import { useState, useEffect } from "react"
import { Search, User, Plus, MoreVertical, Edit, Trash2 } from "lucide-react"
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

  // Fetch customers from API for the current store or search term
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!selectedStore) {
        setCustomers([])
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        // 1. Obtén el token de sesión del usuario
        const { data: { session } } = await supabase.auth.getSession()
        const accessToken = session?.access_token

        // 2. Haz el fetch enviando el token en el header Authorization
        const response = await fetch(
          `/api/clientes?storeId=${selectedStore.store_id}${
            searchTerm.trim() ? `&searchTerm=${encodeURIComponent(searchTerm.trim())}` : ""
          }`,
          {
            headers: {
              ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
            }
          }
        )
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "Error al cargar clientes")
        }
        console.log('Clientes recibidos de la API:', data)
        setCustomers(data || [])
      } catch (err: any) {
        setError(err.message)
        setCustomers([])
      }
      setLoading(false)
    }
    fetchCustomers()
  }, [selectedStore, searchTerm])

  // Navigate to create customer form
  const navigateToCreateCustomer = () => {
    router.push(`/dashboard/clientes/crear-cliente?returnTo=${encodeURIComponent(returnTo)}`)
  }

  // Handle customer selection
  const selectCustomer = (customerId: number) => {
    if (isSelecting) {
      // Find the selected customer
      const selectedCustomer = customers.find((customer) => customer.client_id === customerId)
      if (selectedCustomer) {
        const formattedCustomer = {
          client_id: selectedCustomer.client_id,
          name: selectedCustomer.name,
          notes: selectedCustomer.notes || ""
        }
        localStorage.setItem("selectedCustomer", JSON.stringify(formattedCustomer))
      }
      if (returnTo) {
        router.push(returnTo)
      } else {
        router.back()
      }
    }
  }

  // Handle customer edit
  const handleEdit = (clientId: number) => {
    router.push(`/dashboard/clientes/crear-cliente?clientId=${clientId}&returnTo=${encodeURIComponent(returnTo)}`)
  }

  // Handle customer delete
  const handleDelete = async (clientId: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
      return
    }
    try {
      const response = await fetch(`/api/clientes?clientId=${clientId}`, {
        method: "DELETE",
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar el cliente")
      }
      setCustomers(customers.filter(c => c.client_id !== clientId))
    } catch (err: any) {
      alert(err.message)
    }
  }

  console.log('selectedStore:', selectedStore)

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <TopProfileMenu
        simpleMode={true}
        title={isSelecting ? "Seleccionar Cliente" : "Clientes"}
        onBackClick={() => {
          if (isSelecting && returnTo) {
            router.replace(returnTo)
          } else if (returnTo) {
            router.push(returnTo)
          } else {
            router.back()
          }
        }}
      />

      {/* Main Content */}
      <div className="flex-1 p-4 pb-24 space-y-4 mt-14">
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
              <div
                key={customer.client_id}
                className="flex items-center w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:bg-gray-50"
              >
                <button
                  className="flex-1 flex items-center text-left"
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
                {!isSelecting && (
                  <div className="relative ml-2">
                    <button
                      className="p-2 hover:bg-gray-100 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        const menu = document.getElementById(`menu-${customer.client_id}`)
                        if (menu) {
                          menu.classList.toggle("hidden")
                        }
                      }}
                    >
                      <MoreVertical className="h-5 w-5 text-gray-600" />
                    </button>
                    <div
                      id={`menu-${customer.client_id}`}
                      className="hidden absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                    >
                      <div className="py-1">
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => handleEdit(customer.client_id)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </button>
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          onClick={() => handleDelete(customer.client_id)}
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
