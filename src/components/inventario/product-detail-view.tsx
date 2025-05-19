// Al clickear el producto en el inventario, se muestra esta página con los datos del producto.

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Info, Barcode, Pencil, Trash2 } from "lucide-react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import TopProfileMenu from "@/components/shared/top-profile-menu"
import { supabase } from "@/lib/supabase/supabaseClient"
import { useStore } from "@/lib/contexts/StoreContext"

interface ProductDetailViewProps {
  productId: string
}

export default function ProductDetailView({ productId }: ProductDetailViewProps) {
  const router = useRouter()
  const { toast } = useToast()

  // Product state
  const [product, setProduct] = useState({
    id: "",
    name: "",
    quantity: 0,
    price: 0,
    cost: 0,
    category: "",
    image: "",
    barcode: "",
    description: "",
  })

  // Loading state
  const [isLoading, setIsLoading] = useState(true)

  // Categories
  const categories = ["Bebidas", "Panadería", "Lácteos", "Higiene", "Snacks", "Abarrotes", "Granos", "Otro"]

  // Load product data from Supabase
  const { selectedStore } = useStore();
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      // 1. Buscar el registro de inventario
      const { data: inventory, error: invError } = await supabase
        .from("store_inventory")
        .select("*")
        .eq("inventory_id", productId)
        .single();
      if (invError || !inventory) {
        toast({
          title: "Producto no encontrado",
          description: "No se pudo encontrar el producto solicitado",
          variant: "destructive",
        });
        router.push("/inventario");
        setIsLoading(false);
        return;
      }
      let productDetails = null;
      if (inventory.product_type === "custom") {
        // Buscar en store_products
        const { data } = await supabase
          .from("store_products")
          .select("name, category, image, barcode, description")
          .eq("store_product_id", inventory.product_reference_id)
          .single();
        productDetails = data;
      } else if (inventory.product_type === "global") {
        // Buscar en products
        const { data } = await supabase
          .from("products")
          .select("name, category, brand, barcode, description, image")
          .eq("product_id", inventory.product_reference_id)
          .single();
        productDetails = data;
      }
      setProduct({
        id: inventory.inventory_id,
        name: productDetails?.name || "",
        quantity: inventory.quantity,
        price: Number(inventory.unit_price),
        cost: Number(inventory.unit_cost),
        category: productDetails?.category || "",
        image: productDetails?.image || "/Groserybasket.png",
        barcode: productDetails?.barcode || "",
        description: productDetails?.description || "",
      });
      setIsLoading(false);
    };
    fetchProduct();
  }, [productId, router, toast, selectedStore]);

  // Handle form input changes
  const handleChange = (field: string, value: string | number) => {
    setProduct((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle save
  const handleSave = () => {
    // In a real app, this would be an API call to update the product
    toast({
      title: "Cambios guardados",
      description: "Los cambios al producto han sido guardados exitosamente",
      variant: "success",
    })
    router.push("/inventario")
  }

  // Handle delete
  const handleDelete = () => {
    // In a real app, this would be an API call to delete the product
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este producto?")

    if (confirmDelete) {
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado exitosamente",
        variant: "success",
      })
      router.push("/inventario")
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Cargando producto...</p>
      </div>
    )
  }

  return (
    <div className="pb-6">
      {/* Header */}
      <TopProfileMenu
        simpleMode
        title="Ver producto"
        onBackClick={() => router.push("/inventario")}
      />

      {/* Form content - with padding to account for fixed header */}
      <div className="mt-20 space-y-4 p-4">
        {/* Product Image */}
        <div className="flex justify-center">
          <div className="relative h-48 w-48 overflow-hidden rounded-lg">
            <img
              src={product.image || "/Groserybasket.png"}
              alt={product.name}
              className="h-full w-full object-cover grayscale"
            />
            <button
              className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md"
              aria-label="Editar imagen"
            >
              <Pencil className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Barcode */}
        <div>
          <Label htmlFor="barcode" className="text-base font-bold">
            Código de barras
          </Label>
          <div className="mt-1 flex gap-2">
            <Input
              id="barcode"
              value={product.barcode}
              onChange={(e) => handleChange("barcode", e.target.value)}
              className="rounded-xl border-gray-200"
              placeholder="Escribe el código o escanéalo"
            />
            <Button
              type="button"
              variant="outline"
              className="flex h-10 w-10 items-center justify-center rounded-xl border-gray-200"
            >
              <Barcode className="h-7 w-7" />
            </Button>
          </div>
        </div>

        {/* Product Name */}
        <div>
          <Label htmlFor="name" className="text-base font-bold">
            Nombre del producto <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={product.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="mt-1 rounded-xl border-gray-200"
            placeholder="Ej: Refresco Cola 600ml"
            required
          />
        </div>

        {/* Available Quantity */}
        <div>
          <Label htmlFor="quantity" className="text-base font-bold">
            Cantidad disponible
          </Label>
          <Input
            id="quantity"
            type="number"
            min="0"
            value={product.quantity}
            onChange={(e) => handleChange("quantity", Number.parseInt(e.target.value) || 0)}
            className="mt-1 rounded-xl border-gray-200"
            placeholder="0"
          />
        </div>

        {/* Price */}
        <div>
          <Label htmlFor="price" className="text-base font-bold">
            Precio <span className="text-red-500">*</span>
          </Label>
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500">$</span>
            </div>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.50"
              value={product.price}
              onChange={(e) => handleChange("price", Number.parseFloat(e.target.value) || 0)}
              className="rounded-xl border-gray-200 pl-7"
              placeholder="0"
              required
            />
          </div>
        </div>

        {/* Cost */}
        <div>
          <div className="flex items-center">
            <Label htmlFor="cost" className="text-base font-bold">
              Costo
            </Label>
            <Info className="ml-2 h-5 w-5 text-gray-400" />
          </div>
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500">$</span>
            </div>
            <Input
              id="cost"
              type="number"
              min="0"
              step="0.50"
              value={product.cost}
              onChange={(e) => handleChange("cost", Number.parseFloat(e.target.value) || 0)}
              className="rounded-xl border-gray-200 pl-7"
              placeholder="0"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <Label htmlFor="category" className="text-base font-bold">
            Categoría
          </Label>
          <Select value={product.category} onValueChange={(value) => handleChange("category", value)}>
            <SelectTrigger id="category" className="mt-1 rounded-xl border-gray-200">
              <SelectValue placeholder="Selecciona una opción" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description" className="text-base font-bold">
            Descripción
          </Label>
          <Textarea
            id="description"
            value={product.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="mt-1 min-h-[100px] rounded-xl border-gray-200"
            placeholder="Añadir una descripción ayudará a tus clientes a elegir más fácil"
          />
        </div>

        {/* Required Fields Note */}
        <p className="text-center text-gray-500">Los campos marcados con (*) son obligatorios</p>

        {/* Extra space at the bottom to prevent content from being hidden behind fixed buttons */}
        <div className="h-24"></div>
      </div>

      {/* Fixed Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 z-10 space-y-1 p-3 bg-gray-50 border-t border-gray-200 shadow-md">
        {/* Save Button */}
        <Button
          onClick={handleSave}
          className="w-full rounded-xl bg-gray-800 p-4 text-lg font-medium text-white hover:bg-gray-700"
        >
          Guardar cambios
        </Button>

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className="flex w-full items-center justify-center py-2 text-base font-medium text-red-500"
        >
          <Trash2 className="mr-2 h-5 w-5" />
          Eliminar producto
        </button>
      </div>
    </div>
  )
}
