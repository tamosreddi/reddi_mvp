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

// Sample product data (in a real app, this would come from an API or database)
const sampleProducts = [
  {
    id: "1",
    name: "Refresco Cola 600ml",
    quantity: 24,
    price: 18.5,
    cost: 12.0,
    category: "Bebidas",
    image: "/refreshing-drink.png",
    barcode: "7501234567890",
    description: "Refresco de cola en botella de 600ml",
  },
  {
    id: "2",
    name: "Pan Blanco",
    quantity: 10,
    price: 35.0,
    cost: 20.0,
    category: "Panadería",
    image: "/cooking-pan.png",
    barcode: "7509876543210",
    description: "Pan blanco de caja, ideal para sándwiches",
  },
  {
    id: "3",
    name: "Leche 1L",
    quantity: 15,
    price: 24.0,
    cost: 18.0,
    category: "Lácteos",
    image: "/glass-of-milk.png",
    barcode: "7501122334455",
    description: "Leche entera pasteurizada, 1 litro",
  },
  {
    id: "4",
    name: "Jabón de Baño",
    quantity: 20,
    price: 15.5,
    cost: 10.0,
    category: "Higiene",
    image: "/jabon.png",
    barcode: "7506677889900",
    description: "Jabón de baño con aroma a lavanda",
  },
  {
    id: "5",
    name: "Papel Higiénico (4 rollos)",
    quantity: 12,
    price: 45.0,
    cost: 30.0,
    category: "Higiene",
    image: "/crumpled-paper.png",
    barcode: "7503344556677",
    description: "Paquete de 4 rollos de papel higiénico",
  },
]

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

  // Load product data
  useEffect(() => {
    setIsLoading(true)
    // In a real app, this would be an API call
    const foundProduct = sampleProducts.find((p) => p.id === productId)

    if (foundProduct) {
      setProduct(foundProduct)
    } else {
      // If product not found, show error and redirect
      toast({
        title: "Producto no encontrado",
        description: "No se pudo encontrar el producto solicitado",
        variant: "destructive",
      })
      router.push("/inventario")
    }

    setIsLoading(false)
  }, [productId, router, toast])

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
      <div className="fixed left-0 right-0 top-0 z-10 bg-yellow-400 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/inventario")}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Ver producto</h1>
          <div className="w-12"></div> {/* Spacer for centering */}
        </div>
      </div>

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
          <Label htmlFor="barcode" className="text-lg font-medium">
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
              className="flex h-14 w-14 items-center justify-center rounded-xl border-gray-200"
            >
              <Barcode className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Product Name */}
        <div>
          <Label htmlFor="name" className="text-lg font-medium">
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
          <Label htmlFor="quantity" className="text-lg font-medium">
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
          <Label htmlFor="price" className="text-lg font-medium">
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
              step="0.01"
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
            <Label htmlFor="cost" className="text-lg font-medium">
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
              step="0.01"
              value={product.cost}
              onChange={(e) => handleChange("cost", Number.parseFloat(e.target.value) || 0)}
              className="rounded-xl border-gray-200 pl-7"
              placeholder="0"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <Label htmlFor="category" className="text-lg font-medium">
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
          <Label htmlFor="description" className="text-lg font-medium">
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
          className="flex w-full items-center justify-center py-2 text-lg font-medium text-red-500"
        >
          <Trash2 className="mr-2 h-5 w-5" />
          Eliminar producto
        </button>
      </div>
    </div>
  )
}
