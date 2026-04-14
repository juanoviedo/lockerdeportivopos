import prisma from '@/lib/prisma'
import { SkeletonDashboardMetrics } from './Skeleton'
import { SuspenseSection } from './SuspenseWrappers'

interface AdminMetricsProps {
  rangeStart: Date
  rangeEnd: Date
}

/**
 * Componente de servidor que calcula métricas del dashboard.
 * Este cálculo es costoso y se renderiza en el servidor.
 */
async function AdminMetricsContent({ rangeStart, rangeEnd }: AdminMetricsProps) {
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

  const totalSalesCount = salesInRange.length
  const totalSalesAmount = salesInRange.reduce((acc, sale) => acc + Number(sale.total || 0), 0)
  const averageTicket = totalSalesCount > 0 ? totalSalesAmount / totalSalesCount : 0

  const paymentMethodTotals = salesInRange.reduce<Record<string, number>>((acc, sale) => {
    for (const transaction of sale.transactions) {
      const methodName = transaction.paymentMethod?.nombre || 'Sin método'
      acc[methodName] = (acc[methodName] || 0) + Number(transaction.monto || 0)
    }
    return acc
  }, {})

  const paymentMethodRows = Object.entries(paymentMethodTotals).sort((a, b) => b[1] - a[1])

  return {
    totalSalesCount,
    totalSalesAmount,
    averageTicket,
    paymentMethodRows,
  }
}

/**
 * Componente que envuelve las métricas del admin con Suspense.
 * Permite que otros contenidos carguen mientras se calculan las métricas.
 */
export async function AdminMetricsSection({ rangeStart, rangeEnd }: AdminMetricsProps) {
  return (
    <SuspenseSection fallback={<SkeletonDashboardMetrics />}>
      <AdminMetricsContent rangeStart={rangeStart} rangeEnd={rangeEnd} />
    </SuspenseSection>
  )
}

/**
 * Helper para renderizar las métricas como JSX.
 * Se usa después de que AsyncAdminMetrics haya resuelto los datos.
 */
export function AdminMetricsDisplay({ 
  totalSalesCount, 
  totalSalesAmount, 
  averageTicket 
}: { 
  totalSalesCount: number
  totalSalesAmount: number
  averageTicket: number
}) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      maximumFractionDigits: 2 
    }).format(value)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
      <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Total Ventas</p>
        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{totalSalesCount}</p>
      </div>
      <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Valor Total</p>
        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{formatCurrency(totalSalesAmount)}</p>
      </div>
      <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Ticket Promedio</p>
        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{formatCurrency(averageTicket)}</p>
      </div>
    </div>
  )
}
