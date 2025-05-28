'use client'

import EditExpense from '@/components/balance/edit-expense'
import { useParams } from 'next/navigation'

export default function EditExpensePage() {
  const params = useParams();
  const transactionId = Array.isArray(params.id) ? params.id[0] : params.id;

  return <EditExpense transactionId={transactionId} />
}