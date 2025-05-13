//Formulario para crear un producto nuevo en el inventario.

"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Barcode, Info, Upload } from "lucide-react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRouter, useSearchParams } from "next/navigation"

interface CreateProductFormProps {
  initialReferrer?: string
  onCancel?: () => void
  onSuccess?: () => void
}

export default function CreateProductForm({ initialReferrer, onCancel, onSuccess }: CreateProductFormProps) {
  const [name, setName] = useState("")
  const [barcode, setBarcode] = useState("")
  const [price, setPrice] = useState("")
  const [cost, setCost] = useState("")
  const [quantity, setQuantity] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Obtain referrer from props or search params as fallback
  const referrer = initialReferrer || searchParams.get("referrer") || "/inventario"

  const categories = ["Bebidas", "Panadería", "Lácteos", "Higiene", "Snacks", "Abarrotes", "Otro"]

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      setImage(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí normalmente guardarías el producto en tu base de datos
    alert("Producto registrado con éxito!")

    // Use the onSuccess callback if provided, otherwise navigate
    if (onSuccess) {
      onSuccess()
    } else {
      // Navegar de vuelta a la página de referencia después de guardar
      router.push(referrer)
    }
  }

  const handleBack = () => {
    // Use the onCancel callback if provided, otherwise navigate
    if (onCancel) {
      onCancel()
    } else {
      // Navegar de vuelta a la página de referencia
      router.push(referrer)
    }
  }

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="fixed left-0 right-0 top-0 z-10 bg-yellow-400 p-4">
        <div className="flex items-center justify-between h-10">
          <button onClick={handleBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Crear producto</h1>
          <div className="w-12"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Form content - with padding to account for fixed header */}
      <form onSubmit={handleSubmit} className="mt-20 space-y-4 p-4 pb-20">
        {/* Image Upload */}
        <div className="flex justify-center">
          <label
            htmlFor="image-upload"
            className="flex h-48 w-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-blue-400 bg-blue-50 transition-colors hover:bg-blue-100"
          >
            {previewUrl ? (
              <img
                src={previewUrl || "/Groserybasket.png"}
                alt="Vista previa"
                className="h-full w-full rounded-lg object-cover grayscale"
              />
            ) : (
              <>
                <Upload className="mb-2 h-8 w-8 text-blue-500" />
                <span className="text-center text-blue-500">Cargar imágen</span>
              </>
            )}
            <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        </div>

        {/* Barcode */}
        <div>
          <Label htmlFor="barcode" className="text-lg font-medium">
            Código de barras
          </Label>
          <div className="mt-1 flex gap-2">
            <Input
              id="barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
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
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
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
              value={price}
              onChange={(e) => setPrice(e.target.value)}
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
              value={cost}
              onChange={(e) => setCost(e.target.value)}
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
          <Select value={category} onValueChange={setCategory}>
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 min-h-[100px] rounded-xl border-gray-200"
            placeholder="Añadir una descripción ayudará a tus clientes a elegir más fácil"
          />
        </div>

        {/* Required Fields Note */}
        <p className="text-center text-gray-500">Los campos marcados con (*) son obligatorios</p>

        {/* Submit Button */}
        <div className="sticky bottom-4 left-0 right-0 mt-6">
          <Button
            type="submit"
            className="w-full rounded-xl bg-gray-800 p-6 text-lg font-medium text-white hover:bg-gray-700"
          >
            Crear producto
          </Button>
        </div>
      </form>
    </div>
  )
}
