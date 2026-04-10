'use client'

import { useState } from 'react'
import { requestPasswordReset, resetPassword } from '@/app/auth.actions'
import styles from '@/app/page.module.css'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RecuperarPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState(1) 
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [emailGuardado, setEmailGuardado] = useState('')

  const handleRequestToken = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMsg('')
    
    const formData = new FormData(e.currentTarget)
    setEmailGuardado(formData.get('email') as string)

    try {
      const res = await requestPasswordReset(formData)
      if (res?.error) setError(res.error)
      else if (res?.success) {
         setMsg("Se ha despachado el código de 6 dígitos de recuperación a tu correo. (Revisa la consola del servidor si no configuraste nodemailer).")
         setStep(2)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    formData.append('email', emailGuardado)

    try {
       const res = await resetPassword(formData)
       if (res?.error) setError(res.error)
       else if (res?.success) {
          alert('¡Contraseña actualizada exitosamente!')
          router.push('/login')
       }
    } catch (err: any) {
       setError(err.message)
    } finally {
       setLoading(false)
    }
  }

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '3rem', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 className="title-main" style={{ margin: 0, fontSize: '2rem' }}>
            Recuperar Acceso
          </h2>
        </div>
        
        {error && (
          <div style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: '#ef4444', borderRadius: 'var(--radius-md)', textAlign: 'center', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {msg && (
          <div style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', borderRadius: 'var(--radius-md)', textAlign: 'center', fontSize: '0.9rem' }}>
            {msg}
          </div>
        )}

        {step === 1 && (
           <form onSubmit={handleRequestToken}>
              <div className={styles.formGroup} style={{ marginBottom: '2rem' }}>
                <label className={styles.label}>Correo de Administrador</label>
                <input 
                  name="email"
                  type="email" 
                  required 
                  className={styles.input} 
                  placeholder="admin@pos.com"
                  style={{ width: '100%' }}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className={`${styles.button} ${styles.buttonPrimary} ${loading ? styles.disabled : ''}`}
                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? 'Enviando...' : 'Solicitar Token'}
              </button>
           </form>
        )}

        {step === 2 && (
           <form onSubmit={handleResetPassword}>
              <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
                <label className={styles.label}>Token Recibido (6 dígitos)</label>
                <input 
                  name="token"
                  type="text" 
                  required 
                  maxLength={6}
                  className={styles.input} 
                  placeholder="000000"
                  style={{ width: '100%', textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.5rem' }}
                />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '2rem' }}>
                <label className={styles.label}>Nueva Contraseña</label>
                <input 
                  name="newPassword"
                  type="password" 
                  required 
                  minLength={6}
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
                {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
              </button>
           </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
          <Link href="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
            ← Volver al login
          </Link>
        </div>
      </div>
    </div>
  )
}
