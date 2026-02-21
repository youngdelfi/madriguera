import React, { useState } from 'react'
import { COLOR, BottomNav, ModalSheet, FormField, Input, SubmitBtn } from './components'

export default function SettingsScreen({ places, onNavigate, onDeletePlace, onUpdatePlace }) {
  const [editingPlace, setEditingPlace] = useState(null)
  const [editName, setEditName] = useState('')
  const [editEmoji, setEditEmoji] = useState('')
  const [editColor, setEditColor] = useState('blue')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const COLORS = ['blue', 'green', 'amber', 'gray', 'red']
  const EMOJIS = ['🛒', '🥦', '🏮', '📦', '🧴', '🍞', '💊', '🐾', '📚', '🧹', '🌿', '🏪', '🍎', '🐟', '☕']

  function startEdit(place) {
    setEditingPlace(place)
    setEditName(place.name)
    setEditEmoji(place.emoji)
    setEditColor(place.color)
  }

  async function saveEdit() {
    if (!editName.trim()) return
    await onUpdatePlace(editingPlace.id, { name: editName.trim(), emoji: editEmoji, color: editColor })
    setEditingPlace(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <div style={{ padding: '14px 18px 0' }}>
        <h1 style={{ fontFamily: 'Lora, serif', fontSize: 22, fontWeight: 500, color: 'var(--black)', paddingBottom: 14 }}>Lugares</h1>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 96px' }}>
        {places.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--gray3)', textAlign: 'center', padding: '48px 0' }}>
            No hay lugares. Agregá uno desde el inicio.
          </p>
        )}

        {places.map(place => {
          const col = COLOR[place.color] || COLOR.blue
          return (
            <div key={place.id} style={{
              background: 'var(--white)', borderRadius: 12, border: '1px solid var(--border)',
              padding: '12px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.dot, flexShrink: 0 }} />
              <span style={{ fontSize: 18 }}>{place.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'Lora, serif', fontSize: 15, fontWeight: 500 }}>{place.name}</p>
              </div>
              <button onClick={() => startEdit(place)} style={{ fontSize: 13, color: 'var(--gray4)', background: 'var(--gray1)', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer' }}>
                Editar
              </button>
              <button onClick={() => setConfirmDelete(place)} style={{ fontSize: 13, color: 'var(--red)', background: 'var(--red-soft)', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer' }}>
                🗑️
              </button>
            </div>
          )
        })}
      </div>

      <BottomNav screen="settings" onNavigate={onNavigate} />

      {/* Edit modal */}
      <ModalSheet open={!!editingPlace} onClose={() => setEditingPlace(null)}>
        <h2 style={{ fontFamily: 'Lora, serif', fontSize: 18, fontWeight: 500, marginBottom: 18 }}>Editar lugar</h2>
        <FormField label="Nombre">
          <Input value={editName} onChange={setEditName} placeholder="Nombre del lugar" />
        </FormField>
        <FormField label="Emoji">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setEditEmoji(e)} style={{
                width: 36, height: 36, fontSize: 18, borderRadius: 8,
                border: `1.5px solid ${editEmoji === e ? 'var(--black)' : 'transparent'}`,
                background: editEmoji === e ? 'var(--gray1)' : 'none', cursor: 'pointer',
              }}>{e}</button>
            ))}
          </div>
        </FormField>
        <FormField label="Color">
          <div style={{ display: 'flex', gap: 8 }}>
            {COLORS.map(c => (
              <button key={c} onClick={() => setEditColor(c)} style={{
                width: 28, height: 28, borderRadius: '50%',
                background: COLOR[c].dot,
                border: `2.5px solid ${editColor === c ? 'var(--black)' : 'transparent'}`,
                cursor: 'pointer',
              }} />
            ))}
          </div>
        </FormField>
        <SubmitBtn onClick={saveEdit} disabled={!editName.trim()}>Guardar</SubmitBtn>
      </ModalSheet>

      {/* Delete confirm */}
      <ModalSheet open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <h2 style={{ fontFamily: 'Lora, serif', fontSize: 18, fontWeight: 500, marginBottom: 8 }}>Eliminar lugar</h2>
        <p style={{ fontSize: 14, color: 'var(--gray4)', marginBottom: 20 }}>
          ¿Eliminás "{confirmDelete?.name}"? También se eliminarán todos sus ítems.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: 12, background: 'var(--gray1)', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Cancelar</button>
          <button onClick={() => { onDeletePlace(confirmDelete.id); setConfirmDelete(null) }} style={{ flex: 1, padding: 12, background: 'var(--red)', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, color: 'white', cursor: 'pointer' }}>Eliminar</button>
        </div>
      </ModalSheet>
    </div>
  )
}
