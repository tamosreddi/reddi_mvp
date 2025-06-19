import Image from 'next/image';
import { Edit, Heart } from 'lucide-react';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface InventoryProductCardProps {
  product: {
    id: string;
    product_reference_id: string;
    name: string;
    name_alias?: string;
    category?: string;
    image?: string;
    quantity?: number;
    price: number;
    created_at?: string;
    description?: string;
  };
  selected?: boolean;
  editablePrice?: boolean;
  editingPriceId?: string | null;
  editingPriceValue?: string;
  savingPrice?: boolean;
  onEditPrice?: (id: string, value: string) => void;
  onEditPriceStart?: (id: string, value: string) => void;
  onDeselect?: (id: string) => void;
  onSelect?: (id: string) => void;
  onNavigate?: (id: string) => void;
}

export default function InventoryProductCard({
  product,
  selected = true,
  editablePrice = false,
  editingPriceId,
  editingPriceValue,
  savingPrice,
  onEditPrice,
  onEditPriceStart,
  onDeselect,
  onSelect,
  onNavigate,
}: InventoryProductCardProps) {
  const isEditing = editablePrice && editingPriceId === product.id;
  const inputValue = isEditing
    ? (editingPriceValue ?? product.price.toFixed(2))
    : product.price.toFixed(2);

  const handleEditPrice = () => {
    if (onEditPriceStart) {
      onEditPriceStart(product.id, product.price.toFixed(2));
    }
  };

  const handleSavePrice = () => {
    if (onEditPrice && isEditing) {
      onEditPrice(product.id, inputValue);
    }
  };

  return (
    <div
      className="flex w-full items-center rounded-xl border border-gray-200 bg-white p-3 shadow-sm hover:bg-gray-50 transition-all"
    >
      {/* Imagen clickeable */}
      <div
        className="h-16 w-16 rounded-lg bg-purple-100 mr-4 overflow-hidden flex-shrink-0 cursor-pointer"
        onClick={() => onNavigate && onNavigate(product.id)}
      >
        <Image src={product.image || "/Groserybasket.png"} alt={product.name} width={64} height={64} className="h-full w-full object-cover" />
      </div>
      {/* Nombre clickeable */}
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => onNavigate && onNavigate(product.id)}
      >
        <h3 className="font-sm text-gray-900 truncate whitespace-nowrap overflow-hidden max-w-[250px] cursor-pointer">
          {product.name_alias ? product.name_alias : product.name}
        </h3>
        {product.description && (
          <p className="text-xs text-gray-500 line-clamp-2 max-w-full">{product.description}</p>
        )}
      </div>
      {/* Precio editable */}
      {editablePrice && (
        <div className="flex items-center gap-2 ml-2">
          {isEditing ? (
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSavePrice();
              }}
              className="flex items-center gap-1"
            >
              <Input
                type="number"
                min={0.01}
                step={0.01}
                value={inputValue}
                autoFocus
                disabled={savingPrice}
                onChange={e => {
                  if (onEditPriceStart) onEditPriceStart(product.id, e.target.value);
                }}
                onBlur={handleSavePrice}
                className="w-20 text-sm font-semibold"
              />
            </form>
          ) : (
            <button
              className="flex items-center gap-1 group bg-transparent border-none outline-none p-0 m-0"
              style={{ background: 'none' }}
              onClick={e => {
                e.stopPropagation();
                handleEditPrice();
              }}
              aria-label="Editar precio"
              type="button"
            >
              <span className="text-sm font-semibold select-none group-hover:text-blue-700">${product.price.toFixed(2)}</span>
              {editablePrice && <Edit className="h-4 w-4 text-gray-400 group-hover:text-gray-700" />}
            </button>
          )}
        </div>
      )}
      {/* Corazón */}
      <span
        className={cn(
          "ml-3 transition-colors cursor-pointer",
          selected ? "text-reddi-select" : "text-gray-300 hover:text-reddi-select"
        )}
        style={{ transition: 'color 0.2s' }}
        onClick={e => {
          e.stopPropagation();
          if (selected && onDeselect) onDeselect(product.id);
          if (!selected && onSelect) onSelect(String(product.product_reference_id));
        }}
      >
        <Heart className="h-6 w-6" fill={selected ? "currentColor" : "none"} strokeWidth={selected ? 0 : 2} />
      </span>
    </div>
  );
} 