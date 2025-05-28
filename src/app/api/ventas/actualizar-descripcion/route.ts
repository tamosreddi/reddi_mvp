import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: NextRequest) {
  // Recupera el token del header Authorization
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 });
  }
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {})
        }
      }
    }
  );

  try {
    const { transactionId, description } = await req.json()
    console.log("[API actualizar-descripcion] transactionId:", transactionId)
    console.log("[API actualizar-descripcion] description:", description)
    if (!transactionId) {
      return NextResponse.json({ success: false, message: "transactionId es requerido" }, { status: 400 })
    }
    // Actualizar la descripción
    const { error, data } = await supabase
      .from("transactions")
      .update({ transaction_description: description || null })
      .eq("transaction_id", transactionId)
      .select()
    console.log("[API actualizar-descripcion] update result:", data, error)
    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error("Error en fetch:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 })
  }
} 