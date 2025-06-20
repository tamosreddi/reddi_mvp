//Formulario para crear un producto nuevo en el inventario.

"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Barcode, Info, Upload } from "lucide-react"
import Button from "@/components/ui/button"
import Input from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter, useSearchParams } from "next/navigation"
import TopProfileMenu from "@/components/shared/top-profile-menu"
import { useStore } from "@/lib/contexts/StoreContext"
import { supabase } from "@/lib/supabase/supabaseClient"
import CategoryCreateProductModal from "@/components/shared/category_create_product_modal"
import SelectDropdown from "@/components/ui/select-dropdown"
import Image from 'next/image'

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
  const { selectedStore } = useStore()
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)

  const defaultCategories = [
    "Bebidas",
    "Panadería",
    "Lácteos",
    "Higiene",
    "Snacks",
    "Abarrotes",
    "Granos",
    "Otro"
  ];
  const [categories, setCategories] = useState(defaultCategories);

  // Obtain referrer from props or search params as fallback
  const referrer = initialReferrer || searchParams.get("referrer") || "/inventario"

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      setImage(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí normalmente guardarías el producto en tu base de datos
    // Para guardar en STORE_PRODUCTS

    try {
      const response = await supabase.from("store_products").insert([
        {
          name,
          category,
          description,
          barcode,
          store_id: selectedStore?.store_id,
        }
      ]).select()

      if (response.error) throw response.error;
      if (image && Array.isArray(response.data) && response.data.length > 0) {
        const formData = new FormData()
        formData.append("file", image, image.name)
        const uploadResponse = await supabase.storage.from("images").upload(`products/${response.data[0].id}/${image.name}`, formData)
        if (uploadResponse) {
          const publicUrl = supabase.storage.from("images").getPublicUrl(`products/${response.data[0].id}/${image.name}`)
          await supabase.from("store_products").update({ image: publicUrl.data.publicUrl }).eq("id", response.data[0].id)
        }
      }
      // Insertar en STORE_INVENTORY si el producto fue creado
      if (Array.isArray(response.data) && response.data.length > 0) {
        const store_product_id = response.data[0].store_product_id;
        const safeQuantity = quantity === "" ? 0 : Number(quantity);
        const safePrice = price === "" ? 0 : Number(price);
        const safeCost = cost === "" ? 0 : Number(cost);
        const invRes = await supabase.from("store_inventory").insert([
          {
            store_id: selectedStore?.store_id,
            product_reference_id: store_product_id,
            product_type: "custom",
            quantity: safeQuantity,
            unit_price: safePrice,
          }
        ])
        if (invRes.error) throw invRes.error;

        // Insertar en INVENTORY_BATCHES
        const batchRes = await supabase.from("inventory_batches").insert([
          {
            store_id: selectedStore?.store_id,
            product_reference_id: store_product_id,
            product_type: "custom",
            quantity_received: safeQuantity,
            quantity_remaining: safeQuantity,
            unit_cost: safeCost || null,
            received_date: new Date().toISOString(),
            expiration_date: null,
          }
        ])
        if (batchRes.error) throw batchRes.error;
      }
      // Redirigir tras éxito
      if (onSuccess) {
        onSuccess()
      } else {
        router.push(referrer)
      }
    } catch (error: any) {
      console.error("Error al guardar el producto:", error?.message || error)
      alert("Hubo un error al guardar el producto. " + (error?.message ? `\n\n${error.message}` : "Por favor, inténtelo más tarde."))
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
    <div className="pb-6 bg-reddi-background">
      {/* Header */}
      <TopProfileMenu
        simpleMode
        title="Crear producto"
        onBackClick={handleBack}
      />

      {/* Form content - with padding to account for fixed header */}
      <form onSubmit={handleSubmit} className="mt-20 space-y-4 p-4 pb-28">
        {/* Image Upload */}
        <div className="flex justify-center">
          <label
            htmlFor="image-upload"
            className="flex h-48 w-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-blue-400 bg-blue-50 transition-colors hover:bg-blue-100"
          >
            {previewUrl ? (
              <Image
                src={previewUrl || "/Groserybasket.png"}
                alt="Vista previa"
                width={192}
                height={192}
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
              type="text"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="rounded-xl border-gray-200 pl-7 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
              type="text"
              min="0"
              step="0.01"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="rounded-xl border-gray-200 pl-7 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0"
            />
          </div>
        </div>

        {/* Available Quantity - Hidden for now */}
        {/* <div>
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
        </div> */}

        {/* Category */}
        <SelectDropdown
          label="Categoría"
          id="category"
          value={category}
          onChange={(val) => {
            if (val === "Otro") {
              setIsCategoryModalOpen(true)
            } else {
              setCategory(val)
            }
          }}
          options={categories.map((cat) => ({ value: cat, label: cat }))}
          placeholder="Selecciona una categoría"
        />
        <CategoryCreateProductModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          onConfirm={(newCat) => {
            if (newCat) {
              setCategories((prev) => [...prev.filter((c) => c !== "Otro"), newCat, "Otro"]);
              setCategory(newCat);
            }
            setIsCategoryModalOpen(false);
          }}
        />

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

        {/* Barcode - Hidden for now */}
        {/* <div>
          <Label htmlFor="barcode" className="text-lg font-medium">
            Código de barras (Opcional)
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
        </div> */}

        {/* Required Fields Note */}
        <p className="text-center text-gray-500">Los campos marcados con (*) son obligatorios</p>

        {/* Submit Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
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
