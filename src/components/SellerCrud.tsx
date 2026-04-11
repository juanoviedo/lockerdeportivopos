'use client'

import { useState } from 'react'
import styles from '@/app/page.module.css'
import { updateSeller, deleteSeller, createSellerAdmin } from '@/app/actions'
import type { Seller } from '@prisma/client'
import type { AdminSummary } from '@/lib/types'
import { getErrorMessage } from '@/lib/errors'

export default function SellerCrud({ sellers, admins }: { sellers: Seller[], admins?: AdminSummary[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNombre, setEditNombre] = useState('')

  const [isCreating, setIsCreating] = useState(false)
  const [newNombre, setNewNombre] = useState('')
  const [showAudit, setShowAudit] = useState(false)

  const getAdminName = (id: string | null) => {
    if (!id) return '';
    return admins?.find(a => a.id === id)?.nombre || id.substring(0,6) + '...';
  };

  const handleCreate = async () => {
    if (!newNombre) return;
    try {
      await createSellerAdmin({ nombre: newNombre })
      setNewNombre('')
      setIsCreating(false)
    } catch (e: unknown) {
      console.error("Error:", getErrorMessage(e))
    }
  }

  const startEdit = (seller: Seller) => {
    setEditingId(seller.id)
    setEditNombre(seller.nombre)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      await updateSeller(editingId, { nombre: editNombre })
      setEditingId(null)
    } catch (e: unknown) {
      console.error("Error al actualizar:", getErrorMessage(e))
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar permanentemente a ${name}?\n\nSu nombre permanecerá escrito en las facturas de hace tiempo, pero ya no aparecerá en el buscador.`)) {
      try {
        await deleteSeller(id)
      } catch (e: unknown) {
        alert("No se pudo eliminar: " + getErrorMessage(e))
      }
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <input type="checkbox" checked={showAudit} onChange={(e) => setShowAudit(e.target.checked)} />
          Mostrar Datos de Auditoría
        </label>
        <button onClick={() => setIsCreating(true)} className={`${styles.button}`} style={{ backgroundColor: '#ffb86c', color: '#000', fontWeight: 'bold' }}>
          + Nuevo Vendedor
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', color: '#ffb86c', background: 'rgba(0,0,0,0.2)' }}>
              <th style={{ padding: '1.25rem 1rem' }}>ID de Empleado</th>
              <th style={{ padding: '1.25rem 1rem' }}>Nombre del Vendedor</th>
              {showAudit && <th style={{ padding: '1.25rem 1rem', fontSize: '0.85rem' }}>Auditoría</th>}
              <th style={{ padding: '1.25rem 1rem', width: '250px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isCreating && (
              <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255, 184, 108, 0.1)' }}>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>Automático</td>
                <td style={{ padding: '0.75rem 0.5rem' }}><input className={styles.input} style={{width: '100%'}} placeholder="Nombre..." value={newNombre} onChange={e=>setNewNombre(e.target.value)} /></td>
                {showAudit && <td></td>}
                <td style={{ padding: '0.75rem 0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                   <button onClick={handleCreate} className={`${styles.button}`} style={{ padding: '0.5rem 1rem', flex: 1, backgroundColor: '#ffb86c', color: '#000' }}>Guardar</button>
                   <button onClick={() => setIsCreating(false)} className={styles.buttonOutline} style={{ padding: '0.5rem 1rem', flex: 1 }}>Cancelar</button>
                </td>
              </tr>
            )}
            {sellers.map(s => {
               const isEditing = editingId === s.id;
               return (
                 <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                   {isEditing ? (
                     <>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{s.id.substring(0,8)}...</td>
                        <td style={{ padding: '0.75rem 0.5rem' }}><input className={styles.input} style={{width: '100%'}} value={editNombre} onChange={e=>setEditNombre(e.target.value)} /></td>
                        {showAudit && <td></td>}
                        <td style={{ padding: '0.75rem 0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                           <button onClick={handleUpdate} className={`${styles.button} ${styles.buttonPrimary}`} style={{ padding: '0.5rem 1rem', flex: 1, backgroundColor: '#ffb86c', color: '#000' }}>Guardar</button>
                           <button onClick={cancelEdit} className={styles.buttonOutline} style={{ padding: '0.5rem 1rem', flex: 1 }}>Cancelar</button>
                        </td>
                     </>
                   ) : (
                     <>
                        <td style={{ padding: '1.25rem 1rem', color: 'var(--text-secondary)' }}>{s.id.substring(0,8)}...</td>
                        <td style={{ padding: '1.25rem 1rem', fontWeight: 600 }}>{s.nombre}</td>
                        {showAudit && (
                          <td style={{ padding: '1.25rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            <div>C: {new Date(s.createdAt).toLocaleString('es-CO')}</div>
                            {s.createdBy && <div>por: <strong style={{color:'#ffb86c'}}>{getAdminName(s.createdBy)}</strong></div>}
                            <hr style={{margin: '0.2rem 0', borderColor: 'var(--glass-border)'}}/>
                            <div>M: {new Date(s.updatedAt).toLocaleString('es-CO')}</div>
                            {s.updatedBy && <div>por: <strong style={{color:'#ffb86c'}}>{getAdminName(s.updatedBy)}</strong></div>}
                          </td>
                        )}
                        <td style={{ padding: '1.25rem 1rem', display: 'flex', gap: '0.5rem' }}>
                           <button onClick={() => startEdit(s)} className={styles.buttonOutline} style={{ padding: '0.5rem 1rem', background: 'transparent', borderColor: '#ffb86c', color: '#ffb86c' }}>Editar</button>
                           <button onClick={() => handleDelete(s.id, s.nombre)} className={`${styles.button} ${styles.buttonDanger}`} style={{ padding: '0.5rem 1rem' }}>Borrar</button>
                        </td>
                     </>
                   )}
                 </tr>
               )
            })}
          </tbody>
        </table>
      </div>
      {!isCreating && sellers.length === 0 && (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>No hay vendedores registrados en la base de datos.</p>
        </div>
      )}
      </div>
    </div>
  )
}
