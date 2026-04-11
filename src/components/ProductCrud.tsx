'use client'

import { useState } from 'react'
import styles from '@/app/page.module.css'
import { updateProduct, deleteProduct, createProductAdmin } from '@/app/actions'
import type { Product } from '@prisma/client'
import type { AdminSummary } from '@/lib/types'
import { getErrorMessage } from '@/lib/errors'

export default function ProductCrud({ products, admins }: { products: Product[], admins?: AdminSummary[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNombre, setEditNombre] = useState('')
  const [editPrecio, setEditPrecio] = useState<number | ''>('')
  const [editPrecioMinimo, setEditPrecioMinimo] = useState<number | ''>('')

  const [isCreating, setIsCreating] = useState(false)
  const [newNombre, setNewNombre] = useState('')
  const [newPrecio, setNewPrecio] = useState<number | ''>('')
  const [newPrecioMinimo, setNewPrecioMinimo] = useState<number | ''>('')
  
  const [showAudit, setShowAudit] = useState(false)

  const getAdminName = (id: string | null) => {
    if (!id) return '';
    return admins?.find(a => a.id === id)?.nombre || id.substring(0,6) + '...';
  };

  const handleCreate = async () => {
    if (!newNombre) return;
    try {
      await createProductAdmin({ nombre: newNombre, precio: newPrecio || 0, precio_minimo: newPrecioMinimo || 0 })
      setNewNombre('')
      setNewPrecio('')
      setNewPrecioMinimo('')
      setIsCreating(false)
    } catch (e: unknown) {
      console.error("Error:", getErrorMessage(e))
    }
  }

  const startEdit = (product: Product) => {
    setEditingId(product.id)
    setEditNombre(product.nombre)
    setEditPrecio(product.precio || 0)
    setEditPrecioMinimo(product.precio_minimo || 0)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      await updateProduct(editingId, { nombre: editNombre, precio: editPrecio || 0, precio_minimo: editPrecioMinimo || 0 })
      setEditingId(null)
    } catch (e: unknown) {
      console.error("Error al actualizar:", getErrorMessage(e))
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar permanentemente ${name} de la base de datos?`)) {
      try {
        await deleteProduct(id)
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
        <button onClick={() => setIsCreating(true)} className={`${styles.button}`} style={{ backgroundColor: 'var(--accent-secondary)', color: '#000', fontWeight: 'bold' }}>
          + Nuevo Producto
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--accent-secondary)', background: 'rgba(0,0,0,0.2)' }}>
              <th style={{ padding: '1.25rem 1rem' }}>Código (ID)</th>
              <th style={{ padding: '1.25rem 1rem' }}>Nombre del Producto</th>
              <th style={{ padding: '1.25rem 1rem' }}>Precio Base ($)</th>
              <th style={{ padding: '1.25rem 1rem' }}>Precio Min ($)</th>
              {showAudit && <th style={{ padding: '1.25rem 1rem', fontSize: '0.85rem' }}>Auditoría</th>}
              <th style={{ padding: '1.25rem 1rem', width: '250px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isCreating && (
              <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(56, 189, 248, 0.1)' }}>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>Automático</td>
                <td style={{ padding: '0.75rem 0.5rem' }}><input className={styles.input} style={{width: '100%'}} placeholder="Nombre..." value={newNombre} onChange={e=>setNewNombre(e.target.value)} /></td>
                <td style={{ padding: '0.75rem 0.5rem' }}><input className={styles.input} style={{width: '100%'}} type="number" min="0" step="0.01" placeholder="0.00" value={newPrecio} onChange={e=>setNewPrecio(parseFloat(e.target.value) || '')} /></td>
                <td style={{ padding: '0.75rem 0.5rem' }}><input className={styles.input} style={{width: '100%'}} type="number" min="0" step="0.01" placeholder="0.00" value={newPrecioMinimo} onChange={e=>setNewPrecioMinimo(parseFloat(e.target.value) || '')} /></td>
                {showAudit && <td></td>}
                <td style={{ padding: '0.75rem 0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                   <button onClick={handleCreate} className={`${styles.button}`} style={{ padding: '0.5rem 1rem', flex: 1, backgroundColor: 'var(--accent-secondary)', color: '#000' }}>Guardar</button>
                   <button onClick={() => setIsCreating(false)} className={styles.buttonOutline} style={{ padding: '0.5rem 1rem', flex: 1 }}>Cancelar</button>
                </td>
              </tr>
            )}
            {products.map(p => {
               const isEditing = editingId === p.id;
               return (
                 <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                   {isEditing ? (
                     <>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{p.id.substring(0,8)}...</td>
                        <td style={{ padding: '0.75rem 0.5rem' }}><input className={styles.input} style={{width: '100%'}} value={editNombre} onChange={e=>setEditNombre(e.target.value)} /></td>
                        <td style={{ padding: '0.75rem 0.5rem' }}><input className={styles.input} style={{width: '100%'}} type="number" min="0" step="0.01" value={editPrecio} onChange={e=>setEditPrecio(parseFloat(e.target.value) || '')} /></td>
                        <td style={{ padding: '0.75rem 0.5rem' }}><input className={styles.input} style={{width: '100%'}} type="number" min="0" step="0.01" value={editPrecioMinimo} onChange={e=>setEditPrecioMinimo(parseFloat(e.target.value) || '')} /></td>
                        {showAudit && <td></td>}
                        <td style={{ padding: '0.75rem 0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                           <button onClick={handleUpdate} className={`${styles.button} ${styles.buttonPrimary}`} style={{ padding: '0.5rem 1rem', flex: 1, backgroundColor: 'var(--accent-secondary)', color: '#000' }}>Guardar</button>
                           <button onClick={cancelEdit} className={styles.buttonOutline} style={{ padding: '0.5rem 1rem', flex: 1 }}>Cancelar</button>
                        </td>
                     </>
                   ) : (
                     <>
                        <td style={{ padding: '1.25rem 1rem', color: 'var(--text-secondary)' }}>{p.id.substring(0,8)}...</td>
                        <td style={{ padding: '1.25rem 1rem', fontWeight: 600 }}>{p.nombre}</td>
                        <td style={{ padding: '1.25rem 1rem', fontWeight: 600 }}>${p.precio?.toFixed(2) || '0.00'}</td>
                        <td style={{ padding: '1.25rem 1rem', fontWeight: 600 }}>${p.precio_minimo?.toFixed(2) || '0.00'}</td>
                        {showAudit && (
                          <td style={{ padding: '1.25rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            <div>C: {new Date(p.createdAt).toLocaleString('es-CO')}</div>
                            {p.createdBy && <div>por: <strong style={{color:'var(--accent-secondary)'}}>{getAdminName(p.createdBy)}</strong></div>}
                            <hr style={{margin: '0.2rem 0', borderColor: 'var(--glass-border)'}}/>
                            <div>M: {new Date(p.updatedAt).toLocaleString('es-CO')}</div>
                            {p.updatedBy && <div>por: <strong style={{color:'var(--accent-secondary)'}}>{getAdminName(p.updatedBy)}</strong></div>}
                          </td>
                        )}
                        <td style={{ padding: '1.25rem 1rem', display: 'flex', gap: '0.5rem' }}>
                           <button onClick={() => startEdit(p)} className={styles.buttonOutline} style={{ padding: '0.5rem 1rem', background: 'transparent', borderColor: 'var(--accent-secondary)', color: 'var(--accent-secondary)' }}>Editar</button>
                           <button onClick={() => handleDelete(p.id, p.nombre)} className={`${styles.button} ${styles.buttonDanger}`} style={{ padding: '0.5rem 1rem' }}>Borrar</button>
                        </td>
                     </>
                   )}
                 </tr>
               )
            })}
          </tbody>
        </table>
      </div>
      {!isCreating && products.length === 0 && (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>No hay productos registrados en la base de datos.</p>
        </div>
      )}
      </div>
    </div>
  )
}
