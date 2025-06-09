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

interface EditSaleProps {
  transactionId: string
}

export default function EditSale({ transactionId }: EditSaleProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [transaction, setTransaction] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])

  // Campos editables
  const [date, setDate] = useState<string>("")
  const [status, setStatus] = useState<'paid' | 'credit'>('paid')
  const [concept, setConcept] = useState<string>("")
  const [client, setClient] = useState<any>(null)
  const [clientManuallySelected, setClientManuallySelected] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [total, setTotal] = useState<number>(0)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

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
    // Eliminado: console.log('[EditSale] pathname:', pathname, 'transactionId:', transactionId)
  }, [pathname, transactionId])

  // Estado para clientes
  const { selectedStore } = useStore();
  const [clientes, setClientes] = useState<Option[]>([]);
  const [clientesLoading, setClientesLoading] = useState(true);

  // Fetch clientes al montar o cuando cambia la tienda
  useEffect(() => {
    if (!selectedStore) {
      setClientes([]);
      setClientesLoading(false);
      return;
    }
    setClientesLoading(true);
    supabase
      .from('clients')
      .select('client_id, name, notes')
      .eq('store_id', selectedStore.store_id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setClientes([]);
        } else {
          setClientes((data || []).map((c: any) => ({ id: c.client_id, name: c.name, notes: c.notes })));
        }
        setClientesLoading(false);
      });
  }, [selectedStore]);

  const [productosInicializados, setProductosInicializados] = useState(false);

  // Inicialización de productos: prioriza editProductCart si existe, si no fetch de la base de datos
  useEffect(() => {
    if (productosInicializados) return;
    async function initProducts() {
      if (typeof window !== 'undefined') {
        const edited = localStorage.getItem('editProductCart');
        if (edited) {
          try {
            const parsed = JSON.parse(edited);
            if (Array.isArray(parsed) && parsed.length > 0) {
              // Normaliza cartQuantity a quantity y name a product_name
              const normalized = parsed.map((p: any) => ({
                ...p,
                quantity: p.cartQuantity ?? p.quantity,
                unit_price: p.unit_price ?? p.price,
                product_name: p.product_name ?? p.name,
              }));
              setProducts(normalized);
              const newTotal = normalized.reduce((sum, p) => sum + Number(p.unit_price) * Number(p.quantity), 0)
              setTotal(newTotal);
              setProductosInicializados(true);
              localStorage.removeItem('editProductCart');
              return;
            }
          } catch (e) {
            console.error('[EditSale] Error parseando editProductCart:', e);
          }
        }
      }
      // Si no hay editProductCart, fetch de la base de datos
      setLoading(true)
      setError(null)
      // 1. Obtener la transacción
      const { data: tx, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('transaction_id', transactionId)
        .single()
      if (txError || !tx) {
        setError('No se pudo cargar la venta.');
        setLoading(false);
        setProductosInicializados(true);
        return;
      }
      setTransaction(tx)
      setDateObj(tx.transaction_date ? new Date(tx.transaction_date) : new Date())
      setStatus(tx.is_paid ? 'paid' : 'credit')
      setConcept(tx.transaction_description || "")
      // Solo actualizar el cliente si el usuario NO ha seleccionado uno manualmente ni hay uno en el estado
      if (!clientManuallySelected && !client) {
        let clientObj = null;
        if (tx.stakeholder_id && tx.stakeholder_type === 'client') {
          const { data: clientData } = await supabase
            .from('clients')
            .select('name')
            .eq('client_id', tx.stakeholder_id)
            .single();
          clientObj = { id: tx.stakeholder_id, type: tx.stakeholder_type, name: clientData?.name || tx.stakeholder_id };
          setClient(clientObj);
          console.log('[EditSale] setClient (from fetchData):', clientObj);
        }
      }
      setPaymentMethod(tx.payment_method || "")
      setTotal(Number(tx.total_amount) || 0)
      // 2. Obtener los productos vendidos
      const { data: items, error: itemsError } = await supabase
        .from('transaction_items')
        .select('product_name, quantity, unit_price, product_reference_id, product_type, store_id')
        .eq('transaction_id', transactionId)
      if (itemsError) {
        setError('No se pudieron cargar los productos vendidos.');
        setLoading(false);
        setProductosInicializados(true);
        return;
      }
      setProducts(items || [])
      setLoading(false)
      setProductosInicializados(true);
    }
    initProducts();
  }, [transactionId, productosInicializados, client, clientManuallySelected]);

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      let productsToSave = products;
      if (!productsToSave || (Array.isArray(productsToSave) && productsToSave.length === 0)) {
        // Fetch productos originales de la transacción
        const { data: items, error: itemsError } = await supabase
          .from('transaction_items')
          .select('product_name, quantity, unit_price, product_reference_id, product_type, store_id')
          .eq('transaction_id', transactionId)
        if (!itemsError && items && items.length > 0) {
          productsToSave = items;
          setProducts(items); // opcional, para mantener el estado sincronizado
        }
      }

      const bodyToSend = {
        transaction_id: transactionId,
        transaction_date: dateObj.toISOString(),
        is_paid: status === 'paid',
        transaction_description: concept,
        stakeholder_id: client?.id || null,
        stakeholder_type: client?.type || null,
        payment_method: paymentMethod,
        total_amount: total,
        products: productsToSave,
      };

      const res = await fetch('/api/balance/edit-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyToSend)
      })
      const data = await res.json()

      if (data.success) {
        setSuccess(true)
        router.push(`/balance/income/${transactionId}`)
      } else {
        setError(data.error || 'No se pudo guardar la venta.')
      }
    } catch (err) {
      setError('Error de red al guardar la venta.')
    }
    setSaving(false)
  }

  // Manejar edición de productos
  const handleEditProducts = () => {
    localStorage.setItem('editProductCart', JSON.stringify(products));
    router.push(`/dashboard/ventas/productos?edit=1&transaction_id=${transactionId}`);
  };

  // Log en el render
  console.log('[EditSale] Render productos:', products);

  const handleSelectCustomer = () => {
    localStorage.setItem("editSaleForm", JSON.stringify({
      transactionId,
    }))
    router.push(`/dashboard/clientes?select=true&returnTo=/balance/edit-income/${transactionId}`)
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
    return <div className="p-8 text-center text-gray-500">Cargando venta...</div>
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header con TopProfileMenu */}
      <TopProfileMenu
        simpleMode
        title="Editar venta"
        onBackClick={() => router.push(`/balance/income/${transactionId}`)}
      />
      <div className="flex-1 p-4 pb-24 space-y-4 mt-20">
        {/* Fecha y Estado (Pagada/A crédito) */}
        <div className="grid grid-cols-2 gap-3">
          <CalendarSelect value={dateObj} onChange={handleDateChange} />
          <IsPaidToggle value={status === 'paid'} onChange={v => setStatus(v ? 'paid' : 'credit')} labels={{ paid: "Pagada", credit: "Deuda" }} className="h-12" />
        </div>
        {/* Productos */}
        <div className="rounded-lg bg-white p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold">Productos</span>
              <span className="ml-2 text-green-700 font-medium">{products.length} referencias</span>
            </div>
            <button className="text-gray-500 underline text-sm" onClick={handleEditProducts}>Editar</button>
          </div>
          <div className="text-xs text-gray-600 truncate">
            {products.map(p => `${p.quantity} ${p.product_name}`).join(', ')}
          </div>
        </div>
        {/* Concepto */}
        <ConceptInput 
          value={concept} 
          onChange={e => setConcept(e.target.value)}
          placeholder="Edita/agrega el concepto de la venta"
          label="Concepto"
        />
        {/* Cliente */}
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Cliente</label>
          <Combobox
            options={clientes}
            value={client?.id || null}
            onChange={(clienteId) => {
              if (!clienteId) {
                setClient(null);
                setClientManuallySelected(false);
              } else {
                const selected = clientes.find(c => c.id === clienteId) || null;
                setClient(selected ? { id: selected.id, type: 'client', name: selected.name, notes: selected.notes } : null);
                setClientManuallySelected(true);
              }
            }}
          />
        </div>
        {/* Método de pago */}
        <PaymentMethod value={paymentMethod} onChange={setPaymentMethod} />
        {/* Total */}
        <div className="flex justify-between items-center mt-4">
          <span className="text-gray-700 font-semibold">Total</span>
          <span className="text-xl font-bold">${total.toLocaleString('es-MX')}</span>
        </div>
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
        {success && <div className="text-green-600 text-center font-semibold mt-2">¡Venta actualizada correctamente!</div>}
      </div>
    </div>
  )
}
