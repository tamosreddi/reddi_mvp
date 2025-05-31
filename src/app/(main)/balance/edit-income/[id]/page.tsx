'use client'
import EditSale from '@/components/balance/edit-sale'
import { useParams } from 'next/navigation'

export default function EditIncomePage() {
  const params = useParams<{ id: string }>() // Tipado explícito
  return <EditSale transactionId={params.id} />
}