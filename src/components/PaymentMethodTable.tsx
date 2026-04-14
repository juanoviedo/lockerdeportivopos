import prisma from '@/lib/prisma'
import { SkeletonTable } from './Skeleton'
import { Suspense } from 'react'

interface PaymentMethodTableProps {
  rangeStart: Date
  rangeEnd: Date
  totalSalesAmount: number
}

/**
 * Componente de servidor que calcula y renderiza la tabla de métodos de pago.
 * Este cálculo es costoso para períodos largos, así que se renderiza en Suspense.
 */
async function PaymentMethodTableContent({
  rangeStart,
  rangeEnd,
  totalSalesAmount,
}: PaymentMethodTableProps) {
  const salesInRange = await prisma.sale.findMany({
    where: {
      OR: [
        {
          fecha_venta: {
            gte: rangeStart,
            lte: rangeEnd,
          },
        },
        {
          AND: [
            { fecha_venta: { equals: null } },
            {
              createdAt: {
                gte: rangeStart,
                lte: rangeEnd,
              },
            },
          ],
        },
      ],
    },
    include: {
      transactions: {
        include: {
          paymentMethod: true,
        },
      },
    },
  })

  const paymentMethodTotals = salesInRange.reduce<Record<string, number>>((acc, sale) => {
    for (const transaction of sale.transactions) {
      const methodName = transaction.paymentMethod?.nombre || 'Sin método'
      acc[methodName] = (acc[methodName] || 0) + Number(transaction.monto || 0)
    }
    return acc
  }, {})

  const paymentMethodRows = Object.entries(paymentMethodTotals).sort((a, b) => b[1] - a[1])

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <h3 style={{ marginTop: 0, marginBottom: '0.3rem' }}>Ventas por método de pago</h3>
      <p style={{ color: 'var(--text-secondary)', marginTop: 0, marginBottom: '1.25rem' }}>
        Suma de todas las transacciones del rango, agrupadas por método de pago.
      </p>

      {paymentMethodRows.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          No hay ventas registradas en el rango seleccionado.
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.9rem 0.6rem' }}>Método</th>
                <th style={{ padding: '0.9rem 0.6rem', textAlign: 'right' }}>Total acumulado</th>
                <th style={{ padding: '0.9rem 0.6rem', textAlign: 'right' }}>% del total</th>
              </tr>
            </thead>
            <tbody>
              {paymentMethodRows.map(([methodName, amount]) => {
                const percentage = totalSalesAmount > 0 ? (amount / totalSalesAmount) * 100 : 0
                return (
                  <tr key={methodName} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '0.85rem 0.6rem' }}>{methodName}</td>
                    <td style={{ padding: '0.85rem 0.6rem', textAlign: 'right', fontWeight: 600 }}>
                      {new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        maximumFractionDigits: 2,
                      }).format(amount)}
                    </td>
                    <td style={{ padding: '0.85rem 0.6rem', textAlign: 'right', color: 'var(--text-secondary)' }}>
                      {percentage.toFixed(2)}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/**
 * Componente que envuelve la tabla de métodos de pago con Suspense.
 * Permite que el resto del dashboard cargue mientras se calcula esta tabla.
 */
export function PaymentMethodTableSuspense({
  rangeStart,
  rangeEnd,
  totalSalesAmount,
}: PaymentMethodTableProps) {
  return (
    <Suspense fallback={<SkeletonTable />}>
      <PaymentMethodTableContent
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        totalSalesAmount={totalSalesAmount}
      />
    </Suspense>
  )
}
