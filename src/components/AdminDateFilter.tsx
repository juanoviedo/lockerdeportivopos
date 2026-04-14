'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDateFilter({ defaultStart, defaultEnd, todayStr }: { defaultStart: string, defaultEnd: string, todayStr: string }) {
  const router = useRouter()
  const [startDateStr, setStartDateStr] = useState(defaultStart)
  const [endDateStr, setEndDateStr] = useState(defaultEnd)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (startDateStr) params.set('startDate', startDateStr)
    if (endDateStr) params.set('endDate', endDateStr)
    router.push(`/admin?${params.toString()}`)
  }

  const shiftDate = (dateStr: string, days: number) => {
    if (!dateStr) return dateStr
    const d = new Date(`${dateStr}T12:00:00Z`)
    d.setDate(d.getDate() + days)
    return d.toISOString().slice(0, 10)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Fecha inicio
        </label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button 
            type="button" 
            onClick={() => setStartDateStr(shiftDate(startDateStr, -1))}
            style={{ padding: '0.4rem 0.6rem', border: '1px solid var(--glass-border)', background: 'var(--surface)', borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)', cursor: 'pointer', color: 'var(--text-primary)' }}
          >
            ◀
          </button>
          <input
            type="date"
            value={startDateStr}
            onChange={(e) => setStartDateStr(e.target.value)}
            max={todayStr}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '0', border: '1px solid var(--glass-border)', background: 'var(--surface)', color: 'var(--text-primary)' }}
            required
          />
          <button 
            type="button" 
            onClick={() => setStartDateStr(shiftDate(startDateStr, 1))}
            style={{ padding: '0.4rem 0.6rem', border: '1px solid var(--glass-border)', background: 'var(--surface)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', cursor: 'pointer', color: 'var(--text-primary)' }}
          >
            ▶
          </button>
        </div>
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Fecha fin
        </label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button 
            type="button" 
            onClick={() => setEndDateStr(shiftDate(endDateStr, -1))}
            style={{ padding: '0.4rem 0.6rem', border: '1px solid var(--glass-border)', background: 'var(--surface)', borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)', cursor: 'pointer', color: 'var(--text-primary)' }}
          >
            ◀
          </button>
          <input
            type="date"
            value={endDateStr}
            onChange={(e) => setEndDateStr(e.target.value)}
            min={startDateStr}
            max={todayStr}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '0', border: '1px solid var(--glass-border)', background: 'var(--surface)', color: 'var(--text-primary)' }}
            required
          />
          <button 
            type="button" 
            onClick={() => setEndDateStr(shiftDate(endDateStr, 1))}
            style={{ padding: '0.4rem 0.6rem', border: '1px solid var(--glass-border)', background: 'var(--surface)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', cursor: 'pointer', color: 'var(--text-primary)' }}
          >
            ▶
          </button>
        </div>
      </div>
      <button
        type="submit"
        style={{ padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--accent-primary)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
      >
        Aplicar filtro
      </button>
    </form>
  )
}
