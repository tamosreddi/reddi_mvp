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
    store_product_id: "",
    name: "",
    name_alias: "",
    quantity: 0,
    price: 0,
    cost: 0,
    category: "",
    image: "",
    barcode: "",
    description: "",
    product_type: "",
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

      // Obtener el batch más reciente con stock
      let batchCost = null;
      if (inventory) {
        const { data: batches } = await supabase
          .from("inventory_batches")
          .select("unit_cost")
          .eq("product_reference_id", inventory.product_reference_id)
          .eq("store_id", inventory.store_id)
          .gt("quantity_remaining", 0)
          .order("received_date", { ascending: false })
          .limit(1);

        if (batches && batches.length > 0) {
          batchCost = batches[0].unit_cost;
        }
      }

      setProduct({
        id: inventory.inventory_id,
        store_product_id: inventory.product_type === "custom" ? inventory.product_reference_id : "",
        name: productDetails?.name || "",
        name_alias: inventory.name_alias || "",
        quantity: inventory.quantity,
        price: Number(inventory.unit_price),
        cost: batchCost !== null && batchCost !== undefined ? Number(batchCost) : 0,
        category: productDetails?.category || "",
        image: productDetails?.image || "/Groserybasket.png",
        barcode: productDetails?.barcode || "",
        description: productDetails?.description || "",
        product_type: inventory.product_type,
      });
      setIsLoading(false);
    };
    fetchProduct();
  }, [productId, router, toast, selectedStore]);

  // Handle form input changes
  const handleChange = (field: string, value: string | number) => {
    setProduct((prev) => ({
      ...prev,
      [field]: (field === "price" || field === "cost" || field === "quantity")
        ? value === "" ? "" : Number(value)
        : value,
    }))
  }

  // Handle save
  const handleSave = async () => {
    setIsLoading(true);
    let error = null;

    // 1. Obtener todos los batches activos (quantity_remaining > 0) para este producto y tienda
    const { data: batches, error: batchFetchError } = await supabase
      .from("inventory_batches")
      .select("batch_id, quantity_remaining, unit_cost, received_date")
      .eq("product_reference_id", product.product_type === "custom" ? product.store_product_id : product.id)
      .eq("store_id", selectedStore?.store_id)
      .gt("quantity_remaining", 0)
      .order("received_date", { ascending: true }); // FIFO

    if (batchFetchError) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "No se pudieron obtener los batches de inventario.",
        variant: "destructive",
      });
      return;
    }

    // 2. Calcular el total actual y la diferencia con la cantidad nueva
    const currentTotal = batches.reduce((sum, b) => sum + Number(b.quantity_remaining), 0);
    const newTotal = Number(product.quantity);
    const diff = newTotal - currentTotal;

    // 3. Aquí irá la lógica para aumentar o disminuir inventario según diff
    //    - Si diff > 0: crear nuevo batch
    //    - Si diff < 0: restar de batches existentes (FIFO)
    //    - Si diff === 0: no hacer nada

    if (diff > 0) {
      // Aumentar inventario: crear un nuevo batch
      // Usar el último unit_cost conocido (del batch más reciente) o 0 si no hay batches
      let lastCost = 0;
      if (batches.length > 0) {
        lastCost = Number(batches[batches.length - 1].unit_cost) || 0;
      } else if (product.cost) {
        lastCost = Number(product.cost) || 0;
      }
      const { error: batchInsertError } = await supabase.from("inventory_batches").insert([
        {
          store_id: selectedStore?.store_id,
          product_reference_id: product.product_type === "custom" ? product.store_product_id : product.id,
          product_type: product.product_type,
          quantity_received: diff,
          quantity_remaining: diff,
          unit_cost: lastCost,
          received_date: new Date().toISOString(),
          expiration_date: null,
        }
      ]);
      if (batchInsertError) {
        setIsLoading(false);
        toast({
          title: "Error",
          description: "No se pudo crear el nuevo batch de inventario.",
          variant: "destructive",
        });
        return;
      }
    }

    if (diff < 0) {
      // Reducir inventario: restar unidades de los batches existentes (FIFO)
      let toRemove = Math.abs(diff);
      for (const batch of batches) {
        if (toRemove <= 0) break;
        const removeQty = Math.min(Number(batch.quantity_remaining), toRemove);
        const newQty = Number(batch.quantity_remaining) - removeQty;
        const { error: updateBatchError } = await supabase
          .from("inventory_batches")
          .update({ quantity_remaining: newQty })
          .eq("batch_id", batch.batch_id);
        if (updateBatchError) {
          setIsLoading(false);
          toast({
            title: "Error",
            description: "No se pudo actualizar el inventario por lotes.",
            variant: "destructive",
          });
          return;
        }
        toRemove -= removeQty;
      }
    }

    console.log("PRODUCT STATE:", product);

    if (product.product_type === "global") {
      // Solo actualiza el alias y los campos de inventario
      const { error: invError } = await supabase
        .from("store_inventory")
        .update({
          name_alias: product.name_alias,
          quantity: product.quantity,
          unit_price: product.price,
          unit_cost: product.cost,
        })
        .eq("inventory_id", product.id);

      error = invError;
    } else if (product.product_type === "custom") {
      // Actualiza el producto personalizado
      const { error: prodError } = await supabase
        .from("store_products")
        .update({
          name: product.name,
          category: product.category,
          barcode: product.barcode,
          description: product.description,
        })
        .eq("store_product_id", product.store_product_id);

      // Actualiza el inventario
      const { error: invError } = await supabase
        .from("store_inventory")
        .update({
          quantity: product.quantity,
          unit_price: product.price,
          unit_cost: product.cost,
        })
        .eq("inventory_id", product.id);

      console.log("UPDATE store_products error:", prodError);
      console.log("UPDATE store_inventory error:", invError);

      error = prodError || invError;
    }

    // Después de la lógica de batches (aumentar/reducir), actualiza el unit_cost en todos los batches activos
    const { error: updateCostError } = await supabase
      .from("inventory_batches")
      .update({ unit_cost: Number(product.cost) })
      .eq("product_reference_id", product.product_type === "custom" ? product.store_product_id : product.id)
      .eq("store_id", selectedStore?.store_id)
      .gt("quantity_remaining", 0);
    if (updateCostError) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "No se pudo actualizar el costo en los batches activos.",
        variant: "destructive",
      });
      return;
    }

    const { error: priceUpdateError } = await supabase
      .from("store_inventory")
      .update({ unit_price: Number(product.price) })
      .eq("inventory_id", product.id);

    if (priceUpdateError) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "No se pudo actualizar el precio del producto.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(false);
    if (!error) {
      toast({
        title: "Cambios guardados",
        description: "Los cambios al producto han sido guardados exitosamente",
        variant: "success",
      });
      router.push("/inventario");
    } else {
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

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

  // Estado para mostrar el tooltip de información de costo
  const [showCostInfo, setShowCostInfo] = useState(false);

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
          {product.product_type === "custom" ? (
            <Input
              id="name"
              value={product.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="mt-1 rounded-xl border-gray-200"
              placeholder="Ej: Refresco Cola 600ml"
            />
          ) : (
            <Input
              id="name_alias"
              value={product.name_alias !== "" ? product.name_alias : product.name}
              onChange={(e) => handleChange("name_alias", e.target.value)}
              className="mt-1 rounded-xl border-gray-200"
              placeholder={product.name || "Ej: Refresco Cola 600ml"}
            />
          )}
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
            <button
              type="button"
              className="ml-2 focus:outline-none"
              onClick={() => setShowCostInfo((v) => !v)}
              tabIndex={0}
              aria-label="Información sobre el costo"
            >
              <Info className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500">$</span>
            </div>
            <Input
              id="cost"
              type="number"
              min="0"
              step="0.5"
              value={product.cost}
              onChange={(e) => handleChange("cost", e.target.value)}
              className="rounded-xl border-gray-200 pl-7"
              placeholder="0"
            />
          </div>
        </div>
        {showCostInfo && (
          <div className="mt-1 mb-2 bg-gray-100 border border-gray-300 rounded p-2 text-xs text-gray-700 max-w-xs">
            Si se necesita cambiar el costo por unidad de este producto, es recomendable eliminar el producto existente y crear uno nuevo.
          </div>
        )}

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
