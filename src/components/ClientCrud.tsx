'use client'

import { useState } from 'react'
import styles from '@/app/page.module.css'
import { updateClient, deleteClient, createClientAdmin } from '@/app/actions'
import type { Client } from '@prisma/client'
import type { AdminSummary } from '@/lib/types'
import { getErrorMessage } from '@/lib/errors'

export default function ClientCrud({ clients, admins }: { clients: Client[], admins?: AdminSummary[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // States for editing
  const [editCedula, setEditCedula] = useState('')
  const [editNombre, setEditNombre] = useState('')
  const [editTelefono, setEditTelefono] = useState('')
  const [editCorreo, setEditCorreo] = useState('')

  const [isCreating, setIsCreating] = useState(false)
  const [newCedula, setNewCedula] = useState('')
  const [newNombre, setNewNombre] = useState('')
  const [newTelefono, setNewTelefono] = useState('')
  const [newCorreo, setNewCorreo] = useState('')
  
  const [showAudit, setShowAudit] = useState(false)

  const getAdminName = (id: string | null) => {
    if (!id) return '';
    return admins?.find(a => a.id === id)?.nombre || id.substring(0,6) + '...';
  };

  const handleCreate = async () => {
    if (!newCedula) return;
    try {
      await createClientAdmin({ 
        cedula: newCedula, nombre: newNombre, telefono: newTelefono, correo: newCorreo 
      })
      setNewCedula('')
      setNewNombre('')
      setNewTelefono('')
      setNewCorreo('')
      setIsCreating(false)
    } catch (e: unknown) {
      console.error("Error:", getErrorMessage(e))
    }
  }

  const startEdit = (client: Client) => {
    setEditingId(client.id)
    setEditCedula(client.cedula)
    setEditNombre(client.nombre || '')
    setEditTelefono(client.telefono || '')
    setEditCorreo(client.correo || '')
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      await updateClient(editingId, { 
        cedula: editCedula, 
        nombre: editNombre, 
        telefono: editTelefono, 
        correo: editCorreo 
      })
      setEditingId(null)
    } catch (e: unknown) {
      console.error("Error al actualizar:", getErrorMessage(e))
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Estás súper seguro de que deseas ELIMINAR permanentemente a ${name || 'este cliente'}?\n\nLa información se borrará de la lista de clientes, pero sus facturas previas no perderán sus datos de nombre y cédula.`)) {
      try {
        await deleteClient(id)
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
        <button onClick={() => setIsCreating(true)} className={`${styles.button} ${styles.buttonPrimary}`} style={{ fontWeight: 'bold' }}>
          + Nuevo Cliente
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--accent-primary)', background: 'rgba(0,0,0,0.2)' }}>
              <th style={{ padding: '1.25rem 1rem' }}>Cédula / NIT</th>
              <th style={{ padding: '1.25rem 1rem' }}>Nombre Completo</th>
              <th style={{ padding: '1.25rem 1rem' }}>Teléfono</th>
              <th style={{ padding: '1.25rem 1rem' }}>Correo</th>
              {showAudit && <th style={{ padding: '1.25rem 1rem', fontSize: '0.85rem' }}>Auditoría</th>}
              <th style={{ padding: '1.25rem 1rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isCreating && (
              <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255, 255, 255, 0.05)' }}>
                <td style={{ padding: '0.75rem 0.5rem' }}><input className={styles.input} style={{width: '100%'}} placeholder="Cédula/NIT..." value={newCedula} onChange={e=>setNewCedula(e.target.value)} /></td>
                <td style={{ padding: '0.75rem 0.5rem' }}><input className={styles.input} style={{width: '100%'}} placeholder="Nombre..." value={newNombre} onChange={e=>setNewNombre(e.target.value)} /></td>
                <td style={{ padding: '0.75rem 0.5rem' }}><input className={styles.input} style={{width: '100%'}} placeholder="Teléfono..." value={newTelefono} onChange={e=>setNewTelefono(e.target.value)} /></td>
                <td style={{ padding: '0.75rem 0.5rem' }}><input className={styles.input} style={{width: '100%'}} placeholder="Correo..." value={newCorreo} onChange={e=>setNewCorreo(e.target.value)} /></td>
                {showAudit && <td></td>}
                <td style={{ padding: '0.75rem 0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                   <button onClick={handleCreate} className={`${styles.button} ${styles.buttonPrimary}`} style={{ padding: '0.5rem 1rem', flex: 1 }}>Guardar</button>
                   <button onClick={() => setIsCreating(false)} className={styles.buttonOutline} style={{ padding: '0.5rem 1rem', flex: 1 }}>Cancelar</button>
                </td>
              </tr>
            )}
            {clients.map(c => {
               const isEditing = editingId === c.id;
               return (
                 <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                   {isEditing ? (
                     <>
                        <td style={{ padding: '0.75rem 0.5rem' }}><input className={styles.input} style={{width: '100%'}} value={editCedula} onChange={e=>setEditCedula(e.target.value)} /></td>
                        <td style={{ padding: '0.75rem 0.5rem' }}><input className={styles.input} style={{width: '100%'}} value={editNombre} onChange={e=>setEditNombre(e.target.value)} /></td>
                        <td style={{ padding: '0.75rem 0.5rem' }}><input className={styles.input} style={{width: '100%'}} value={editTelefono} onChange={e=>setEditTelefono(e.target.value)} /></td>
                        <td style={{ padding: '0.75rem 0.5rem' }}><input className={styles.input} style={{width: '100%'}} value={editCorreo} onChange={e=>setEditCorreo(e.target.value)} /></td>
                        {showAudit && <td></td>}
                        <td style={{ padding: '0.75rem 0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                           <button onClick={handleUpdate} className={`${styles.button} ${styles.buttonPrimary}`} style={{ padding: '0.5rem 1rem', flex: 1 }}>Guardar</button>
                           <button onClick={cancelEdit} className={styles.buttonOutline} style={{ padding: '0.5rem 1rem', flex: 1 }}>Cancelar</button>
                        </td>
                     </>
                   ) : (
                     <>
                        <td style={{ padding: '1.25rem 1rem', fontWeight: 600 }}>{c.cedula}</td>
                        <td style={{ padding: '1.25rem 1rem', color: 'var(--text-secondary)' }}>{c.nombre || '-'}</td>
                        <td style={{ padding: '1.25rem 1rem', color: 'var(--text-secondary)' }}>{c.telefono || '-'}</td>
                        <td style={{ padding: '1.25rem 1rem', color: 'var(--text-secondary)' }}>{c.correo || '-'}</td>
                        {showAudit && (
                          <td style={{ padding: '1.25rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            <div>C: {new Date(c.createdAt).toLocaleString('es-CO')}</div>
                            {c.createdBy && <div>por: <strong style={{color:'var(--accent-primary)'}}>{getAdminName(c.createdBy)}</strong></div>}
                            <hr style={{margin: '0.2rem 0', borderColor: 'var(--glass-border)'}}/>
                            <div>M: {new Date(c.updatedAt).toLocaleString('es-CO')}</div>
                            {c.updatedBy && <div>por: <strong style={{color:'var(--accent-primary)'}}>{getAdminName(c.updatedBy)}</strong></div>}
                          </td>
                        )}
                        <td style={{ padding: '1.25rem 1rem', display: 'flex', gap: '0.5rem' }}>
                           <button onClick={() => startEdit(c)} className={styles.buttonOutline} style={{ padding: '0.5rem 1rem', background: 'transparent', borderColor: 'var(--accent-secondary)', color: 'var(--accent-secondary)' }}>Editar</button>
                           <button onClick={() => handleDelete(c.id, c.nombre || 'este cliente')} className={`${styles.button} ${styles.buttonDanger}`} style={{ padding: '0.5rem 1rem' }}>Borrar</button>
                        </td>
                     </>
                   )}
                 </tr>
               )
            })}
          </tbody>
        </table>
      </div>
      {!isCreating && clients.length === 0 && (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>No hay clientes registrados en la base de datos.</p>
        </div>
      )}
      </div>
    </div>
  )
}
