'use client'

import { useState } from 'react'
import { login } from '@/app/auth.actions'
import styles from '@/app/page.module.css'
import Link from 'next/link'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    try {
      const res = await login(formData)
      if (res?.error) {
        setError(res.error)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleSubmit} className="glass-panel animate-fade-in" style={{ padding: '3rem', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 className="title-main" style={{ margin: 0 }}>
            Panel Admin
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Acceso restringido
          </p>
        </div>
        
        {error && (
          <div style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: '#ef4444', borderRadius: 'var(--radius-md)', textAlign: 'center', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
          <label className={styles.label}>Correo Electrónico</label>
          <input 
            name="email"
            type="email" 
            required 
            className={styles.input} 
            placeholder="admin@pos.com"
            style={{ width: '100%' }}
          />
        </div>

        <div className={styles.formGroup} style={{ marginBottom: '2rem' }}>
          <label className={styles.label}>Contraseña</label>
          <input 
            name="password"
            type="password" 
            required 
            className={styles.input} 
            placeholder="••••••••"
            style={{ width: '100%' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className={`${styles.button} ${styles.buttonPrimary} ${loading ? styles.disabled : ''}`}
          style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Ingresando...' : 'Iniciar Sesión'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link href="/login/recuperar" style={{ color: 'var(--accent-primary)', opacity: 0.8, textDecoration: 'none', fontSize: '0.95rem' }}>
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
          <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
            ← Volver al Cajero POS
          </Link>
        </div>
      </form>
    </div>
  )
}
