import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// POST /api/gastos/registrar-gasto
export async function POST(request: Request) {
  // 1. Obtén el token del header
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  // 2. Inicializa el cliente de Supabase con el token
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  try {
    const body = await request.json();
    const {
      user_id,
      store_id,
      transaction_type,
      transaction_description,
      payment_method,
      is_paid,
      transaction_subtype,
      transaction_date,
      stakeholder_id,
      stakeholder_type,
      total_amount,
    } = body;

    // Validación básica
    if (!user_id || !store_id || !transaction_type || !payment_method || !transaction_date || !total_amount) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios para registrar el gasto." },
        { status: 400 }
      );
    }

    // Insertar la transacción
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id,
        store_id,
        transaction_type,
        transaction_description,
        payment_method,
        is_paid,
        transaction_subtype,
        transaction_date,
        stakeholder_id,
        stakeholder_type,
        total_amount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      return NextResponse.json(
        { error: "Error al registrar el gasto." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, expense: data[0] });
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
} 