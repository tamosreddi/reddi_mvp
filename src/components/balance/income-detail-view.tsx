"use client"
import { ArrowLeft, FileText, Edit, Trash2, Package, Calendar, CreditCard, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface IncomeDetailProps {
  transaction: {
    id: number
    type: string
    name: string
    amount: number
    paymentMethod: string
    date: Date
    status: string
    profit?: number
    products?: Array<{
      name: string
      quantity: number
      unitPrice: number
      image?: string
    }>
  }
  onClose: () => void
}

export default function IncomeDetailView({ transaction, onClose }: IncomeDetailProps) {
  // Calculate profit if not provided (for demo purposes)
  const profit = transaction.profit || Math.round(transaction.amount * 0.99)

  // Get products or create a default one based on transaction name
  const products = transaction.products || [
    {
      name: transaction.name,
      quantity: 1,
      unitPrice: transaction.amount,
      image: "/diverse-products-still-life.png",
    },
  ]

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-yellow-400 p-4">
        <div className="flex items-center justify-between h-10">
          <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Detalle de la venta</h1>
          <div className="w-10"></div> {/* Spacer for balanced spacing */}
        </div>
      </div>

      {/* Content - Further reduced padding and spacing */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Sale Summary - Ultra compact */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Resumen de la venta</h2>

          <div className="text-blue-600 text-sm mb-3">Transacción #{transaction.id}</div>

          <div className="border-t border-gray-200 py-3">
            <div className="text-gray-600 text-xs mb-1.5">Concepto</div>
            <div className="text-lg font-bold mt-1">{transaction.name}</div>
          </div>

          <div className="border-t border-gray-200 py-3">
            <div className="text-gray-600 text-xs mb-1.5">Valor total</div>
            <div className="text-2xl font-bold mt-1">{transaction.amount} US$</div>
          </div>

          <div className="border-t border-gray-200 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <div className="text-gray-600 text-sm">Fecha y hora</div>
              </div>
              <div className="text-gray-800 text-sm">
                {format(transaction.date, "h:mm a", { locale: es })} |{" "}
                {format(transaction.date, "dd MMM yyyy", { locale: es })}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                <div className="text-gray-600 text-sm">Método de pago</div>
              </div>
              <div className="text-gray-800 text-sm">{transaction.paymentMethod}</div>
            </div>
          </div>

          <div className="border-t border-gray-200 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Package className="h-5 w-5 text-gray-400 mr-2" />
                <div className="text-gray-600 text-sm">Referencias totales</div>
              </div>
              <div className="text-gray-800 text-sm">{products.length}</div>
            </div>
          </div>

          <div className="border-t border-gray-200 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-gray-400 mr-2" />
                <div className="text-gray-600 text-sm">Ganancia</div>
              </div>
              <div className="text-green-600 text-sm font-bold">{profit} US$</div>
            </div>
          </div>
        </div>

        {/* Product List - Ultra compact */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center mb-3">
            <div className="h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center mr-2">
              <Package className="h-3 w-3 text-yellow-600" />
            </div>
            <h2 className="text-base font-bold text-gray-800">Listado de productos</h2>
          </div>

          {products.map((product, index) => (
            <div key={index} className="flex items-center border-t border-gray-200 py-3">
              <div className="h-10 w-10 bg-gray-100 rounded-lg overflow-hidden mr-2">
                <img
                  src={product.image || "/placeholder.svg?height=40&width=40&query=product"}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm text-gray-800">{product.name}</h3>
                <p className="text-gray-600 text-xs">{product.quantity} und</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-gray-800">{product.quantity * product.unitPrice} US$</p>
                <p className="text-gray-600 text-xs">Precio U. {product.unitPrice} US$</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 border-t border-gray-200 bg-white">
        <button className="flex flex-col items-center justify-center py-4 text-gray-600">
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-1">
            <FileText className="h-5 w-5" />
          </div>
          <span className="text-sm">Comprobante</span>
        </button>
        <button className="flex flex-col items-center justify-center py-4 text-gray-800">
          <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center mb-1">
            <Edit className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm">Editar</span>
        </button>
        <button className="flex flex-col items-center justify-center py-4 text-red-600">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-1">
            <Trash2 className="h-5 w-5" />
          </div>
          <span className="text-sm">Eliminar</span>
        </button>
      </div>
    </div>
  )
}