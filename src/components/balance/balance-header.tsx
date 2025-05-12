// Header de sessión balance

"use client"

import TopProfileMenu from "@/components/shared/top-profile-menu"

export default function BalanceHeader() {
  const handleSearchClick = () => {
    // Implementar funcionalidad de búsqueda aquí
    alert("Funcionalidad de búsqueda será implementada próximamente")
  }

  return <TopProfileMenu onSearchClick={handleSearchClick} />
}
