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
      <header style={{ 
        background: 'var(--surface)', 
        borderBottom: '1px solid var(--glass-border)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link href="/admin" style={{ textDecoration: 'none' }}>
            <h2 style={{ margin: 0, color: 'var(--accent-primary)', textShadow: 'var(--shadow-neon)' }}>
              Admin POS
            </h2>
          </Link>
          <nav style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/admin/clientes" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600 }}>
              Clientes
            </Link>
            <Link href="/admin/productos" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600 }}>
              Productos
            </Link>
            <Link href="/admin/vendedores" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600 }}>
              Vendedores
            </Link>
            <Link href="/admin/usuarios" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600 }}>
              Usuarios
            </Link>
            <Link href="/admin/metodos_pago" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600 }}>
              Pagos
            </Link>
          </nav>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <form action={logout}>
            <button
              type="submit"
              className={styles.buttonOutline}
              style={{ padding: '0.5rem 1rem', borderColor: 'var(--danger)', color: 'var(--danger)', minHeight: '42px', borderRadius: '12px' }}
            >
              Cerrar Sesión
            </button>
          </form>
          <Link href="/" className={styles.buttonOutline} style={{ textDecoration: 'none', padding: '0.5rem 1rem', minHeight: '42px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center' }}>
            Ir a Caja
          </Link>
        </div>
      </header>

      <main style={{ flex: 1, padding: '2rem' }}>
        {children}
      </main>
    </div>
  )
}
