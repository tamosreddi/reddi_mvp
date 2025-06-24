//Componente presentacional. Solo renderiza la UI. No tiene mucha lógica.
//Aqui se manjea el UI y el diseño

interface SubcategoryPillsProps {
  subcategories: string[];
  activeSubcategory: string;
  onChange: (subcategory: string) => void;
}

export default function SubcategoryPills({ subcategories, activeSubcategory, onChange }: SubcategoryPillsProps) {
  return (
    <div className="flex gap-2 px-4 overflow-x-auto py-2">
      {subcategories.map((sub) => (
        <button
          key={sub}
          onClick={() => onChange(sub)}
          className={`px-4 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition
            ${activeSubcategory === sub
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-gray-100 text-gray-700 border-gray-200"}
          `}
        >
          {sub}
        </button>
      ))}
    </div>
  );
} 