'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from '@/app/page.module.css'
import { createSale, deleteSale, updateSale } from '@/app/actions'
import type { HistoricalSale } from '@/lib/types'

type PosDashboardProps = {
  historicalSales: HistoricalSale[]
  allProducts: Array<{ id: string; nombre: string; precio: number; precio_minimo: number }>
  allClients: Array<{ id: string; cedula: string; nombre: string | null; telefono: string | null; correo: string | null }>
  allSellers?: Array<{ id: string; nombre: string }>
  paymentMethods?: Array<{ id: string; nombre: string }>
  admins?: { id: string; nombre: string }[]
  initialEditSaleId?: string
  isEditPage?: boolean
}

type SaleItemState = {
  id: number
  nombre: string
  cantidad: number
  precio_unitario: number
}

type PagoState = {
  id: number
  metodoPagoId: string
  valor: number | ''
}

export default function PosDashboard({
  historicalSales,
  allProducts,
  allClients,
  allSellers,
  paymentMethods,
  admins,
  initialEditSaleId,
  isEditPage = false,
}: PosDashboardProps) {
  const [showForm, setShowForm] = useState(isEditPage)
  const [focusedRowId, setFocusedRowId] = useState<number | null>(null)
  const [focusedCedula, setFocusedCedula] = useState(false)
  const [focusedSeller, setFocusedSeller] = useState(false)
  const [focusedPaymentId, setFocusedPaymentId] = useState<number | null>(null)

  const [cedula, setCedula] = useState('')
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [correo, setCorreo] = useState('')
  const [vendedorNombre, setVendedorNombre] = useState('')
  const [isNoCedula, setIsNoCedula] = useState(false)
  const [loading, setLoading] = useState(false)
  const [observaciones, setObservaciones] = useState('')
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null)
  const [salePendingEdit, setSalePendingEdit] = useState<HistoricalSale | null>(null)
  const [salePendingDeleteId, setSalePendingDeleteId] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  const [items, setItems] = useState<SaleItemState[]>([
    { id: 1, nombre: '', cantidad: 1, precio_unitario: 0 },
  ])

  const [pagos, setPagos] = useState<PagoState[]>([
    { id: 1, metodoPagoId: '', valor: '' },
  ])

  const filteredClients = allClients.filter((client) =>
    client.cedula.toLowerCase().includes(cedula.toLowerCase())
  )

  const toggleNoCedula = () => {
    if (isNoCedula) {
      setCedula('')
      setIsNoCedula(false)
      return
    }

    setCedula('2222222')
    setNombre('')
    setTelefono('')
    setCorreo('')
    setIsNoCedula(true)
  }

  const addItemRow = () => {
    setItems((prev) => [...prev, { id: Date.now(), nombre: '', cantidad: 1, precio_unitario: 0 }])
  }

  const removeItemRow = (id: number) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((item) => item.id !== id))
    }
  }

  const updateItem = (id: number, field: keyof Omit<SaleItemState, 'id'>, value: string | number) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, [field]: value } : item))
  }

  const updateItemMultiple = (id: number, updates: Partial<SaleItemState>) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, ...updates } : item))
  }

  const addPaymentRow = () => {
    setPagos((prev) => [...prev, { id: Date.now(), metodoPagoId: '', valor: '' }])
  }

  const removePaymentRow = (id: number) => {
    if (pagos.length > 1) {
      setPagos((prev) => prev.filter((pago) => pago.id !== id))
    }
  }

  const updatePayment = (
    id: number,
    field: keyof Omit<PagoState, 'id'>,
    value: string | number | ''
  ) => {
    setPagos((prev) => prev.map((pago) => pago.id === id ? { ...pago, [field]: value } : pago))
  }

  const totalVenta = items.reduce((acc, item) => acc + item.cantidad * item.precio_unitario, 0)
  const totalPagos = pagos.reduce(
    (acc, pago) => acc + (typeof pago.valor === 'number' ? pago.valor : parseFloat(pago.valor || '0') || 0),
    0
  )
  const pagosValidos = pagos.filter((pago) => {
    const valor = typeof pago.valor === 'number' ? pago.valor : parseFloat(pago.valor || '0') || 0
    return pago.metodoPagoId && valor > 0
  })
  const pagosMatch = Math.abs(totalVenta - totalPagos) < 0.01

  const getAdminName = (adminId: string) => {
    if (!admins) return 'Desconocido'
    return admins.find((admin) => admin.id === adminId)?.nombre || 'Desconocido'
  }

  const getPaymentMethodName = (paymentMethodId: string) => {
    return paymentMethods?.find((paymentMethod) => paymentMethod.id === paymentMethodId)?.nombre || ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!cedula) return
      if (pagosValidos.length === 0) return

      const payload = {
        cedula,
        nombre,
        telefono,
        correo,
        items,
        pagos: pagos.map((pago) => ({
          metodoPagoId: pago.metodoPagoId,
          valor: pago.valor,
        })),
        observaciones,
        vendedor_nombre: vendedorNombre,
      }

      if (editingSaleId) {
        await updateSale(editingSaleId, payload)
      } else {
        await createSale(payload)
      }

      setCedula('')
      setNombre('')
      setTelefono('')
      setCorreo('')
      setVendedorNombre('')
      setIsNoCedula(false)
      setObservaciones('')
      setEditingSaleId(null)
      setItems([{ id: Date.now(), nombre: '', cantidad: 1, precio_unitario: 0 }])
      setPagos([{ id: Date.now(), metodoPagoId: '', valor: '' }])
      setShowForm(false)
      if (editingSaleId && isEditPage) {
        window.location.href = '/'
      }
    } catch (error: any) {
      console.error('Error:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadSaleForEdit = (sale: HistoricalSale) => {
    setEditingSaleId(sale.id)
    setShowForm(true)
    setCedula(sale.cliente_cedula || sale.client?.cedula || '')
    setNombre(sale.cliente_nombre || sale.client?.nombre || '')
    setTelefono(sale.client?.telefono || '')
    setCorreo(sale.client?.correo || '')
    setVendedorNombre(sale.vendedor_nombre || '')
    setIsNoCedula((sale.cliente_cedula || sale.client?.cedula || '') === '2222222')
    setObservaciones(sale.observaciones || '')

    const mappedItems = sale.items.map((item) => ({
      id: Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`),
      nombre: item.product?.nombre || '',
      cantidad: Number(item.cantidad) || 1,
      precio_unitario: Number(item.precio_unitario) || 0,
    }))

    const mappedPayments = (sale.transactions || []).map((transaction) => ({
      id: Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`),
      metodoPagoId: transaction.paymentMethodId || '',
      valor: Number(transaction.monto) || 0,
    }))

    setItems(mappedItems.length > 0 ? mappedItems : [{ id: Date.now(), nombre: '', cantidad: 1, precio_unitario: 0 }])
    setPagos(mappedPayments.length > 0 ? mappedPayments : [{ id: Date.now(), metodoPagoId: '', valor: '' }])
  }

  const confirmEditFromModal = () => {
    if (!salePendingEdit) return
    window.location.href = `/ventas/${salePendingEdit.id}/editar`
  }

  const confirmDeleteSale = async () => {
    if (!salePendingDeleteId) return
    setLoading(true)
    try {
      await deleteSale(salePendingDeleteId)
      alert('Venta eliminada con éxito.')
      window.location.href = '/'
    } catch (error: any) {
      alert('Error al eliminar la venta: ' + error.message)
    } finally {
      setLoading(false)
      setSalePendingDeleteId(null)
    }
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!initialEditSaleId) return
    const sale = historicalSales.find((currentSale) => currentSale.id === initialEditSaleId)
    if (!sale) return
    loadSaleForEdit(sale)
  }, [initialEditSaleId, historicalSales])

  return (
    <div className={styles.dashboard}>
      {!showForm && !isEditPage && (
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }} className="animate-fade-in">
          <button
            type="button"
            className={(styles as any).buttonPrimary}
            onClick={() => {
              setEditingSaleId(null)
              setShowForm(true)
            }}
            style={{
              fontSize: '1.2rem',
              padding: '1rem 2.5rem',
              borderRadius: 'var(--radius-lg)',
              fontWeight: 700,
              boxShadow: 'var(--shadow-neon)',
              border: 'none',
              cursor: 'pointer',
              color: 'white',
              background: 'var(--accent-primary)',
            }}
          >
            + Nueva Venta
          </button>
        </div>
      )}

      {showForm && (
        <section className={`${styles.formSection} glass-panel animate-fade-in`} style={{ animationDelay: '0s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="title-main" style={{ margin: 0 }}>{editingSaleId ? 'Editar Venta' : 'Nueva Venta'}</h2>
            <button
              type="button"
              className={styles.buttonOutline}
              style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)' }}
              onClick={() => {
                if (isEditPage) {
                  window.location.href = '/'
                  return
                }
                setShowForm(false)
                setEditingSaleId(null)
              }}
            >
              {isEditPage ? 'Cancelar edición' : 'Cerrar Formulario'}
            </button>
          </div>

          {isEditPage && editingSaleId && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.8rem' }}>
              <button
                type="button"
                className={`${styles.button} ${styles.buttonDanger}`}
                onClick={() => setSalePendingDeleteId(editingSaleId)}
                style={{ padding: '0.55rem 1rem' }}
              >
                Eliminar venta
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.clientGrid}>
              <div className={styles.formGroup}>
                <label>Cédula o NIT</label>
                <div className={styles.rowFlex}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type="text"
                      className={styles.input}
                      style={{ width: '100%' }}
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value)}
                      onFocus={() => setFocusedCedula(true)}
                      onBlur={() => setTimeout(() => setFocusedCedula(false), 200)}
                      disabled={isNoCedula}
                      placeholder="Cédula / NIT"
                      required
                    />
                    {focusedCedula && !isNoCedula && (
                      <ul
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          width: '100%',
                          maxHeight: '200px',
                          overflowY: 'auto',
                          background: 'var(--surface)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: 'var(--radius-md)',
                          zIndex: 50,
                          padding: 0,
                          margin: '4px 0 0',
                          listStyle: 'none',
                          boxShadow: 'var(--shadow-md)',
                        }}
                      >
                        {filteredClients.map((client) => (
                          <li
                            key={client.id}
                            style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                            onMouseDown={(e) => {
                              e.preventDefault()
                              setCedula(client.cedula)
                              setNombre(client.nombre || '')
                              setTelefono(client.telefono || '')
                              setCorreo(client.correo || '')
                              setFocusedCedula(false)
                            }}
                          >
                            <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{client.cedula}</span> - {client.nombre || 'Sin nombre'}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <button
                    type="button"
                    className={`${styles.button} ${isNoCedula ? styles.buttonOutline : styles.buttonPrimary}`}
                    onClick={toggleNoCedula}
                  >
                    {isNoCedula ? 'Desbloquear' : 'Sin Cédula'}
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Nombre Completo</label>
                <input type="text" className={styles.input} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Juan Pérez" />
              </div>

              <div className={styles.formGroup}>
                <label>Teléfono</label>
                <input type="text" className={styles.input} value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="099..." />
              </div>

              <div className={styles.formGroup}>
                <label>Correo Electrónico</label>
                <input type="email" className={styles.input} value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="juan@ejemplo.com" />
              </div>

              <div className={styles.formGroup}>
                <label>Vendedor Asignado</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className={styles.input}
                    style={{ width: '100%' }}
                    value={vendedorNombre}
                    onChange={(e) => setVendedorNombre(e.target.value)}
                    onFocus={() => setFocusedSeller(true)}
                    onBlur={() => setTimeout(() => setFocusedSeller(false), 200)}
                    placeholder="Ej: Marcos D."
                    required
                  />
                  {focusedSeller && allSellers && (
                    <ul
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        width: '100%',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        background: 'var(--surface)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 'var(--radius-md)',
                        zIndex: 50,
                        padding: 0,
                        margin: '4px 0 0',
                        listStyle: 'none',
                        boxShadow: 'var(--shadow-md)',
                      }}
                    >
                      {allSellers
                        .filter((seller) => 
                          vendedorNombre 
                            ? seller.nombre.toLowerCase().includes(vendedorNombre.toLowerCase())
                            : true
                        )
                        .map((seller) => (
                          <li
                            key={seller.id}
                            style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                            onMouseDown={(e) => {
                              e.preventDefault()
                              setVendedorNombre(seller.nombre)
                              setFocusedSeller(false)
                            }}
                          >
                            {seller.nombre}
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <hr style={{ borderColor: 'var(--glass-border)', margin: '2rem 0' }} />

            <h3>Productos</h3>
            <div className={styles.itemsHeader} style={{ marginTop: '1rem' }}>
              <div>Nombre del Producto</div>
              <div>Cantidad</div>
              <div>Precio Unitario</div>
              <div>Subtotal</div>
              <div>Acción</div>
            </div>

            {items.map((item) => (
              <div key={item.id} className={styles.itemRow}>
                <div style={{ position: 'relative' }}>
                  <input
                    className={styles.input}
                    style={{ width: '100%' }}
                    placeholder="Ej: Balón de Fútbol Mikasa"
                    required
                    value={item.nombre}
                    onChange={(e) => updateItem(item.id, 'nombre', e.target.value)}
                    onFocus={() => setFocusedRowId(item.id)}
                    onBlur={() => setTimeout(() => setFocusedRowId(null), 200)}
                  />
                  {focusedRowId === item.id && (
                    <ul
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        width: '100%',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        background: 'var(--surface)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 'var(--radius-md)',
                        zIndex: 50,
                        padding: 0,
                        margin: '4px 0 0',
                        listStyle: 'none',
                        boxShadow: 'var(--shadow-md)',
                      }}
                    >
                      {allProducts.filter((product) => product.nombre.toLowerCase().includes(item.nombre.toLowerCase())).map((product) => (
                        <li
                          key={product.id}
                          style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                          onMouseDown={(e) => {
                            e.preventDefault()
                            updateItemMultiple(item.id, { nombre: product.nombre, precio_unitario: product.precio || 0 })
                            setFocusedRowId(null)
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{product.nombre}</span>
                            <span style={{ color: 'var(--accent-secondary)' }}>${(product.precio || 0).toFixed(2)}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <input
                  className={styles.input}
                  type="number"
                  min="1"
                  required
                  value={item.cantidad}
                  onChange={(e) => updateItem(item.id, 'cantidad', parseInt(e.target.value) || 0)}
                />
                <div style={{ position: 'relative' }}>
                  <input
                    className={styles.input}
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={item.precio_unitario || ''}
                    onChange={(e) => updateItem(item.id, 'precio_unitario', parseFloat(e.target.value) || 0)}
                    style={{
                      borderColor:
                        (allProducts.find((product) => product.nombre === item.nombre)?.precio_minimo ?? 0) > 0 &&
                        item.precio_unitario < (allProducts.find((product) => product.nombre === item.nombre)?.precio_minimo || 0)
                          ? '#ff5555'
                          : 'var(--glass-border)',
                      color:
                        (allProducts.find((product) => product.nombre === item.nombre)?.precio_minimo ?? 0) > 0 &&
                        item.precio_unitario < (allProducts.find((product) => product.nombre === item.nombre)?.precio_minimo || 0)
                          ? '#ff5555'
                          : 'var(--text-primary)',
                    }}
                  />
                  {(allProducts.find((product) => product.nombre === item.nombre)?.precio_minimo ?? 0) > 0 &&
                    item.precio_unitario < (allProducts.find((product) => product.nombre === item.nombre)?.precio_minimo || 0) && (
                      <span
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#ff5555', fontSize: '1.2rem' }}
                        title={`¡Por debajo del mínimo: $${(allProducts.find((product) => product.nombre === item.nombre)?.precio_minimo || 0).toFixed(2)}!`}
                      >
                        !
                      </span>
                    )}
                </div>
                <div className={styles.subtotalText}>
                  ${(item.cantidad * item.precio_unitario).toFixed(2)}
                </div>
                <button
                  type="button"
                  className={`${styles.button} ${styles.buttonDanger}`}
                  onClick={() => removeItemRow(item.id)}
                  disabled={items.length === 1}
                >
                  X
                </button>
              </div>
            ))}

            <button
              type="button"
              className={`${styles.button} ${styles.buttonNeon}`}
              style={{ marginTop: '1rem' }}
              onClick={addItemRow}
            >
              + Añadir Fila
            </button>

            <div style={{ marginTop: '2rem' }}>
              <h3>Pagos</h3>
              <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                {pagos.map((pago, index) => (
                  <div
                    key={pago.id}
                    style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) auto', gap: '1rem', alignItems: 'end' }}
                  >
                    <div style={{ position: 'relative' }}>
                      <label className={styles.label}>Método de Pago {index + 1}</label>
                      <input
                        className={styles.input}
                        style={{ width: '100%', cursor: 'pointer' }}
                        value={getPaymentMethodName(pago.metodoPagoId)}
                        onFocus={() => setFocusedPaymentId(pago.id)}
                        onBlur={() => setTimeout(() => setFocusedPaymentId(null), 200)}
                        placeholder="Selecciona un método..."
                        readOnly
                        required={index === 0}
                      />
                      {focusedPaymentId === pago.id && paymentMethods && (
                        <ul
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            width: '100%',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            background: 'var(--surface)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: 'var(--radius-md)',
                            zIndex: 50,
                            padding: 0,
                            margin: '4px 0 0',
                            listStyle: 'none',
                            boxShadow: 'var(--shadow-md)',
                          }}
                        >
                          {paymentMethods.map((paymentMethod) => (
                            <li
                              key={paymentMethod.id}
                              style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                              onMouseDown={(e) => {
                                e.preventDefault()
                                updatePayment(pago.id, 'metodoPagoId', paymentMethod.id)
                                setFocusedPaymentId(null)
                              }}
                            >
                              {paymentMethod.nombre}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div>
                      <label className={styles.label}>Valor</label>
                      <input
                        className={styles.input}
                        style={{ width: '100%' }}
                        type="number"
                        min="0"
                        step="0.01"
                        required={index === 0}
                        placeholder="0.00"
                        value={pago.valor}
                        onChange={(e) => updatePayment(pago.id, 'valor', e.target.value ? parseFloat(e.target.value) : '')}
                      />
                    </div>
                    <button
                      type="button"
                      className={`${styles.button} ${styles.buttonDanger}`}
                      onClick={() => removePaymentRow(pago.id)}
                      disabled={pagos.length === 1}
                      style={{ height: 'fit-content' }}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className={`${styles.button} ${styles.buttonNeon}`}
                style={{ marginTop: '1rem' }}
                onClick={addPaymentRow}
              >
                + Añadir Pago
              </button>
            </div>

            <div className={styles.formGroup} style={{ marginTop: '1.5rem', padding: '0 1.5rem' }}>
              <label>Observaciones de la Venta (Opcional)</label>
              <textarea
                className={styles.input}
                rows={3}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Escribe alguna nota adicional..."
                style={{ resize: 'vertical' }}
              />
            </div>

            {!pagosMatch && totalVenta > 0 && (
              <div
                style={{
                  color: 'var(--warning)',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  margin: '1.5rem 0',
                  border: '1px solid var(--warning)',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
              >
                La suma de los pagos (${totalPagos.toFixed(2)}) no coincide con el Total de la Venta (${totalVenta.toFixed(2)}).
              </div>
            )}

            <div className={styles.totalBanner}>
              <div className={styles.totalBox}>
                <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>TOTAL A COBRAR</span>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-primary)', textShadow: 'var(--shadow-neon)' }}>
                  ${totalVenta.toFixed(2)}
                </span>
              </div>
              <button
                type="submit"
                disabled={loading || (!pagosMatch && totalVenta > 0)}
                className={`${styles.button} ${styles.buttonPrimary} ${(loading || (!pagosMatch && totalVenta > 0)) ? styles.disabled : ''}`}
                style={{ flex: 0, padding: '0 4rem', fontSize: '1.2rem', opacity: (!pagosMatch && totalVenta > 0) ? 0.5 : 1, cursor: (!pagosMatch && totalVenta > 0) ? 'not-allowed' : 'pointer' }}
              >
                {loading ? 'Guardando...' : editingSaleId ? 'Guardar Cambios' : 'Registrar Venta'}
              </button>
            </div>
          </form>
        </section>
      )}

      {!isEditPage && (
      <section className={`${styles.historySection} glass-panel animate-fade-in`} style={{ marginTop: '2rem' }}>
        <h2>Historial de Ventas ({historicalSales.length})</h2>
        <div className={styles.historyList}>
          {historicalSales.map((sale) => (
            <div key={sale.id} className={styles.historyItem}>
              <div>
                <strong>{sale.cliente_nombre || sale.client?.nombre || 'Cliente Anónimo'}</strong> (CI: {sale.cliente_cedula || sale.client?.cedula})
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {new Date(sale.createdAt).toLocaleString('es-CO', { timeZone: 'America/Bogota' })}
                  {sale.createdBy && <span style={{ marginLeft: '0.5rem', opacity: 0.7 }}> creado por: <strong style={{ color: 'var(--accent-secondary)' }}>{getAdminName(sale.createdBy)}</strong></span>}
                  {' • '}
                  Venta con {sale.items.length} ítems
                  {sale.vendedor_nombre && ` • Vendido por: ${sale.vendedor_nombre}`}
                </div>
                {sale.transactions?.length > 0 && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                    Pagos: {sale.transactions.map((transaction) => `${transaction.paymentMethod?.nombre || 'Método'} $${Number(transaction.monto || 0).toFixed(2)}`).join(' • ')}
                  </div>
                )}
                {sale.observaciones && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-secondary)', fontStyle: 'italic', marginTop: '0.2rem' }}>
                    "{sale.observaciones}"
                  </div>
                )}
              </div>
              <div style={{ fontWeight: 'bold', color: 'var(--accent-primary)', fontSize: '1.1rem' }}>
                ${sale.total.toFixed(2)}
              </div>
              <button
                type="button"
                className={styles.buttonOutline}
                style={{ marginLeft: '1rem', padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
                onClick={() => setSalePendingEdit(sale)}
              >
                Editar
              </button>
            </div>
          ))}
          {historicalSales.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No hay ventas registradas aún.</p>}
        </div>
      </section>
      )}

      {salePendingEdit && isMounted && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.82)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1rem',
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '1.5rem',
              border: '1px solid var(--glass-border)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '0.6rem', color: 'var(--accent-primary)' }}>Confirmar edición</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              Vas a abrir la venta de <strong>{salePendingEdit.cliente_nombre || salePendingEdit.client?.nombre || 'Cliente Anónimo'}</strong> para editarla en una vista dedicada.
            </p>
            <div style={{ marginTop: '1.2rem', display: 'flex', justifyContent: 'flex-end', gap: '0.7rem' }}>
              <button
                type="button"
                className={styles.buttonOutline}
                onClick={() => setSalePendingEdit(null)}
                style={{ padding: '0.55rem 1rem' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.buttonPrimary}`}
                onClick={confirmEditFromModal}
                style={{ padding: '0.55rem 1rem' }}
              >
                Abrir edición
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {salePendingDeleteId && isMounted && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.82)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1rem',
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '1.5rem',
              border: '1px solid var(--danger)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '0.6rem', color: 'var(--danger)' }}>Confirmar eliminación</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              Esta acción eliminará la venta de forma permanente junto con sus ítems y pagos asociados.
            </p>
            <div style={{ marginTop: '1.2rem', display: 'flex', justifyContent: 'flex-end', gap: '0.7rem' }}>
              <button
                type="button"
                className={styles.buttonOutline}
                onClick={() => setSalePendingDeleteId(null)}
                style={{ padding: '0.55rem 1rem' }}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.buttonDanger}`}
                onClick={confirmDeleteSale}
                style={{ padding: '0.55rem 1rem' }}
                disabled={loading}
              >
                {loading ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
