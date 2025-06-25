// 2. CREA una función utilitaria para Server Components
// lib/aisles.ts (NUEVO ARCHIVO)
import { createServerSupabaseClient } from "@/lib/supabase/supabaseServerClient";

export interface AisleData {
  name: string;
  categories: string[];
  subcategories: string[];
}

export interface Product {
  barcode: string;
  sku: string;
  name: string;
  description?: string;
  brand?: string;
  category: string;
  distributor_id?: number;
  product_id: number;
  created_at: string;
  updated_at: string;
  image?: string;
  aisle_id: number;
  subcategory?: string;
}

export async function getAisleData(aisleId: string): Promise<AisleData> {
  try {
    if (!aisleId || isNaN(Number(aisleId))) {
      throw new Error("ID de pasillo inválido");
    }

    const supabase = await createServerSupabaseClient();
    
    // 1. Obtener información del pasillo
    const { data: aisleData, error: aisleError } = await supabase
      .from('aisles')
      .select('name')
      .eq('id', Number(aisleId))
      .single();

    if (aisleError || !aisleData) {
      throw new Error("Pasillo no encontrado");
    }

    // 2. Obtener categorías y subcategorías únicas de los productos en este pasillo
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('category, subcategory')
      .eq('aisle_id', Number(aisleId))
      .not('category', 'is', null); // Excluir productos sin categoría

    if (productsError) {
      console.error('Error al obtener productos:', productsError);
      // No lanzar error, usar arrays vacíos
    }

    // 3. Extraer categorías únicas
    const categories = productsData 
      ? [...new Set(productsData.map(p => p.category).filter(Boolean))]
      : [];

    // 4. Extraer subcategorías únicas
    const subcategories = productsData 
      ? [...new Set(productsData.map(p => p.subcategory).filter(Boolean))]
      : [];

    // 5. Agregar "Todas las categorías" al inicio si hay categorías
    const finalCategories = categories.length > 0 
      ? ["Todas las categorías", ...categories] 
      : ["Todas las categorías"];

    return {
      name: aisleData.name,
      categories: finalCategories,
      subcategories: subcategories
    };

  } catch (e: any) {
    console.error(`[getAisleData] Error para ID ${aisleId}:`, e);
    throw new Error(e.message || "Error al cargar información del pasillo");
  }
}

// Función auxiliar para obtener solo el nombre (mantener compatibilidad)
export async function getAisleName(aisleId: string): Promise<string> {
  const aisleData = await getAisleData(aisleId);
  return aisleData.name;
}

// Función para obtener productos filtrados por pasillo y opcionalmente por categoría
export async function getAisleProducts(aisleId: string, category?: string): Promise<Product[]> {
  try {
    if (!aisleId || isNaN(Number(aisleId))) {
      throw new Error("ID de pasillo inválido");
    }

    const supabase = await createServerSupabaseClient();
    
    let query = supabase
      .from('products')
      .select(`
        barcode,
        sku,
        name,
        description,
        brand,
        category,
        distributor_id,
        product_id,
        created_at,
        updated_at,
        image,
        aisle_id,
        subcategory
      `)
      .eq('aisle_id', Number(aisleId));

    // Filtrar por categoría si se especifica y no es "Todas las categorías"
    if (category && category !== "Todas las categorías") {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('name');

    if (error) {
      console.error('Error al obtener productos:', error);
      return [];
    }

    return data || [];

  } catch (e: any) {
    console.error(`[getAisleProducts] Error para ID ${aisleId}:`, e);
    return [];
  }
}