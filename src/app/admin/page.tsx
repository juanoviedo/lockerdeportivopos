import { Suspense } from 'react'
import prisma from '@/lib/prisma'
import AdminDateFilter from '@/components/AdminDateFilter'
import { SkeletonTable, SkeletonDashboardMetrics } from '@/components/Skeleton'
import { PaymentMethodTableSuspense } from '@/components/PaymentMethodTable'

// ISR: Revalidar la página cada 1 hora (3600 segundos)
// Esto permite servir la página en caché desde la Edge Network de Vercel
// mientras que en background se regenera con datos nuevos
export const revalidate = 3600

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 2 }).format(value)
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ startDate?: string; endDate?: string }>
}) {
  const params = (await searchParams) || {}
  const today = new Date()
  const colombiaOffset = -5 * 60 * 60 * 1000 // UTC-5 in milliseconds

  const colombiaNow = new Date(today.getTime() + colombiaOffset)
  const todayStr = colombiaNow.toISOString().slice(0, 10)

  let startDateStr = params.startDate || todayStr
  let endDateStr = params.endDate || todayStr
  let validationMessage = ''

  if (startDateStr > todayStr) {
    startDateStr = todayStr
    validationMessage = 'La fecha inicial no puede estar en el futuro. Se ajustó al día actual.'
  }

  if (endDateStr > todayStr) {
    endDateStr = todayStr
    validationMessage = 'La fecha final no puede estar en el futuro. Se ajustó al día actual.'
  }

  if (startDateStr > endDateStr) {
    startDateStr = todayStr
    endDateStr = todayStr
    validationMessage = 'La fecha inicial no puede ser mayor que la fecha final. Se restauró al día actual.'
  }

  // Adjust dates back to UTC for database query (since fecha_venta is stored in UTC)
  // Parsing 'YYYY-MM-DD T00:00:00Z' gives us midnight UTC.
  // We subtract the offset (UTC-5) to shift this to Colombia's midnight (which is 5AM UTC)
  const rangeStart = new Date(new Date(`${startDateStr}T00:00:00Z`).getTime() - colombiaOffset)
  const rangeEnd = new Date(new Date(`${endDateStr}T00:00:00Z`).getTime() + 24 * 60 * 60 * 1000 - 1 - colombiaOffset)

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
    orderBy: [
      { fecha_venta: 'desc' },
      { createdAt: 'desc' },
    ],
  })

  const totalSalesCount = salesInRange.length
  const totalSalesAmount = salesInRange.reduce((acc, sale) => acc + Number(sale.total || 0), 0)
  const averageTicket = totalSalesCount > 0 ? totalSalesAmount / totalSalesCount : 0

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 className="title-main" style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>Centro de Control</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>
        Dashboard de ventas por rango de fechas y métodos de pago.
      </p>

      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <AdminDateFilter defaultStart={startDateStr} defaultEnd={endDateStr} todayStr={todayStr} />
        <p style={{ margin: '0.8rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Mostrando datos desde <strong>{startDateStr}</strong> hasta <strong>{endDateStr}</strong>.
        </p>
        {validationMessage && (
          <p style={{ margin: '0.5rem 0 0', color: 'var(--warning)', fontSize: '0.9rem' }}>
            {validationMessage}
          </p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Cantidad de ventas</p>
          <h2 style={{ margin: '0.35rem 0 0', color: 'var(--accent-primary)', fontSize: '2rem' }}>{totalSalesCount}</h2>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Monto vendido</p>
          <h2 style={{ margin: '0.35rem 0 0', color: 'var(--accent-secondary)', fontSize: '1.7rem' }}>{formatCurrency(totalSalesAmount)}</h2>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Ticket promedio</p>
          <h2 style={{ margin: '0.35rem 0 0', color: '#ffb86c', fontSize: '1.7rem' }}>{formatCurrency(averageTicket)}</h2>
        </div>
      </div>

      {/* Tabla de métodos de pago envuelta en Suspense para mejor UX */}
      <PaymentMethodTableSuspense
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        totalSalesAmount={totalSalesAmount}
      />
    </div>
  )
}
