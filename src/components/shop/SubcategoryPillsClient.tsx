"use client";
import { useState } from "react";
import SubcategoryPills from "./SubcategoryPills";

export default function SubcategoryPillsClient({ subcategories }: { subcategories: string[] }) {
  const [activeSubcategory, setActiveSubcategory] = useState(subcategories[0]);
  return (
    <SubcategoryPills
      subcategories={subcategories}
      activeSubcategory={activeSubcategory}
      onChange={setActiveSubcategory}
    />
  );
} 