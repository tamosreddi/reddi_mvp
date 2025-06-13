//Main view de página de inventario

"use client"

import { useState, useEffect, useCallback } from "react"
import { FileText, Grid, Heart, Search, Edit } from "lucide-react"
import Button from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import TopProfileMenu from "@/components/shared/top-profile-menu"
import CreateProductForm from "@/components/inventario/create-product-form"
import { useStore } from "@/lib/contexts/StoreContext"
import { supabase } from "@/lib/supabase/supabaseClient"
import SelectProductModal from "@/components/shared/select_product_modal"
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Input from "@/components/ui/Input"
import useDebounce from "@/lib/hooks/useDebounce"

// Placeholder categories - these will be replaced with data from Supabase
const PLACEHOLDER_CATEGORIES = [
  "Todas las categorías",
  "Bebidas",
  "Snacks",
  "Lácteos",
  "Panadería",
  "Carnes",
  "Frutas y Verduras",
  "Limpieza",
  "Higiene",
  "Abarrotes",
  "Congelados",
  "Enlatados"
]

// Helper para saber si un producto está en el inventario
const isInInventory = (productId: string, inventory: any[]) => {
  return inventory.some(item => String(item.product_reference_id) === String(productId));
};

export default function ViewInventory() {
  const [activeTab, setActiveTab] = useState("mi-tienda")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [inventory, setInventory] = useState<any[]>([])
  const [catalogProducts, setCatalogProducts] = useState<any[]>([])
  const router = useRouter()
  const pathname = usePathname()
  const { selectedStore } = useStore()
  const [loading, setLoading] = useState(true)
  const [showCreateProductForm, setShowCreateProductForm] = useState(false)
  const [showSelectProductModal, setShowSelectProductModal] = useState(false)
  const [totalCost, setTotalCost] = useState(0)
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState<string>("");
  const [savingPrice, setSavingPrice] = useState(false);

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Fetch catalog products
  useEffect(() => {
    const fetchCatalogProducts = async () => {
      if (!selectedStore?.store_id) return;
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("name")
          .limit(20) // Initial load

        if (error) throw error;
        setCatalogProducts(data || []);
      } catch (error) {
        console.error("Error fetching catalog products:", error);
        setCatalogProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === "productos") {
      fetchCatalogProducts();
    }
  }, [selectedStore, activeTab]);

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

  // Filter inventory based on search term and selected category
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true
    return matchesSearch && matchesCategory
  })

  // Filter catalog products based on search term and selected category
  const filteredCatalogProducts = catalogProducts.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true
    return matchesSearch && matchesCategory
  })

  // Handle product selection
  const handleProductSelect = async (productId: string) => {
    if (!selectedStore?.store_id) return;
    
    try {
      const { error } = await supabase
        .from("store_inventory")
        .insert({
          store_id: selectedStore.store_id,
          product_reference_id: productId,
          product_type: "global",
          quantity: 0,
          unit_price: 0
        });

      if (error) throw error;
      
      // Refresh inventory
      // TODO: Implement proper refresh
    } catch (error) {
      console.error("Error selecting product:", error);
    }
  };

  // Handle product deselection
  const handleProductDeselect = async (productId: string) => {
    if (!selectedStore?.store_id) return;
    
    try {
      const { error } = await supabase
        .from("store_inventory")
        .delete()
        .eq("store_id", selectedStore.store_id)
        .eq("product_reference_id", productId);

      if (error) throw error;
      
      // Refresh inventory
      // TODO: Implement proper refresh
    } catch (error) {
      console.error("Error deselecting product:", error);
    }
  };

  // Handle report generation
  const handleGenerateReport = () => {
    alert("Generando reporte de inventario...")
  }

  // Handle category creation
  const handleCreateCategory = () => {
    alert("Funcionalidad para crear categoría será implementada próximamente")
  }

  const handleSearchClick = () => {
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
  }

  // Guardar el precio editado en Supabase
  const handleSavePrice = async (item: any) => {
    const newPrice = parseFloat(editingPriceValue);
    if (isNaN(newPrice) || newPrice <= 0) {
      // Opcional: mostrar error visual
      return;
    }
    setSavingPrice(true);
    try {
      await supabase
        .from("store_inventory")
        .update({ unit_price: newPrice })
        .eq("inventory_id", item.id);
      // Refrescar inventario
      item.price = newPrice;
    } finally {
      setSavingPrice(false);
      setEditingPriceId(null);
    }
  };

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
    <div className="flex min-h-screen flex-col bg-reddi-background">
      {/* Header */}
      <TopProfileMenu onSearchClick={handleSearchClick} />

      {/* Tabs */}
      <Tabs defaultValue="mi-tienda" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-2 h-auto p-0 bg-transparent">
          <TabsTrigger
            value="mi-tienda"
            className={`py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none ${
              activeTab === "mi-tienda" ? "font-bold" : "text-gray-500"
            }`}
          >
            Mi Tienda
          </TabsTrigger>
          <TabsTrigger
            value="productos"
            className={`py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none ${
              activeTab === "productos" ? "font-bold" : "text-gray-500"
            }`}
          >
            Productos
          </TabsTrigger>
        </TabsList>

        {/* Search Bar */}
        <div className="px-4 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex overflow-x-auto py-2 px-4 space-x-2 scrollbar-hide">
          {PLACEHOLDER_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              className={cn(
                "px-3 py-1.5 rounded-full whitespace-nowrap text-sm transition-all",
                (!selectedCategory && category === "Todas las categorías") || selectedCategory === category
                  ? "bg-yellow-400 text-gray-900 shadow-md"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              )}
              onClick={() => setSelectedCategory(category === "Todas las categorías" ? null : category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Mi Tienda Tab Content */}
        <TabsContent value="mi-tienda" className="text-base flex-1 flex flex-col items-center justify-center p-4 pb-40">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Cargando productos...</div>
          ) : filteredInventory.length > 0 ? (
            <div className="space-y-3 w-full">
              {filteredInventory.map((item) => (
                <div
                  key={item.id}
                  className="flex w-full items-center rounded-xl border border-gray-200 bg-white p-3 shadow-sm hover:bg-gray-50 transition-all"
                  // onClick={() => navigateToProductDetail(String(item.id))} // Solo detalle al hacer click en el nombre
                >
                  {/* Imagen */}
                  <div className="h-16 w-16 rounded-lg bg-purple-100 mr-4 overflow-hidden flex-shrink-0">
                    <Image src={item.image || "/Groserybasket.png"} alt={item.name} width={64} height={64} className="h-full w-full object-cover" />
                  </div>
                  {/* Nombre */}
                  <div className="flex-1 min-w-0" onClick={() => navigateToProductDetail(String(item.id))}>
                    <h3 className="font-sm text-gray-900 truncate whitespace-nowrap overflow-hidden max-w-[200px] cursor-pointer">
                      {item.name_alias ? item.name_alias : item.name}
                    </h3>
                  </div>
                  {/* Precio + Editar */}
                  <div className="flex items-center gap-2 ml-2">
                    {editingPriceId === item.id ? (
                      <form
                        onSubmit={e => {
                          e.preventDefault();
                          handleSavePrice(item);
                        }}
                        className="flex items-center gap-1"
                      >
                        <Input
                          type="number"
                          min={0.01}
                          step={0.01}
                          value={editingPriceValue}
                          autoFocus
                          disabled={savingPrice}
                          onChange={e => setEditingPriceValue(e.target.value)}
                          onBlur={() => handleSavePrice(item)}
                          className="w-20 text-sm font-semibold"
                        />
                      </form>
                    ) : (
                      <button
                        className="flex items-center gap-1 group bg-transparent border-none outline-none p-0 m-0"
                        style={{ background: 'none' }}
                        onClick={e => {
                          e.stopPropagation();
                          setEditingPriceId(item.id);
                          setEditingPriceValue(item.price.toFixed(2));
                        }}
                        aria-label="Editar precio"
                        type="button"
                      >
                        <span className="text-sm font-semibold select-none group-hover:text-blue-700">${item.price.toFixed(2)}</span>
                        <Edit className="h-4 w-4 text-gray-400 group-hover:text-gray-700" />
                      </button>
                    )}
                  </div>
                  {/* Corazón */}
                  <span
                    className={"ml-3 transition-colors text-reddi-select cursor-pointer"}
                    style={{ transition: 'color 0.2s' }}
                    onClick={e => {
                      e.stopPropagation();
                      handleProductDeselect(item.id);
                    }}
                  >
                    <Heart className="h-6 w-6" fill="currentColor" strokeWidth={0} />
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center max-w-md mx-auto text-center mt-8">
              <div className="flex items-center justify-center w-24 h-24 mb-6 bg-purple-50 rounded-full">
                <span className="text-6xl" role="img" aria-label="Store">
                  🏪
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No tienes productos en tu tienda</h2>
              <p className="text-gray-600 mb-8">Selecciona productos del catálogo para agregarlos a tu tienda</p>
            </div>
          )}
        </TabsContent>

        {/* Productos Tab Content */}
        <TabsContent value="productos" className="mt-0 flex-1 flex flex-col items-center justify-center p-4 pb-40">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Cargando productos...</div>
          ) : filteredCatalogProducts.length > 0 ? (
            <div className="space-y-3 w-full">
              {filteredCatalogProducts.map((item) => {
                const selected = isInInventory(item.id, inventory);
                return (
                  <button
                    key={item.id}
                    className="flex w-full items-center rounded-xl border border-gray-200 bg-white p-3 shadow-sm text-left hover:bg-gray-50 transition-all"
                  >
                    <div className="h-16 w-16 rounded-lg bg-purple-100 mr-4 overflow-hidden">
                      <Image src={item.image || "/Groserybasket.png"} alt={item.name} width={64} height={64} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-sm text-gray-900 truncate whitespace-nowrap overflow-hidden max-w-[200px]">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600">{item.category}</p>
                    </div>
                    <span
                      className={
                        selected
                          ? "transition-colors text-reddi-select"
                          : "transition-colors text-gray-300 hover:text-reddi-select"
                      }
                      style={{ transition: 'color 0.2s' }}
                      onClick={e => {
                        e.stopPropagation();
                        if (selected) {
                          handleProductDeselect(item.id);
                        } else {
                          handleProductSelect(item.id);
                        }
                      }}
                    >
                      <Heart
                        className="h-6 w-6"
                        fill={selected ? "currentColor" : "none"}
                        strokeWidth={selected ? 0 : 2}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center max-w-md mx-auto text-center mt-8">
              <div className="flex items-center justify-center w-24 h-24 mb-6 bg-purple-50 rounded-full">
                <span className="text-6xl" role="img" aria-label="Products">
                  📦
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No se encontraron productos</h2>
              <p className="text-gray-600 mb-8">Intenta con otra búsqueda o categoría</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="fixed bottom-16 left-0 right-0 px-4 pb-2 flex gap-2">
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
          }
        }}
      />
    </div>
  )
}
