import prisma from '@/lib/prisma'
import { SkeletonDashboardMetrics } from './Skeleton'
import { SuspenseSection } from './SuspenseWrappers'

interface AdminMetricsProps {
  rangeStart: Date
  rangeEnd: Date
}

/**
 * Helper para renderizar las métricas como JSX.
 */
function AdminMetricsDisplay({ 
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

/**
 * Componente de servidor que calcula métricas del dashboard.
 * Este cálculo es costoso y se renderiza en el servidor.
 */
async function AdminMetricsContent({ rangeStart, rangeEnd }: AdminMetricsProps) {
  // 1. Normalizar a inicio y fin del día en hora Colombia
  const start = new Date(rangeStart)
  const end = new Date(rangeEnd)

  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)

  // 2. Convertir a UTC (Colombia = UTC-5)
  const startUTC = new Date(start.getTime() + (5 * 60 * 60 * 1000))
  const endUTC = new Date(end.getTime() + (5 * 60 * 60 * 1000))

  // 3. Query consistente
  const salesInRange = await prisma.sale.findMany({
    where: {
      fecha_venta: {
        gte: startUTC,
        lte: endUTC,
      },
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
  const totalSalesAmount = salesInRange.reduce(
    (acc, sale) => acc + Number(sale.total || 0),
    0
  )
  const averageTicket =
    totalSalesCount > 0 ? totalSalesAmount / totalSalesCount : 0

  return (
    <AdminMetricsDisplay
      totalSalesCount={totalSalesCount}
      totalSalesAmount={totalSalesAmount}
      averageTicket={averageTicket}
    />
  )
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
