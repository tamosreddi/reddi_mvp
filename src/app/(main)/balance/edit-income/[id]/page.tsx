'use client'

import EditSale from '@/components/balance/edit-sale'
import { useParams } from 'next/navigation'

export default function EditIncomePage() {
  const params = useParams();
  const transactionId = Array.isArray(params.id) ? params.id[0] : params.id;

  return <EditSale transactionId={transactionId} />
}
