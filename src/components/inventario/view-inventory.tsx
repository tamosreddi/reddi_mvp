//Main view de página de inventario

"use client"

import { useState, useEffect } from "react"
import { FileText, Grid } from "lucide-react"
import Button from "@/components/ui/Button"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import TopProfileMenu from "@/components/shared/top-profile-menu"
import CreateProductForm from "@/components/inventario/create-product-form"
import { useStore } from "@/lib/contexts/StoreContext"
import { supabase } from "@/lib/supabase/supabaseClient"
import SelectProductModal from "@/components/shared/select_product_modal"

export default function ViewInventory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [inventory, setInventory] = useState<any[]>([])
  const router = useRouter()
  const pathname = usePathname()
  const { selectedStore } = useStore()
  const [loading, setLoading] = useState(true)
  // New state to control whether to show the create product form
  const [showCreateProductForm, setShowCreateProductForm] = useState(false)
  // New state to control whether to show the select product modal
  const [showSelectProductModal, setShowSelectProductModal] = useState(false)
  const [totalCost, setTotalCost] = useState(0)

  // Fetch inventory from Supabase
  useEffect(() => {
    const fetchInventory = async () => {
      if (!selectedStore?.store_id) return;
      setLoading(true)
      // 1. Get all inventory items for this store
      const { data: inventoryRows, error: invError } = await supabase
        .from("store_inventory")
        .select("*")
        .eq("store_id", selectedStore.store_id)
      if (invError) {
        setInventory([])
        setLoading(false)
        return
      }
      // 2. For each inventory item, get product details
      const products: any[] = []
      let totalCost = 0

      for (const item of inventoryRows) {
        let product = null
        let lastCost = 0

        if (item.product_type === "custom") {
          // Custom product
          const { data, error } = await supabase
            .from("store_products")
            .select("name, category, image")
            .eq("store_product_id", item.product_reference_id)
            .eq("is_active", true)
            .maybeSingle();
          if (error) {
            // Opcional: console.log("Error al buscar producto personalizado:", error.message);
            product = null;
          } else {
            product = data;
          }
        } else if (item.product_type === "global") {
          // Global product
          const { data } = await supabase
            .from("products")
            .select("name, category, brand")
            .eq("product_id", item.product_reference_id)
            .single()
          product = data
        }

        // Buscar el batch más reciente para este producto y tienda
        const { data: batches } = await supabase
          .from("inventory_batches")
          .select("unit_cost, received_date")
          .eq("product_reference_id", item.product_reference_id)
          .eq("store_id", selectedStore.store_id)
          .order("received_date", { ascending: false })
          .limit(1)
        if (batches && batches.length > 0) {
          lastCost = Number(batches[0].unit_cost) || 0
        }

        if (product) {
          products.push({
            id: String(item.inventory_id),
            name: product.name,
            name_alias: item.name_alias,
            category: product.category,
            image: 'image' in product && product.image ? product.image : "/Groserybasket.png",
            quantity: item.quantity,
            price: Number(item.unit_price),
            cost: lastCost,
          })
          totalCost += lastCost * item.quantity
        }
      }
      setInventory(products)
      setTotalCost(totalCost)
      setLoading(false)
    }
    fetchInventory()
  }, [selectedStore])

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
  const navigateToProductDetail = (productId: string) => {
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
      <div className="flex-1 p-4 space-y-4 pb-40">
        {/* Reports Button */}
        <Button
          variant="outline"
          className="w-full rounded-xl border-gray-300 bg-white px-6 text-sm"
          onClick={handleGenerateReport}
        >
          <FileText className="mr-2 h-5 w-5" />
          Reportes
        </Button>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Total References */}
          <div className="rounded-xl bg-white p-4 shadow-sm flex flex-col justify-between h-full">
            <h2 className="text-sm font-semibold text-gray-700">Productos Totales</h2>
            <p className="text-xl font-bold text-left mt-4">{totalReferences}</p>
          </div>

          {/* Total Cost */}
          <div className="rounded-xl bg-white p-4 shadow-sm flex flex-col justify-between h-full">
            <h2 className="text-sm font-semibold text-gray-700">Costo total</h2>
            <p className="text-xl font-bold text-left mt-4">
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
              "rounded-full px-4 py-1 text-sm whitespace-nowrap",
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
                "rounded-full px-4 py-1 text-sm whitespace-nowrap",
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
                onClick={() => navigateToProductDetail(String(item.id))}
              >
                <div className="h-16 w-16 rounded-lg bg-purple-100 mr-4 overflow-hidden">
                  <img src={item.image || "/Groserybasket.png"} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-sm text-gray-900 truncate whitespace-nowrap overflow-hidden max-w-[200px]">
                    {item.name_alias ? item.name_alias : item.name}
                  </h3>
                  <p className="text-sm font-semibold">${item.price.toFixed(2)}</p>
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
      <div className="fixed bottom-0 left-0 right-0 z-45 p-4 pb-20 bg-gray-50 border-t border-gray-200 shadow-md">
        <Button
          onClick={() => setShowSelectProductModal(true)}
          className="w-full rounded-xl bg-gray-800 p-5 text-lg font-medium text-white hover:bg-gray-700"
        >
          Crear producto
        </Button>
      </div>
      <SelectProductModal
        isOpen={showSelectProductModal}
        onClose={() => setShowSelectProductModal(false)}
        onSelect={(type) => {
          setShowSelectProductModal(false)
          if (type === 'custom') {
            router.push('/inventario/crear')
          } else {
            console.log('Tipo de producto seleccionado:', type)
            // Aquí puedes manejar la lógica para inventario
          }
        }}
      />
    </div>
  )
}
