//API PARA OBTENER INFORMACIÓN DE LOS PASILLOS EN SECCIÓN SHOP.
// app/api/aisles/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  // Obtener el id del pasillo desde la URL
  const id = req.nextUrl.pathname.split("/").pop();
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 });
  }

  // 2. Inicializar Supabase (sin RLS para consulta pública de pasillos)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 3. Buscar el pasillo por id
  const { data, error } = await supabase
    .from('aisles')
    .select('name')
    .eq('id', Number(id))
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false, error: 'Pasillo no encontrado' }, { status: 404 });
  }

  // 4. Respuesta estándar
  return NextResponse.json({ success: true, name: data.name });
} 