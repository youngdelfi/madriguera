import React, { useState } from 'react'
import { COLOR, IconBtn, FAB, BottomNav, ModalSheet, FormField, Input, SubmitBtn } from './components'

const COLORS = ['blue', 'green', 'amber', 'gray', 'red']
const DEFAULT_EMOJIS = ['🛒', '🥦', '🏮', '📦', '🧴', '🍞', '💊', '🐾', '📚', '🧹']

export default function HomeScreen({ places, items, onNavigate, onSelectPlace, onAddPlace }) {
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🛒')
  const [color, setColor] = useState('blue')

  function pendingCount(placeId) {
    return items.filter(i => i.place_ids.includes(placeId) && !i.done).length
  }

  function previewItems(placeId) {
    return items.filter(i => i.place_ids.includes(placeId)).slice(0, 4)
  }

  function otherPlaces(item, currentPlaceId, allPlaces) {
    return item.place_ids.filter(id => id !== currentPlaceId).map(id => allPlaces.find(p => p.id === id)?.name).filter(Boolean)
  }

  async function handleAddPlace() {
    if (!name.trim()) return
    await onAddPlace({ name: name.trim(), emoji, color })
    setName(''); setEmoji('🛒'); setColor('blue')
    setShowAdd(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>

      {/* Header */}
      <div style={{ padding: '14px 18px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14 }}>
          <h1 style={{ fontFamily: 'Lora, serif', fontSize: 22, fontWeight: 500, letterSpacing: '-0.3px', color: 'var(--black)' }}>
            Madriguera <span style={{ fontSize: 18 }}>🐇</span>
          </h1>
          <div style={{ display: 'flex', gap: 6 }}>
            <IconBtn onClick={() => setShowAdd(true)} title="Nuevo lugar">＋</IconBtn>
            <IconBtn onClick={() => onNavigate('activity')} title="Actividad">📋</IconBtn>
          </div>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 96px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gray3)' }}>Lugares</span>
          <button onClick={() => setShowAdd(true)} style={{ fontSize: 12, fontWeight: 500, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>+ Nuevo</button>
        </div>

        {places.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--gray3)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🐇</div>
            <p style={{ fontFamily: 'Lora, serif', fontSize: 16, fontWeight: 500, marginBottom: 6 }}>La madriguera está vacía</p>
            <p style={{ fontSize: 13 }}>Agregá tu primer lugar para empezar</p>
          </div>
        )}

        {places.map(place => {
          const count = pendingCount(place.id)
          const preview = previewItems(place.id)
          const col = COLOR[place.color] || COLOR.blue

          return (
            <div
              key={place.id}
              onClick={() => onSelectPlace(place.id)}
              style={{
                background: 'var(--white)',
                borderRadius: 12,
                border: '1px solid var(--border)',
                padding: '13px 14px 12px',
                marginBottom: 8,
                cursor: 'pointer',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: preview.length ? 10 : 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.dot, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Lora, serif', fontSize: 15, fontWeight: 500, color: 'var(--black)' }}>
                    {place.emoji} {place.name}
                  </div>
                </div>
                {count > 0 ? (
                  <span style={{ fontSize: 12, fontWeight: 600, color: col.text, background: col.soft, borderRadius: 5, padding: '2px 8px' }}>{count}</span>
                ) : (
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray3)', background: 'var(--gray1)', borderRadius: 5, padding: '2px 8px' }}>0</span>
                )}
              </div>

              {/* Item preview */}
              {preview.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {preview.map(item => {
                    const others = otherPlaces(item, place.id, places)
                    return (
                      <span key={item.id} style={{
                        fontSize: 12, fontWeight: 400, color: item.done ? 'var(--gray3)' : 'var(--gray4)',
                        background: 'var(--gray1)', borderRadius: 5, padding: '3px 8px',
                        textDecoration: item.done ? 'line-through' : 'none',
                        display: 'flex', alignItems: 'center', gap: 3,
                      }}>
                        {item.name}
                        {others.length > 0 && !item.done && (
                          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--accent)', background: 'var(--accent-soft)', borderRadius: 3, padding: '0 4px' }}>
                            +{others.length}
                          </span>
                        )}
                      </span>
                    )
                  })}
                  {items.filter(i => i.place_ids.includes(place.id)).length > 4 && (
                    <span style={{ fontSize: 11.5, color: 'var(--gray3)', alignSelf: 'center', padding: '3px 4px' }}>
                      +{items.filter(i => i.place_ids.includes(place.id)).length - 4} más
                    </span>
                  )}
                </div>
              )}

              {preview.length === 0 && (
                <p style={{ fontSize: 12, color: 'var(--gray3)', fontStyle: 'italic', marginTop: 2 }}>Sin ítems pendientes ✨</p>
              )}
            </div>
          )
        })}
      </div>

      <FAB onClick={() => onNavigate('add')} />
      <BottomNav screen="home" onNavigate={onNavigate} />

      {/* Add Place Modal */}
      <ModalSheet open={showAdd} onClose={() => setShowAdd(false)}>
        <h2 style={{ fontFamily: 'Lora, serif', fontSize: 18, fontWeight: 500, marginBottom: 18 }}>Nuevo lugar</h2>

        <FormField label="Nombre del lugar">
          <Input value={name} onChange={setName} placeholder="ej. Carrefour, Farmacity..." />
        </FormField>

        <FormField label="Emoji">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {DEFAULT_EMOJIS.map(e => (
              <button key={e} onClick={() => setEmoji(e)} style={{
                width: 36, height: 36, fontSize: 18, borderRadius: 8,
                border: `1.5px solid ${emoji === e ? 'var(--black)' : 'transparent'}`,
                background: emoji === e ? 'var(--gray1)' : 'none',
                cursor: 'pointer',
              }}>{e}</button>
            ))}
          </div>
        </FormField>

        <FormField label="Color">
          <div style={{ display: 'flex', gap: 8 }}>
            {COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)} style={{
                width: 28, height: 28, borderRadius: '50%',
                background: COLOR[c].dot, border: `2.5px solid ${color === c ? 'var(--black)' : 'transparent'}`,
                cursor: 'pointer', transition: 'border-color 0.12s',
              }} />
            ))}
          </div>
        </FormField>

        <SubmitBtn onClick={handleAddPlace} disabled={!name.trim()}>Agregar lugar</SubmitBtn>
      </ModalSheet>
    </div>
  )
}
