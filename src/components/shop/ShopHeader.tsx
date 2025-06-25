//COMPONENTE DE HEADER DE SHOP

import Link from "next/link";

interface ShopHeaderProps {
  showBackButton?: boolean;
  onBack?: () => void;
  backHref?: string;
  searchPlaceholder?: string;
  searchDisabled?: boolean;
}

export default function ShopHeader({
  showBackButton = true,
  onBack,
  backHref,
  searchPlaceholder = "Buscar...",
  searchDisabled = false,
}: ShopHeaderProps) {
  return (
    <div className="flex items-center px-4 pt-4 pb-2 bg-white">
      {showBackButton && (
        onBack ? (
          <button aria-label="Regresar" className="mr-2 p-2 rounded-full hover:bg-gray-100" onClick={onBack}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
          </button>
        ) : (
          <Link href={backHref || "/dashboard"}>
            <button aria-label="Regresar" className="mr-2 p-2 rounded-full hover:bg-gray-100">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
            </button>
          </Link>
        )
      )}
      <div className="flex-1">
        <input
          type="text"
          placeholder={searchPlaceholder}
          className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-reddi-primary"
          disabled={searchDisabled}
        />
      </div>
    </div>
  );
} 