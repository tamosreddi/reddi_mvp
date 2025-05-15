"use client"

import { useState } from "react"
import { Search, User, Plus } from "lucide-react"
import Button from "@/components/ui/Button"
import { useRouter, useSearchParams } from "next/navigation"
import TopProfileMenu from "@/components/shared/top-profile-menu"

// Sample customer data
const sampleCustomers = [
  {
    id: 1,
    name: "Juan Pérez",
    notes: "Cliente frecuente, prefiere pagar en efectivo",
  },
  {
    id: 2,
    name: "María González",
    notes: "Compra productos de limpieza cada semana",
  },
  {
    id: 3,
    name: "Carlos Rodríguez",
    notes: "Dueño de la tienda de la esquina",
  },
  {
    id: 4,
    name: "Ana Martínez",
    notes: "Prefiere productos orgánicos",
  },
  {
    id: 5,
    name: "Roberto Sánchez",
    notes: "Compra al por mayor",
  },
]

export default function ViewCustomers() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState("")
  const [customers] = useState(sampleCustomers)

  // Check if we're in selection mode (coming from a sale)
  const isSelecting = searchParams.get("select") === "true"
  const returnTo = searchParams.get("returnTo") || "/"

  // Filter customers based on search term
  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSearchClick = () => {
    // Implementar funcionalidad de búsqueda aquí
    alert("Funcionalidad de búsqueda será implementada próximamente")
  }

  // Navigate to create customer form
  const navigateToCreateCustomer = () => {
    // Guarda la ruta actual para volver después de crear el cliente
    const currentPath = "/dashboard/clientes/ver-cliente"
    router.push(`/dashboard/clientes/crear-cliente?returnTo=${encodeURIComponent(currentPath)}`)
  }

  // Handle customer selection
  const selectCustomer = (customerId: number) => {
    if (isSelecting) {
      // Find the selected customer
      const selectedCustomer = customers.find((customer) => customer.id === customerId)

      // Store the selected customer in localStorage
      if (selectedCustomer) {
        localStorage.setItem("selectedCustomer", JSON.stringify(selectedCustomer))
      }

      // Return to the previous screen
      router.push(returnTo)
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
        onBackClick={() => router.push(returnTo)}
      />

      {/* Main Content - Add padding at the bottom to prevent content from being hidden behind the fixed button */}
      <div className="flex-1 p-4 pb-24 space-y-4">
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
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <button
                key={customer.id}
                className="flex items-center w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm text-left hover:bg-gray-50"
                onClick={() => selectCustomer(customer.id)}
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
