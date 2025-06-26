import { Plus, Trash2, Minus } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

interface ProductAddButtonProps {
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  onDelete: () => void;
  className?: string;
  variant?: "default" | "cart";
}

const ProductAddButton: React.FC<ProductAddButtonProps> = ({
  quantity,
  onAdd,
  onRemove,
  onDelete,
  className = "",
  variant = "default",
}) => {
  if (variant === "cart") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 bg-white border border-gray-300 rounded-full px-2 py-1 shadow-sm",
          className
        )}
      >
        {quantity === 1 ? (
          <button
            className="flex items-center justify-center w-8 h-8"
            aria-label="Eliminar producto del carrito"
            onClick={e => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="text-gray-700 w-5 h-5" />
          </button>
        ) : (
          <button
            className="flex items-center justify-center w-8 h-8"
            aria-label="Quitar uno del producto"
            onClick={e => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <Minus className="text-gray-700 w-5 h-5" />
          </button>
        )}
        <span className="text-gray-900 font-bold text-base select-none min-w-[2ch] text-center">{quantity} ct</span>
        <button
          className="flex items-center justify-center w-8 h-8"
          aria-label="Agregar más del producto"
          onClick={e => {
            e.stopPropagation();
            onAdd();
          }}
        >
          <Plus className="text-gray-700 w-5 h-5" />
        </button>
      </div>
    );
  }

  // Variante flotante verde (por defecto)
  if (quantity === 0) {
    return (
      <button
        className={cn(
          "absolute top-0 right-0 bg-green-600 rounded-full w-8 h-8 flex items-center justify-center shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 z-10",
          className
        )}
        aria-label="Agregar producto"
        onClick={e => {
          e.stopPropagation();
          onAdd();
        }}
      >
        <Plus className="text-white w-5 h-5" />
      </button>
    );
  }

  return (
    <div
      className={cn(
        "absolute top-0 left-0 right-0 flex items-center justify-between bg-green-600 rounded-full px-1 py-0.5 h-8 z-10",
        className
      )}
    >
      {quantity === 1 ? (
        <button
          className="flex items-center justify-center w-6 h-6"
          aria-label="Eliminar producto del carrito"
          onClick={e => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="text-white w-4 h-4" />
        </button>
      ) : (
        <button
          className="flex items-center justify-center w-6 h-6"
          aria-label="Quitar uno del producto"
          onClick={e => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <Minus className="text-white w-4 h-4" />
        </button>
      )}
      <span className="text-white font-bold text-sm select-none">{quantity} ct</span>
      <button
        className="flex items-center justify-center w-6 h-6"
        aria-label="Agregar más del producto"
        onClick={e => {
          e.stopPropagation();
          onAdd();
        }}
      >
        <Plus className="text-white w-4 h-4" />
      </button>
    </div>
  );
};

export default ProductAddButton; 