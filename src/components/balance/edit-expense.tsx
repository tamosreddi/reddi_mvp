//para editar gastos

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/supabaseClient'
import { useRouter, usePathname } from 'next/navigation'
import TopProfileMenu from '@/components/shared/top-profile-menu'
import CalendarSelect from '@/components/ui/calendar-select'
import IsPaidToggle from '@/components/ui/is-paid-toggle'
import Button from '@/components/ui/button'
import ConceptInput from '@/components/ui/concept-input'
import { Combobox, Option } from '@/components/ui/combobox'
import { useStore } from '@/lib/contexts/StoreContext'
import PaymentMethod from '@/components/ui/payment-method'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import ValueInput from '@/components/ui/value-input'
import SelectDropdown from "@/components/ui/select-dropdown";

interface EditExpenseProps {
  transactionId: string
}

export default function EditExpense({ transactionId }: EditExpenseProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [transaction, setTransaction] = useState<any>(null)

  // Campos editables
  const [date, setDate] = useState<string>("")
  const [status, setStatus] = useState<'paid' | 'credit'>('paid')
  const [concept, setConcept] = useState<string>("")
  const [client, setClient] = useState<any>(null)
  const [clientManuallySelected, setClientManuallySelected] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [total, setTotal] = useState<string>("")
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [expenseCategory, setExpenseCategory] = useState<string>("")

  // Para CalendarSelect y IsPaidToggle
  const [dateObj, setDateObj] = useState<Date>(() => date ? new Date(date) : new Date())
  useEffect(() => {
    if (date) setDateObj(new Date(date))
  }, [date])
  useEffect(() => {
    setDate(dateObj.toISOString().slice(0, 10))
  }, [dateObj])

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Eliminado: console.log('[EditExpense] pathname:', pathname, 'transactionId:', transactionId)
  }, [pathname, transactionId])

  // Estado para proveedores
  const { selectedStore } = useStore();
  const [proveedores, setProveedores] = useState<Option[]>([]);
  const [proveedoresLoading, setProveedoresLoading] = useState(true);

  // Lista de categorías igual que en register-expense
  const expenseCategories = [
    "Renta",
    "Servicios (Luz, Agua, etc.)",
    "Mercancía",
    "Salarios",
    "Transporte",
    "Mantenimiento",
    "Otro",
  ]

  // Mapeo entre backend y frontend para método de pago
  const paymentMethodMap: Record<string, string> = {
    cash: "efectivo",
    card: "tarjeta",
    transfer: "transferencia"
  };
  const paymentMethodBackendMap: Record<string, string> = {
    efectivo: "cash",
    tarjeta: "card",
    transferencia: "transfer"
  };

  // Fetch proveedores al montar o cuando cambia la tienda
  useEffect(() => {
    if (!selectedStore) {
      setProveedores([]);
      setProveedoresLoading(false);
      return;
    }
    setProveedoresLoading(true);
    supabase
      .from('suppliers')
      .select('supplier_id, name, notes')
      .eq('store_id', selectedStore.store_id)
      .order('created_at', { ascending: false })
      .then(({ data, error }: any) => {
        if (error) {
          setProveedores([]);
        } else {
          setProveedores((data || []).map((p: any) => ({ id: p.supplier_id, name: p.name, notes: p.notes })));
        }
        setProveedoresLoading(false);
      });
  }, [selectedStore]);

  // Inicialización de datos de la transacción (sin productos)
  useEffect(() => {
    async function initExpense() {
      setLoading(true)
      setError(null)
      // 1. Obtener la transacción
      const { data: tx, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('transaction_id', transactionId)
        .single()
      if (txError || !tx) {
        setError('No se pudo cargar el gasto.');
        setLoading(false);
        return;
      }
      setTransaction(tx)
      setDateObj(tx.transaction_date ? new Date(tx.transaction_date) : new Date())
      setStatus(tx.is_paid ? 'paid' : 'credit')
      setConcept(tx.transaction_description || "")
      // Solo actualizar el proveedor si el usuario NO ha seleccionado uno manualmente ni hay uno en el estado
      if (!clientManuallySelected && !client) {
        let proveedorObj = null;
        if (tx.stakeholder_id && tx.stakeholder_type === 'supplier') {
          const { data: proveedorData } = await supabase
            .from('suppliers')
            .select('name')
            .eq('supplier_id', tx.stakeholder_id)
            .single();
          proveedorObj = { id: tx.stakeholder_id, type: tx.stakeholder_type, name: proveedorData?.name || tx.stakeholder_id };
          setClient(proveedorObj);
        }
      }
      const validMethods = ['cash', 'card', 'other', 'transfer'];
      setPaymentMethod(validMethods.includes(tx.payment_method) ? tx.payment_method : 'cash');
      setTotal(tx.total_amount !== undefined && tx.total_amount !== null ? String(tx.total_amount) : "")
      setExpenseCategory(tx.transaction_subtype || "")
      setLoading(false)
    }
    initExpense();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const bodyToSend = {
        transaction_id: transactionId,
        transaction_date: dateObj.toISOString(),
        is_paid: status === 'paid',
        transaction_description: concept,
        stakeholder_id: client?.id || null,
        stakeholder_type: client?.type || null,
        payment_method: paymentMethod,
        total_amount: total,
        transaction_subtype: expenseCategory,
      };

      const res = await fetch('/api/balance/edit-expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyToSend)
      })
      const data = await res.json()

      if (data.success) {
        setSuccess(true)
        router.push(`/balance/expense/${transactionId}`)
      } else {
        setError(data.error || 'No se pudo guardar el gasto.')
      }
    } catch (err) {
      setError('Error de red al guardar el gasto.')
    }
    setSaving(false)
  }

  const handleSelectCustomer = () => {
    localStorage.setItem("editExpenseForm", JSON.stringify({
      transactionId,  
    }))
    router.push(`/dashboard/clientes?select=true&returnTo=/balance/edit-expense/${transactionId}`)
  }

  const [blockAutoClient, setBlockAutoClient] = useState(false);

  const handleDateChange = (newDate: Date) => {
    // Mantener la hora original
    const original = dateObj;
    const updated = new Date(newDate);
    updated.setHours(original.getHours(), original.getMinutes(), original.getSeconds(), original.getMilliseconds());
    setDateObj(updated);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando gasto...</div>
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>
  }

  return (
    <div className="min-h-screen bg-reddi-background flex flex-col">
      {/* Header con TopProfileMenu */}
      <TopProfileMenu
        simpleMode
        title="Editar gasto"
        onBackClick={() => router.push(`/balance/expense/${transactionId}`)}
      />
      <div className="flex-1 p-4 pb-24 space-y-4 mt-14">
        {/* Fecha y Estado (Pagada/A crédito) */}
        <div className="grid grid-cols-2 gap-3">
          <CalendarSelect value={dateObj} onChange={handleDateChange} />
          {/* <IsPaidToggle value={status === 'paid'} onChange={v => setStatus(v ? 'paid' : 'credit')} labels={{ paid: "Pagada", credit: "Deuda" }} className="h-12" /> */}
        </div>
        {/* Valor editable */}
        <ValueInput
          value={total}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTotal(e.target.value)}
          required
        />

        {/* Categoría del gasto */}
        <SelectDropdown
          label="Categoría del gasto"
          id="expense-category"
          value={expenseCategory}
          onChange={setExpenseCategory}
          options={expenseCategories.map((cat) => ({ value: cat, label: cat }))}
          required
        />

         {/* Proveedor */}
          <div>
          <Label htmlFor="expense-supplier" className="text-lg font-medium">
            Proveedor 
          </Label>
          <Combobox
            options={proveedores}
            value={client?.id || null}
            onChange={(proveedorId) => {
              if (!proveedorId) {
                setClient(null);
                setClientManuallySelected(false);
              } else {
                const selected = proveedores.find(p => p.id === proveedorId) || null;
                setClient(selected ? { id: selected.id, type: 'supplier', name: selected.name, notes: selected.notes } : null);
                setClientManuallySelected(true);
              }
            }}
          />
        </div>

        {/* Concepto */}
        <ConceptInput 
          value={concept} 
          onChange={e => setConcept(e.target.value)}
          placeholder="Edita/agrega el concepto del gasto"
          label="Concepto"
        />


        {/* Método de pago */}
        <PaymentMethod value={paymentMethod} onChange={setPaymentMethod} />




        {/* Botón Guardar Cambios */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg z-40">
          <Button
            onClick={handleSave}
            className="w-full rounded-xl bg-gray-800 p-6 text-lg font-medium text-white hover:bg-gray-700"
            disabled={saving}
            isLoading={saving}
          >
            Guardar cambios
          </Button>
        </div>
        {success && <div className="text-green-600 text-center font-semibold mt-2">¡Gasto actualizado correctamente!</div>}
      </div>
    </div>
  )
}
