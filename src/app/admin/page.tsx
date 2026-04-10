import prisma from '@/lib/prisma'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 2 }).format(value)
}

function toLocalIsoDate(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 10)
}

function parseDateInput(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ startDate?: string; endDate?: string }>
}) {
  const params = (await searchParams) || {}
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = toLocalIsoDate(today)

  const parsedStart = parseDateInput(params.startDate)
  const parsedEnd = parseDateInput(params.endDate)

  let startDate = parsedStart ?? today
  let endDate = parsedEnd ?? today
  let validationMessage = ''

  if (startDate > today) {
    startDate = today
    validationMessage = 'La fecha inicial no puede estar en el futuro. Se ajustó al día actual.'
  }

  if (endDate > today) {
    endDate = today
    validationMessage = 'La fecha final no puede estar en el futuro. Se ajustó al día actual.'
  }

  if (startDate > endDate) {
    startDate = today
    endDate = today
    validationMessage = 'La fecha inicial no puede ser mayor que la fecha final. Se restauró al día actual.'
  }

  const startDateStr = toLocalIsoDate(startDate)
  const endDateStr = toLocalIsoDate(endDate)

  const rangeStart = new Date(startDate)
  rangeStart.setHours(0, 0, 0, 0)

  const rangeEnd = new Date(endDate)
  rangeEnd.setHours(23, 59, 59, 999)

  const salesInRange = await prisma.sale.findMany({
    where: {
      createdAt: {
        gte: rangeStart,
        lte: rangeEnd,
      },
    },
    include: {
      transactions: {
        include: {
          paymentMethod: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
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

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 className="title-main" style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>Centro de Control</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>
        Dashboard de ventas por rango de fechas y métodos de pago.
      </p>

      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <form method="GET" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.9rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Fecha inicio
            </label>
            <input
              type="date"
              name="startDate"
              defaultValue={startDateStr}
              max={todayStr}
              style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', background: 'var(--surface)', color: 'var(--text-primary)' }}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Fecha fin
            </label>
            <input
              type="date"
              name="endDate"
              defaultValue={endDateStr}
              min={startDateStr}
              max={todayStr}
              style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', background: 'var(--surface)', color: 'var(--text-primary)' }}
              required
            />
          </div>
          <button
            type="submit"
            style={{ padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--accent-primary)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
          >
            Aplicar filtro
          </button>
        </form>
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

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ marginTop: 0, marginBottom: '0.3rem' }}>Ventas por método de pago</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: 0, marginBottom: '1.25rem' }}>
          Suma de todas las transacciones del rango, agrupadas por método de pago.
        </p>

        {paymentMethodRows.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No hay ventas registradas en el rango seleccionado.</p>
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
                      <td style={{ padding: '0.85rem 0.6rem', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(amount)}</td>
                      <td style={{ padding: '0.85rem 0.6rem', textAlign: 'right', color: 'var(--text-secondary)' }}>{percentage.toFixed(2)}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
