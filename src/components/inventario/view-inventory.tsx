//Main view de página de inventario

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { FileText, Grid, Heart, Search, Edit } from "lucide-react"
import Button from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import TopProfileMenu from "@/components/shared/top-profile-menu"
import CreateProductForm from "@/components/inventario/create-product-form"
import { useStore } from "@/lib/contexts/StoreContext"
import { supabase } from "@/lib/supabase/supabaseClient"
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Input from "@/components/ui/Input"
import useDebounce from "@/lib/hooks/useDebounce"
import SearchBar from "@/components/shared/SearchBar"
import InventoryProductCard from "@/components/inventario/Inventory_product_card"
import ProductCatalogDetail from "@/components/inventario/ProductCatalogDetail"
import InfoButton from "@/components/shared/InfoButton"
import DeleteProductModal from "@/components/shared/delete-product-modal"

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

// Helper para saber si un producto está en el inventario y activo
const isInInventory = (productId: string, inventory: any[]) => {
  return inventory.some(item => String(item.product_reference_id) === String(productId) && item.is_active === true);
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
  const [totalCost, setTotalCost] = useState(0)
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState<string>("");
  const [savingPrice, setSavingPrice] = useState(false);
  const [fullInventoryRows, setFullInventoryRows] = useState<any[]>([]);
  const firstInventoryItemRef = useRef<HTMLDivElement | null>(null);
  const [showCatalogDetail, setShowCatalogDetail] = useState(false);
  const [selectedCatalogProductId, setSelectedCatalogProductId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDeleteId, setProductToDeleteId] = useState<string | null>(null);

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

        if (error) throw error;
        setCatalogProducts(data || []);
      } catch (error) {
        console.error("Error fetching catalog products:", error);
        setCatalogProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogProducts();
  }, [selectedStore]);

  // Fetch inventory from Supabase
  const fetchInventory = async () => {
    if (!selectedStore?.store_id) return;
    setLoading(true);

    // 1. Fetch all inventory items for the store (including inactive)
    const { data: inventoryRows, error: invError } = await supabase
      .from("store_inventory")
      .select("*")
      .eq("store_id", selectedStore.store_id);

    if (invError) {
      setInventory([]);
      setLoading(false);
      return;
    }

    // 2. Fetch all global products
    const { data: globalProducts, error: globalError } = await supabase
      .from("products")
      .select("*");
    if (globalError) {
      setInventory([]);
      setLoading(false);
      return;
    }

    // 3. Fetch all custom products for this store
    const { data: customProducts, error: customError } = await supabase
      .from("store_products")
      .select("*")
      .eq("store_id", selectedStore.store_id);
    if (customError) {
      setInventory([]);
      setLoading(false);
      return;
    }

    // 4. Build the inventory array (all records, but only active for display in 'Mi Tienda')
    let products: any[] = [];
    let totalCost = 0;
    for (const item of inventoryRows) {
      if (!item.is_active) continue; // Only show active in 'Mi Tienda'
      let productData = null;
      if (item.product_type === "custom") {
        productData = customProducts.find(p => p.store_product_id === item.product_reference_id);
      } else if (item.product_type === "global") {
        productData = globalProducts.find(p => p.product_id === item.product_reference_id);
      }
      if (productData) {
        products.push({
          id: String(item.inventory_id),
          product_reference_id: item.product_reference_id,
          name: productData.name,
          name_alias: item.name_alias,
          category: productData.category,
          image: productData.image || "/Groserybasket.png",
          quantity: item.quantity,
          price: Number(item.unit_price),
          cost: 0, // Puedes optimizar esto después si necesitas el costo
          created_at: item.created_at,
          description: productData.description,
          product_type: item.product_type,
        });
        // totalCost += ... // Si quieres calcular el costo, ajusta aquí
      }
    }
    // Order by most recent (created_at descending)
    products = products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setInventory(products);
    setTotalCost(totalCost);
    // Save the full inventoryRows for isInInventory logic
    setFullInventoryRows(inventoryRows);
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory()
  }, [selectedStore])

  useEffect(() => {
    if (filteredInventory.length > 0 && firstInventoryItemRef.current) {
      firstInventoryItemRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    // eslint-disable-next-line
  }, [inventory]);

  // Filter inventory based on search term and selected category
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true
    return (!searchTerm || matchesSearch) && (!activeTab || activeTab === "mi-tienda") && matchesCategory
  })

  // Filter catalog products based on search term and selected category
  const filteredCatalogProducts = catalogProducts.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true
    const notInInventory = !isInInventory(item.product_id, fullInventoryRows);
    // Siempre aplicar notInInventory para evitar duplicados
    return matchesSearch && matchesCategory && notInInventory
  })

  // Handle product selection
  const handleProductSelect = async (productId: string) => {
    if (!selectedStore?.store_id) {
      console.error("No store_id", { selectedStore });
      return;
    }
    if (!productId) {
      console.error("No productId", { productId });
      return;
    }
    try {
      // Check if the product already exists in store_inventory (active or inactive)
      const { data: existing, error: fetchError } = await supabase
        .from("store_inventory")
        .select("inventory_id, is_active")
        .eq("store_id", selectedStore.store_id)
        .eq("product_reference_id", productId)
      
      if (fetchError) throw fetchError;

      const inactiveEntries = existing.filter(entry => !entry.is_active);

      if (existing && existing.length > 0) {
        if (inactiveEntries.length > 0) {
          // Reactivate all inactive entries for this product
          const updates = inactiveEntries.map(entry => 
            supabase
              .from("store_inventory")
              .update({ is_active: true })
              .eq("inventory_id", entry.inventory_id)
          );
          await Promise.all(updates);
        }
        // If there are active entries, do nothing to avoid duplicates.
      } else {
        // Insert new record if no entries exist at all
        const { error } = await supabase
          .from("store_inventory")
          .insert({
            store_id: selectedStore.store_id,
            product_reference_id: productId,
            product_type: "global",
            quantity: 0,
            unit_price: 0,
            is_active: true
          });
        if (error) throw error;
      }
      await fetchInventory();
    } catch (error) {
      console.error("Error selecting product:", error, { productId, selectedStore });
    }
  };

  // Handle product deselection
  const handleProductDeselect = async (inventoryId: string) => {
    if (!selectedStore?.store_id) return;
    try {
      const { error: updateError } = await supabase
        .from("store_inventory")
        .update({ is_active: false })
        .eq("inventory_id", inventoryId);
      if (updateError) throw updateError;
      await fetchInventory();
    } catch (error) {
      console.error("Error deselecting product:", error);
    }
  };

  const handleRequestDelete = (inventoryId: string) => {
    setProductToDeleteId(inventoryId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDeleteId) {
      handleProductDeselect(productToDeleteId);
    }
    setProductToDeleteId(null);
    setIsDeleteModalOpen(false);
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
      // Actualizar el precio en el estado local inmediatamente
      setInventory((prev) => prev.map((prod) =>
        prod.id === item.id ? { ...prod, price: newPrice } : prod
      ));
      item.price = newPrice;
    } finally {
      setSavingPrice(false);
      setEditingPriceId(null);
    }
  };

  // Obtener categorías únicas de los productos del catálogo y del inventario
  const dynamicCatalogCategories = Array.from(
    new Set(
      catalogProducts
        .filter(item => !isInInventory(item.product_id, fullInventoryRows)) // Solo productos que no están en el inventario o están inactivos
        .map(item => item.category)
    )
  ).filter(Boolean);
  const dynamicInventoryCategories = Array.from(new Set(inventory.map((item) => item.category).filter(Boolean)));

  // Decide qué categorías mostrar según la pestaña activa
  const categoriesToShow = activeTab === "productos"
    ? dynamicCatalogCategories
    : dynamicInventoryCategories;

  // Resetear categoría al cambiar de sección
  useEffect(() => {
    setSelectedCategory(null);
  }, [activeTab]);

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

      {/* Search Bar - sticky on mobile, ahora arriba de los tabs */}
      <div className="sticky top-0 z-10 bg-reddi-background px-4 py-2 md:static md:shadow-none mb-2">
        <SearchBar
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
            setSelectedCategory(null);
          }}
          placeholder={
            activeTab === "mi-tienda"
              ? "Buscar en mi tienda..."
              : "Buscar en el catálogo de productos..."
          }
          className="shadow-md"
        />
      </div>

      {/* Vista de búsqueda global o vista normal */}
      {searchTerm ? (
        <div className="w-full px-4 space-y-6 pb-32">
          {/* Resultados en tu tienda */}
          <div>
            <h4 className="text-base font-semibold text-gray-700 mb-2">En tu tienda</h4>
            {filteredInventory.length > 0 ? (
              <div className="space-y-3 w-full">
                {filteredInventory.map((item, idx) => (
                  <InventoryProductCard
                    key={item.id || idx}
                    product={item}
                    selected={true}
                    editablePrice={true}
                    editingPriceId={editingPriceId}
                    editingPriceValue={editingPriceValue}
                    savingPrice={savingPrice}
                    onEditPrice={(id, value) => {
                      setEditingPriceId(id);
                      setEditingPriceValue(value);
                      handleSavePrice({ ...item, id });
                    }}
                    onEditPriceStart={(id, value) => {
                      setEditingPriceId(id);
                      setEditingPriceValue(value);
                    }}
                    onDeselect={handleProductDeselect}
                    onNavigate={navigateToProductDetail}
                    onDeleteRequest={handleRequestDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-sm">No hay resultados en tu tienda.</div>
            )}
          </div>
          {/* Resultados en el catálogo */}
          <div>
            <h4 className="text-base font-semibold text-gray-700 mb-2">En el catálogo</h4>
            {filteredCatalogProducts.length > 0 ? (
              <div className="space-y-3 w-full">
                {filteredCatalogProducts.map((item, idx) => {
                  const selected = isInInventory(item.product_id, fullInventoryRows);
                  const inventoryItem = fullInventoryRows.find(row => String(row.product_reference_id) === String(item.product_id) && row.is_active === true);
                  const inventoryId = inventoryItem ? inventoryItem.inventory_id : null;
                  return (
                    <InventoryProductCard
                      key={item.product_id || idx}
                      product={{
                        id: String(item.product_id),
                        product_reference_id: item.product_id,
                        name: item.name,
                        name_alias: item.name_alias,
                        category: item.category,
                        image: item.image,
                        price: 0,
                        description: item.description,
                      }}
                      selected={selected}
                      editablePrice={false}
                      onSelect={handleProductSelect}
                      onDeselect={handleProductDeselect}
                      onNavigate={() => {
                        if (inventoryId) {
                          navigateToProductDetail(inventoryId);
                        } else {
                          setSelectedCatalogProductId(item.product_id);
                          setShowCatalogDetail(true);
                        }
                      }}
                      onDeleteRequest={handleRequestDelete}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-gray-400 text-sm">No hay resultados en el catálogo.</div>
            )}
          </div>
        </div>
      ) : (
        <>
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

            {/* Category Filters */}
            <div className="flex overflow-x-auto py-2 px-4 space-x-2 scrollbar-hide">
              {["Todas las categorías", ...categoriesToShow].map((category, idx) => (
                <button
                  key={category + '-' + idx}
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

            {/* Guía para el usuario */}
            <div className="px-4 mt-4 mb-2">
              {activeTab === "mi-tienda" && (
                <InfoButton
                  imageSrc="/icons/carrito.png"
                  title="Éstos son tus productos"
                  description="Puedes editar sus precios, categorías o removerlos de tu inventario."
                />
              )}
              {activeTab === "productos" && (
                <InfoButton
                  imageSrc="/icons/catalogo.png"
                  title="Selecciona de este catálogo"
                  description="Los productos que selecciones se guardarán en Mi Tienda."
                />
              )}
            </div>

            {/* Mi Tienda Tab Content */}
            {activeTab === "mi-tienda" && (
              <TabsContent value="mi-tienda" className="text-base flex-1 flex flex-col items-center justify-center p-2 pb-32 pt-4">
                {loading ? (
                  <div className="p-8 text-center text-gray-500">Cargando tus productos...</div>
                ) : filteredInventory.length > 0 ? (
                  <div className="space-y-3 w-full">
                    {filteredInventory.map((item, idx) => (
                      <InventoryProductCard
                        key={item.id || idx}
                        product={item}
                        selected={true}
                        editablePrice={true}
                        editingPriceId={editingPriceId}
                        editingPriceValue={editingPriceValue}
                        savingPrice={savingPrice}
                        onEditPrice={(id, value) => {
                          setEditingPriceId(id);
                          setEditingPriceValue(value);
                          handleSavePrice({ ...item, id });
                        }}
                        onEditPriceStart={(id, value) => {
                          setEditingPriceId(id);
                          setEditingPriceValue(value);
                        }}
                        onDeselect={handleProductDeselect}
                        onNavigate={navigateToProductDetail}
                        onDeleteRequest={handleRequestDelete}
                      />
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
            )}

            {/* Productos Tab Content */}
            {activeTab === "productos" && (
              <TabsContent value="productos" className="text-base flex-1 flex flex-col items-center justify-center p-2 pb-24 pt-4">
                {loading ? (
                  <div className="p-8 text-center text-gray-500">Cargando productos...</div>
                ) : filteredCatalogProducts.length > 0 ? (
                  <div className="space-y-3 w-full">
                    {filteredCatalogProducts.map((item, idx) => {
                      const selected = isInInventory(item.product_id, fullInventoryRows);
                      const inventoryItem = fullInventoryRows.find(row => String(row.product_reference_id) === String(item.product_id) && row.is_active === true);
                      const inventoryId = inventoryItem ? inventoryItem.inventory_id : null;
                      return (
                        <InventoryProductCard
                          key={item.product_id || idx}
                          product={{
                            id: String(item.product_id),
                            product_reference_id: item.product_id,
                            name: item.name,
                            name_alias: item.name_alias,
                            category: item.category,
                            image: item.image,
                            price: 0,
                            description: item.description,
                          }}
                          selected={selected}
                          editablePrice={false}
                          onSelect={handleProductSelect}
                          onDeselect={handleProductDeselect}
                          onNavigate={() => {
                            if (inventoryId) {
                              navigateToProductDetail(inventoryId);
                            } else {
                              setSelectedCatalogProductId(item.product_id);
                              setShowCatalogDetail(true);
                            }
                          }}
                          onDeleteRequest={handleRequestDelete}
                        />
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
            )}
          </Tabs>
        </>
      )}

      {/* Action Buttons */}
      {activeTab === "mi-tienda" && !searchTerm && (
        <div className="fixed bottom-16 left-0 right-0 px-4 pb-2 flex gap-2">
          <Button
            onClick={handleShowCreateProductForm}
            className="w-full rounded-xl bg-gray-800 p-5 text-lg font-medium text-white hover:bg-gray-700"
          >
            Crear producto
          </Button>
        </div>
      )}

      {/* Modal para detalle de producto del catálogo */}
      {showCatalogDetail && selectedCatalogProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <ProductCatalogDetail
            productId={selectedCatalogProductId}
            onClose={() => {
              setShowCatalogDetail(false);
              setSelectedCatalogProductId(null);
            }}
          />
        </div>
      )}

      <DeleteProductModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
