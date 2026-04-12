'use client'

import Link from 'next/link'
import styles from '@/app/page.module.css'
import { logout } from '@/app/auth.actions'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="admin-header" style={{ 
        background: 'var(--surface)', 
        borderBottom: '1px solid var(--glass-border)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/admin" style={{ textDecoration: 'none' }}>
            <h2 style={{ margin: 0, color: 'var(--accent-primary)', textShadow: 'var(--shadow-neon)' }}>
              Admin POS
            </h2>
          </Link>

          <nav className="desktop-nav admin-nav-links">
            <Link href="/admin/clientes" className={`${styles.buttonOutline} admin-nav-link`}>
              Clientes
            </Link>
            <Link href="/admin/productos" className={`${styles.buttonOutline} admin-nav-link`}>
              Productos
            </Link>
            <Link href="/admin/vendedores" className={`${styles.buttonOutline} admin-nav-link`}>
              Vendedores
            </Link>
            <Link href="/admin/usuarios" className={`${styles.buttonOutline} admin-nav-link`}>
              Usuarios
            </Link>
            <Link href="/admin/metodos_pago" className={`${styles.buttonOutline} admin-nav-link`}>
              Pagos
            </Link>
            <Link href="/admin/transacciones" className={`${styles.buttonOutline} admin-nav-link`}>
              Transacciones
            </Link>
          </nav>
        </div>
        
        <div className="admin-tools">
          <Link
            href="/"
            className={styles.buttonOutline}
            style={{ textDecoration: 'none', padding: '0.5rem 1rem', minHeight: '42px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            Ir a Caja
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className={styles.buttonOutline}
              style={{ padding: '0.5rem 1rem', borderColor: 'var(--danger)', color: 'var(--danger)', minHeight: '42px', borderRadius: '12px' }}
            >
              Cerrar Sesión
            </button>
          </form>
        </div>
      </header>
      <main style={{ flex: 1, padding: '2rem 0' }}>
        {children}
      </main>
    </div>
  )
}
