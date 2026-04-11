'use client'

import { useState } from 'react'
import styles from '@/app/page.module.css'
import { changeOwnPassword } from './adminCrud.actions' // To be created

export default function ChangePasswordForm({ currentUserEmail }: { currentUserEmail: string }) {
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formUrl = e.currentTarget
    const formData = new FormData(formUrl)
    
    try {
      const res = await changeOwnPassword(formData)
      if (!res?.error) {
        formUrl.reset()
      }
    } catch (err: any) {
      console.error("Error:", err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', borderLeft: '4px solid var(--accent-secondary)' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
           Tu Perfil: <b>{currentUserEmail}</b>
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
           Actualiza tu propia contraseña. Cerrarás sesión si es exitoso (o simplemente continua usándolo).
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className={styles.formGroup}>
            <label>Contraseña Actual</label>
            <input type="password" name="currentPassword" className={styles.input} required placeholder="••••••" />
          </div>
          <div className={styles.formGroup}>
            <label>Nueva Contraseña</label>
            <input type="password" name="newPassword" className={styles.input} required placeholder="••••••" minLength={6} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" disabled={loading} className={`${styles.button} ${styles.buttonOutline}`} style={{ width: '100%', padding: '0.75rem', borderColor: 'var(--accent-secondary)', color: 'var(--accent-secondary)' }}>
              {loading ? 'Cambiando...' : 'Cambiar Mi Contraseña'}
            </button>
          </div>
        </form>
    </div>
  )
}
