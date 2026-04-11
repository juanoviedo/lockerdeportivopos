'use client'

import { useState } from 'react'
import styles from '@/app/page.module.css'
import { createPaymentMethodAdmin, updatePaymentMethod, deletePaymentMethod } from '@/app/actions'

export default function PaymentMethodCrud({ methods, admins }: { methods: any[], admins?: {id:string, nombre:string}[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNombre, setEditNombre] = useState('')
  const [newNombre, setNewNombre] = useState('')
  const [showAudit, setShowAudit] = useState(false)
  const [loading, setLoading] = useState(false)

  const getAdminName = (id: string | null) => {
    if (!id) return '';
    return admins?.find(a => a.id === id)?.nombre || id.substring(0,6) + '...';
  };

  const handleCreate = async () => {
    if (!newNombre) return;
    setLoading(true)
    try {
      await createPaymentMethodAdmin({ nombre: newNombre })
      setNewNombre('')
    } catch (e: any) {
      console.error("Error al crear:", e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (id: string) => {
    if (!editNombre) return;
    setLoading(true)
    try {
      await updatePaymentMethod(id, { nombre: editNombre })
      setEditingId(null)
    } catch (e: any) {
      console.error("Error al actualizar:", e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este método de pago? (Afectará a ventas históricas si no está configurado como ON DELETE SET NULL en DB)")) return;
    setLoading(true)
    try {
      await deletePaymentMethod(id)
    } catch(e: any) {
      alert("Error al eliminar: Verifica que no esté en uso por ventas históricas.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      
      {/* Botón Auditoría */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button 
          className={styles.buttonOutline} 
          onClick={() => setShowAudit(!showAudit)}
          style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
        >
          {showAudit ? 'Ocultar Datos de Auditoría' : 'Mostrar Datos de Auditoría'}
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '0' }}>
        
        {/* Formulario Crear */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
          <input 
            type="text" 
            placeholder="Ej: Efectivo" 
            className={styles.input} 
            value={newNombre} 
            onChange={(e) => setNewNombre(e.target.value)}
            style={{ flex: 1 }}
          />
          <button 
            className={`${styles.button} ${styles.buttonPrimary}`} 
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? '...' : '+ Agregar Método'}
          </button>
        </div>

        {/* Lista */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <th style={{ padding: '1rem' }}>Nombre del Método</th>
                {showAudit && <th style={{ padding: '1rem' }}>Auditoría</th>}
                <th style={{ padding: '1rem', width: '150px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {methods.map((m: any) => (
                <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s', ...({ ':hover': { background: 'rgba(255,255,255,0.02)' } } as any) }}>
                  
                  <td style={{ padding: '1.25rem 1rem', fontWeight: 500 }}>
                    {editingId === m.id ? (
                      <input 
                        type="text" 
                        value={editNombre} 
                        onChange={(e) => setEditNombre(e.target.value)} 
                        className={styles.input}
                        style={{ width: '100%' }}
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>💵</span> {m.nombre}
                      </div>
                    )}
                  </td>
                  
                  {showAudit && (
                    <td style={{ padding: '1.25rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <div>C: {new Date(m.createdAt).toLocaleString('es-CO')}</div>
                      {m.createdBy && <div>por: <strong style={{color:'var(--accent-secondary)'}}>{getAdminName(m.createdBy)}</strong></div>}
                      <hr style={{margin: '0.2rem 0', borderColor: 'var(--glass-border)'}}/>
                      <div>M: {new Date(m.updatedAt).toLocaleString('es-CO')}</div>
                      {m.updatedBy && <div>por: <strong style={{color:'var(--accent-secondary)'}}>{getAdminName(m.updatedBy)}</strong></div>}
                    </td>
                  )}
                  
                  <td style={{ padding: '1.25rem 1rem', display: 'flex', gap: '0.5rem' }}>
                    {editingId === m.id ? (
                      <>
                        <button className={`${styles.button} ${styles.buttonPrimary}`} onClick={() => handleUpdate(m.id)} disabled={loading} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Guardar</button>
                        <button className={styles.buttonOutline} onClick={() => setEditingId(null)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button 
                          className={styles.buttonOutline} 
                          onClick={() => { setEditingId(m.id); setEditNombre(m.nombre); }}
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', borderColor: 'var(--accent-secondary)', color: 'var(--accent-secondary)' }}
                        >
                          Editar
                        </button>
                        <button 
                          className={styles.buttonOutline} 
                          onClick={() => handleDelete(m.id)}
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                          disabled={loading}
                        >
                          Borrar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {methods.length === 0 && (
                <tr>
                  <td colSpan={showAudit ? 3 : 2} style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No hay métodos de pago registrados.
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
