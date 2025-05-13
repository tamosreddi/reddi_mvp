"use client"

import { useState } from "react"
import { FileText, Grid } from "lucide-react"
import Button from "@/components/ui/Button"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import TopProfileMenu from "@/components/shared/top-profile-menu"
import CreateProductForm from "@/components/inventario/create-product-form"

// Sample inventory data
const sampleInventory = [
  {
    id: 1,
    name: "Refresco Cola 600ml",
    quantity: 24,
    price: 18.5,
    cost: 12.0,
    category: "Bebidas",
    image: "/refreshing-drink.png",
  },
  {
    id: 2,
    name: "Pan Blanco",
    quantity: 10,
    price: 35.0,
    cost: 20.0,
    category: "Panadería",
    image: "/cooking-pan.png",
  },
  {
    id: 3,
    name: "Leche 1L",
    quantity: 15,
    price: 24.0,
    cost: 18.0,
    category: "Lácteos",
    image: "/glass-of-milk.png",
  },
  {
    id: 4,
    name: "Jabón de Baño",
    quantity: 20,
    price: 15.5,
    cost: 10.0,
    category: "Higiene",
    image: "/jabon.png",
  },
  {
    id: 5,
    name: "Papel Higiénico (4 rollos)",
    quantity: 12,
    price: 45.0,
    cost: 30.0,
    category: "Higiene",
    image: "/crumpled-paper.png",
  },
]

export default function ViewInventory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [inventory, setInventory] = useState(sampleInventory)
  const router = useRouter()
  const pathname = usePathname()
  // New state to control whether to show the create product form
  const [showCreateProductForm, setShowCreateProductForm] = useState(false)

  // Get unique categories
  const categories = Array.from(new Set(inventory.map((item) => item.category)))

  // Filter inventory based on search term and selected category
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true
    return matchesSearch && matchesCategory
  })

  // Calculate total references (unique products)
  const totalReferences = inventory.length

  // Calculate total cost of inventory
  const totalCost = inventory.reduce((sum, item) => sum + item.cost * item.quantity, 0)

  // Handle report generation
  const handleGenerateReport = () => {
    alert("Generando reporte de inventario...")
    // Functionality to be implemented later
  }

  // Handle category creation
  const handleCreateCategory = () => {
    alert("Funcionalidad para crear categoría será implementada próximamente")
    // Functionality to be implemented later
  }

  const handleSearchClick = () => {
    // Implementar funcionalidad de búsqueda aquí
    alert("Funcionalidad de búsqueda será implementada próximamente")
  }

  // Navigate to product detail view
  const navigateToProductDetail = (productId: number) => {
    router.push(`/inventario/${productId}`)
  }

  // Show create product form instead of navigating
  const handleShowCreateProductForm = () => {
    setShowCreateProductForm(true)
  }

  // Handle when the create product form is closed
  const handleCreateProductFormClose = () => {
    setShowCreateProductForm(false)
  }

  // Handle successful product creation
  const handleCreateProductSuccess = () => {
    setShowCreateProductForm(false)
    // In a real app, you would refresh the product list here
  }

  // If showing create product form, render it
  if (showCreateProductForm) {
    return (
      <CreateProductForm
        initialReferrer={pathname}
        onCancel={handleCreateProductFormClose}
        onSuccess={handleCreateProductSuccess}
      />
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <TopProfileMenu onSearchClick={handleSearchClick} />

      {/* Main Content - Add padding at the bottom to prevent products from being hidden */}
      <div className="flex-1 p-4 space-y-4 pb-32">
        {/* Reports Button */}
        <Button
          variant="outline"
          className="w-full rounded-xl border-gray-300 bg-white p-6 text-base"
          onClick={handleGenerateReport}
        >
          <FileText className="mr-2 h-5 w-5" />
          Reportes
        </Button>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Total References */}
          <div className="rounded-xl bg-white p-4 shadow-sm flex flex-col justify-between h-full">
            <h2 className="text-sm font-semibold text-gray-700">Total de referencias</h2>
            <p className="text-2xl font-bold text-left mt-4">{totalReferences}</p>
          </div>

          {/* Total Cost */}
          <div className="rounded-xl bg-white p-4 shadow-sm flex flex-col justify-between h-full">
            <h2 className="text-sm font-semibold text-gray-700">Costo total</h2>
            <p className="text-2xl font-bold text-left mt-4">
              $
              {new Intl.NumberFormat("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalCost)}
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex overflow-x-auto py-2 space-x-2 scrollbar-hide">
          <Button
            variant="outline"
            className={cn(
              "rounded-full px-4 py-2 whitespace-nowrap",
              !selectedCategory ? "bg-yellow-400 border-yellow-400 text-gray-900" : "bg-white",
            )}
            onClick={() => setSelectedCategory(null)}
          >
            Todas las categorías
          </Button>

          {categories.map((category) => (
            <Button
              key={category}
              variant="outline"
              className={cn(
                "rounded-full px-4 py-2 whitespace-nowrap",
                selectedCategory === category ? "bg-yellow-400 border-yellow-400 text-gray-900" : "bg-white",
              )}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Product List */}
        <div className="space-y-3">
          {filteredInventory.length > 0 ? (
            filteredInventory.map((item) => (
              <button
                key={item.id}
                className="flex w-full items-center rounded-xl border border-gray-200 bg-white p-4 shadow-sm text-left hover:bg-gray-50"
                onClick={() => navigateToProductDetail(item.id)}
              >
                <div className="h-16 w-16 rounded-lg bg-purple-100 mr-4 overflow-hidden">
                  <img src={item.image || "/Groserybasket.png"} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-lg font-semibold">${item.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">{item.quantity} disponibles</p>
                </div>
              </button>
            ))
          ) : (
            <div className="py-8 text-center text-gray-500">
              No se encontraron productos que coincidan con tu búsqueda.
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons - Fixed at the bottom, above the navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-45 space-y-3 p-4 bg-gray-50 border-t border-gray-200 shadow-md">
        <Button
          onClick={handleShowCreateProductForm}
          className="w-full rounded-xl bg-gray-800 p-6 text-lg font-medium text-white hover:bg-gray-700"
        >
          Crear producto
        </Button>

        <Button
          onClick={handleCreateCategory}
          variant="outline"
          className="w-full rounded-xl border-gray-300 bg-white p-6 text-lg font-medium text-gray-800"
        >
          <Grid className="mr-2 h-5 w-5" />
          Categorías
        </Button>
      </div>
    </div>
  )
}
