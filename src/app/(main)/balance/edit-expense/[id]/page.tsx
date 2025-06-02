// src/app/(main)/balance/edit-expense/[id]/page.tsx
"use client";
import EditExpense from "@/components/balance/edit-expense";
import { useParams } from "next/navigation";

export default function EditExpensePage() {
  const params = useParams<{ id: string }>(); // Usa el hook useParams
  return <EditExpense transactionId={params.id} />;
}