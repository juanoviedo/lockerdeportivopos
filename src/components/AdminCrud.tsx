'use client'

import { useState } from 'react'
import styles from '@/app/page.module.css'
import { createAdmin, deleteAdmin } from './adminCrud.actions' // We will create this
import { Admin } from '@prisma/client'
import { getErrorMessage } from '@/lib/errors'

export default function AdminCrud({ data, currentUserEmail }: { data: Admin[], currentUserEmail: string }) {
  const [loading, setLoading] = useState(false)
  const [showAudit, setShowAudit] = useState(false)

  const getAdminName = (id: string | null) => {
    if (!id) return '';
    return data.find((a) => a.id === id)?.nombre || id.substring(0,6) + '...';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formUrl = e.currentTarget
    const formData = new FormData(formUrl)
    try {
      const res = await createAdmin(formData)
      if (res?.error) alert(res.error)
      else formUrl.reset()
    } catch (err: unknown) {
      alert("Error: " + getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este administrador? Perderá acceso inmediato.')) {
      setLoading(true)
      await deleteAdmin(id)
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--accent-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🛡️ Control de Acceso Maestro
        </h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className={styles.formGroup}>
            <label>Nombre de Referencia</label>
            <input type="text" name="nombre" className={styles.input} required placeholder="Ej: Marcos Director" />
          </div>
          <div className={styles.formGroup}>
            <label>Correo Electrónico (Login)</label>
            <input type="email" name="email" className={styles.input} required placeholder="marcos@pos.com" />
          </div>
          <div className={styles.formGroup}>
            <label>Contraseña</label>
            <input type="password" name="password" className={styles.input} required placeholder="••••••" />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" disabled={loading} className={`${styles.button} ${styles.buttonPrimary} ${loading ? styles.disabled : ''}`} style={{ width: '100%', padding: '0.75rem' }}>
              {loading ? 'Procesando...' : '+ Crear Admin'}
            </button>
          </div>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>Administradores Activos</h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={showAudit} onChange={(e) => setShowAudit(e.target.checked)} />
            Mostrar Datos de Auditoría
          </label>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem' }}>Nombre</th>
                <th style={{ padding: '1rem' }}>Correo</th>
                <th style={{ padding: '1rem' }}>Creado el</th>
                {showAudit && <th style={{ padding: '1rem', fontSize: '0.85rem' }}>Auditoría (Completa)</th>}
                <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map((admin) => (
                <tr key={admin.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>{admin.nombre}</td>
                  <td style={{ padding: '1rem', color: 'var(--accent-primary)' }}>{admin.email}</td>
                  <td style={{ padding: '1rem' }}>{new Date(admin.createdAt).toLocaleDateString()}</td>
                  {showAudit && (
                    <td style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <div>C: {new Date(admin.createdAt).toLocaleString('es-CO')}</div>
                      {admin.createdBy && <div>por: <strong>{getAdminName(admin.createdBy)}</strong></div>}
                      <hr style={{margin: '0.2rem 0', borderColor: 'var(--glass-border)'}}/>
                      <div>M: {admin.updatedAt ? new Date(admin.updatedAt).toLocaleString('es-CO') : '-'}</div>
                      {admin.updatedBy && <div>por: <strong>{getAdminName(admin.updatedBy)}</strong></div>}
                    </td>
                  )}
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {admin.email !== currentUserEmail ? (
                      <button 
                         onClick={() => handleDelete(admin.id)}
                         className={styles.buttonOutline}
                         style={{ padding: '0.4rem 1rem', borderColor: 'var(--danger)', color: 'var(--danger)', fontSize: '0.9rem' }}
                      >
                        Eliminar
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.9rem', color: 'var(--success)', padding: '0.4rem 1rem' }}>Estás Online</span>
                    )}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No hay administradores registrados (Cargará semilla).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
