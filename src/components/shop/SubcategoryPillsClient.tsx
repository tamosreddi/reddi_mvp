//Componente cliente. Tiene lógica.
//USa el componente presentacional SubcategoryPills

"use client";
import { useState, useEffect } from "react";
import SubcategoryPills from "./SubcategoryPills";

interface SubcategoryPillsClientProps {
  subcategories: string[];
  activeSubcategory?: string;
  onChange?: (subcategory: string) => void;
}

export default function SubcategoryPillsClient({ subcategories, activeSubcategory, onChange }: SubcategoryPillsClientProps) {
  // Si no se controla desde el padre, manejar el estado localmente
  const [internalActive, setInternalActive] = useState(subcategories[0]);

  // Sincronizar con el prop si cambia
  useEffect(() => {
    if (activeSubcategory !== undefined) {
      setInternalActive(activeSubcategory);
    }
  }, [activeSubcategory]);

  const handleChange = (subcategory: string) => {
    if (onChange) {
      onChange(subcategory);
    } else {
      setInternalActive(subcategory);
    }
  };

  return (
    <SubcategoryPills
      subcategories={subcategories}
      activeSubcategory={activeSubcategory ?? internalActive}
      onChange={handleChange}
    />
  );
} 