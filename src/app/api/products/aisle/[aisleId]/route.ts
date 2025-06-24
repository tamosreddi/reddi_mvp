// usado en sección Shop. Para traer info de Supabase para llenar los pasillos.

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/supabaseServerClient";

export async function GET(req: NextRequest, { params }: { params: Promise<{ aisleId: string }> }) {
  const { aisleId } = await params;
  const aisleIdNum = Number(aisleId);
  if (isNaN(aisleIdNum)) {
    return NextResponse.json({ error: "AisleId inválido" }, { status: 400 });
  }
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const subcategory = searchParams.get("subcategory");
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const offset = (page - 1) * limit;

  const supabase = await createServerSupabaseClient();

  // Base query: join products with aisles
  let query = supabase
    .from("products")
    .select("*, aisles(*)", { count: "exact" })
    .eq("aisle_id", aisleIdNum);

  if (category) {
    query = query.eq("category", category);
  }
  if (subcategory) {
    query = query.eq("subcategory", subcategory);
  }

  query = query.range(offset, offset + limit - 1);

  // Fetch products with aisle info
  const { data: products, count, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get aisle info (from first product or fetch if empty)
  let aisle = null;
  if (products && products.length > 0 && products[0].aisles) {
    aisle = products[0].aisles;
  } else {
    // fallback: fetch aisle directly
    const { data: aisleData } = await supabase
      .from("aisles")
      .select("*")
      .eq("id", aisleIdNum)
      .single();
    aisle = aisleData;
  }

  // Fetch unique categories for this aisle
  const { data: categoriesData } = await supabase
    .from("products")
    .select("category")
    .eq("aisle_id", aisleIdNum)
    .neq("category", null);
  const categories = Array.from(new Set((categoriesData || []).map((p: { category: string }) => p.category)));

  // Fetch unique subcategories for this aisle+category
  let subcategories: string[] = [];
  if (category) {
    const { data: subcatData } = await supabase
      .from("products")
      .select("subcategory")
      .eq("aisle_id", aisleIdNum)
      .eq("category", category)
      .neq("subcategory", null);
    subcategories = Array.from(new Set((subcatData || []).map((p: { subcategory: string }) => p.subcategory)));
  }

  return NextResponse.json({
    products,
    count,
    aisle,
    categories,
    subcategories,
    page,
    limit,
  });
} 