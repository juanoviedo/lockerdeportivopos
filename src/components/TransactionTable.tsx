'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from '@/app/page.module.css'
import type { Transaction, PaymentMethod } from '@prisma/client'

type TransactionWithIncludes = Transaction & {
  paymentMethod: PaymentMethod
  venta: {
    id: string
    cliente_nombre: string | null
    vendedor_nombre: string | null
    total: number
    createdAt: Date
  }
}

interface TransactionTableProps {
  transactions: TransactionWithIncludes[]
  paymentMethods: Pick<PaymentMethod, 'id' | 'nombre'>[]
}

export default function TransactionTable({ transactions, paymentMethods }: TransactionTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [fechaIni, setFechaIni] = useState(searchParams.get('fechaIni') || '')
  const [fechaFin, setFechaFin] = useState(searchParams.get('fechaFin') || '')
  const [paymentMethodId, setPaymentMethodId] = useState(searchParams.get('paymentMethodId') || '')

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (fechaIni) params.set('fechaIni', fechaIni)
    if (fechaFin) params.set('fechaFin', fechaFin)
    if (paymentMethodId) params.set('paymentMethodId', paymentMethodId)
    router.push(`/admin/transacciones?${params.toString()}`)
  }

  const clearFilters = () => {
    setFechaIni('')
    setFechaFin('')
    setPaymentMethodId('')
    router.push('/admin/transacciones')
  }

  return (
    <div>
      {/* Filtros */}
      <div className="glass-panel" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>Filtros de Transacciones</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div className={styles.formGroup}>
            <label style={{ color: 'var(--text-primary)' }}>Fecha Inicial</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button 
                type="button" 
                onClick={() => setFechaIni(prev => prev ? new Date(new Date(prev).getTime() - 86400000).toISOString().slice(0, 10) : new Date(Date.now() - 86400000).toISOString().slice(0, 10))}
                style={{ padding: '0.4rem 0.6rem', border: '1px solid var(--glass-border)', background: 'var(--surface)', borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)', cursor: 'pointer', color: 'var(--text-primary)' }}
              >
                ◀
              </button>
              <input
                type="date"
                className={styles.input}
                value={fechaIni}
                onChange={(e) => setFechaIni(e.target.value)}
                style={{ borderRadius: '0' }}
              />
              <button 
                type="button" 
                onClick={() => setFechaIni(prev => prev ? new Date(new Date(prev).getTime() + 86400000).toISOString().slice(0, 10) : new Date(Date.now() + 86400000).toISOString().slice(0, 10))}
                style={{ padding: '0.4rem 0.6rem', border: '1px solid var(--glass-border)', background: 'var(--surface)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', cursor: 'pointer', color: 'var(--text-primary)' }}
              >
                ▶
              </button>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label style={{ color: 'var(--text-primary)' }}>Fecha Final</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button 
                type="button" 
                onClick={() => setFechaFin(prev => prev ? new Date(new Date(prev).getTime() - 86400000).toISOString().slice(0, 10) : new Date(Date.now() - 86400000).toISOString().slice(0, 10))}
                style={{ padding: '0.4rem 0.6rem', border: '1px solid var(--glass-border)', background: 'var(--surface)', borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)', cursor: 'pointer', color: 'var(--text-primary)' }}
              >
                ◀
              </button>
              <input
                type="date"
                className={styles.input}
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                style={{ borderRadius: '0' }}
              />
              <button 
                type="button" 
                onClick={() => setFechaFin(prev => prev ? new Date(new Date(prev).getTime() + 86400000).toISOString().slice(0, 10) : new Date(Date.now() + 86400000).toISOString().slice(0, 10))}
                style={{ padding: '0.4rem 0.6rem', border: '1px solid var(--glass-border)', background: 'var(--surface)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', cursor: 'pointer', color: 'var(--text-primary)' }}
              >
                ▶
              </button>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label style={{ color: 'var(--text-primary)' }}>Método de Pago</label>
            <select
              className={styles.input}
              value={paymentMethodId}
              onChange={(e) => setPaymentMethodId(e.target.value)}
            >
              <option value="">Todos</option>
              {paymentMethods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.nombre}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={applyFilters}
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              Aplicar Filtros
            </button>
            <button
              onClick={clearFilters}
              className={styles.buttonOutline}
              style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-responsive">
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--accent-primary)', background: 'rgba(0,0,0,0.2)' }}>
                <th style={{ padding: '1.25rem 1rem' }}>Fecha</th>
                <th style={{ padding: '1.25rem 1rem' }}>Venta ID</th>
                <th style={{ padding: '1.25rem 1rem' }}>Cliente</th>
                <th style={{ padding: '1.25rem 1rem' }}>Vendedor</th>
                <th style={{ padding: '1.25rem 1rem' }}>Método de Pago</th>
                <th style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>Monto</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1.25rem 1rem', fontWeight: 600 }}>
                    {new Date(transaction.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td style={{ padding: '1.25rem 1rem', color: 'var(--text-secondary)' }}>{transaction.venta.id}</td>
                  <td style={{ padding: '1.25rem 1rem', color: 'var(--text-secondary)' }}>{transaction.venta.cliente_nombre || '-'}</td>
                  <td style={{ padding: '1.25rem 1rem', color: 'var(--text-secondary)' }}>{transaction.venta.vendedor_nombre || '-'}</td>
                  <td style={{ padding: '1.25rem 1rem', color: 'var(--text-secondary)' }}>{transaction.paymentMethod.nombre}</td>
                  <td style={{ padding: '1.25rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--accent-primary)' }}>
                    ${transaction.monto.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              No hay transacciones que coincidan con los filtros.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}