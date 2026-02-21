import React, { useState } from 'react'
import { COLOR, Checkbox, IconBtn, FAB, BottomNav, ModalSheet, FormField, Input, SubmitBtn } from './components'

export default function PlaceScreen({ place, items, places, onBack, onNavigate, onToggleItem, onDeleteItem, onClearDone, onUpdateNote, onAddItem }) {
  const [editNote, setEditNote] = useState(false)
  const [noteText, setNoteText] = useState(place?.note || '')
  const [showAdd, setShowAdd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(null) // item id to delete

  // item form
  const [itemName, setItemName] = useState('')
  const [qty, setQty] = useState('')
  const [unit, setUnit] = useState('')
  const [selectedPlaces, setSelectedPlaces] = useState([place?.id])
  const [itemNote, setItemNote] = useState('')

  if (!place) return null

  const placeItems = items.filter(i => i.place_ids.includes(place.id))
  const pending = placeItems.filter(i => !i.done)
  const done = placeItems.filter(i => i.done)
  const col = COLOR[place.color] || COLOR.blue

  function otherPlaceNames(item) {
    return item.place_ids
      .filter(id => id !== place.id)
      .map(id => places.find(p => p.id === id))
      .filter(Boolean)
  }

  async function saveNote() {
    await onUpdateNote(place.id, noteText)
    setEditNote(false)
  }

  async function handleAddItem() {
    if (!itemName.trim() || selectedPlaces.length === 0) return
    await onAddItem({ name: itemName.trim(), qty, unit, place_ids: selectedPlaces, note: itemNote })
    setItemName(''); setQty(''); setUnit(''); setItemNote(''); setSelectedPlaces([place.id])
    setShowAdd(false)
  }

  function togglePlace(id) {
    setSelectedPlaces(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', padding: '6px 14px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <IconBtn onClick={onBack}>←</IconBtn>
          <h1 style={{ fontFamily: 'Lora, serif', fontSize: 18, fontWeight: 500, flex: 1, color: 'var(--black)' }}>
            {place.emoji} {place.name}
          </h1>
          <IconBtn onClick={() => { setNoteText(place.note || ''); setEditNote(true) }} title="Editar notas">📝</IconBtn>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 16px 96px' }}>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: 6, color: col.text, background: col.soft }}>
            {pending.length} pendiente{pending.length !== 1 ? 's' : ''}
          </span>
          {done.length > 0 && (
            <span style={{ fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: 6, color: 'var(--gray4)', background: 'var(--gray1)' }}>
              {done.length} comprado{done.length !== 1 ? 's' : ''} hoy
            </span>
          )}
        </div>

        {/* Note block */}
        {place.note && (
          <div style={{
            background: 'var(--amber-soft)', borderRadius: 8, padding: '10px 12px',
            display: 'flex', gap: 8, marginBottom: 14, alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 14 }}>💡</span>
            <p style={{ fontSize: 12.5, color: '#8A5A28', lineHeight: 1.5, flex: 1 }}>{place.note}</p>
            <button onClick={() => { setNoteText(place.note || ''); setEditNote(true) }} style={{ fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}>✏️</button>
          </div>
        )}

        {/* No note prompt */}
        {!place.note && (
          <button
            onClick={() => { setNoteText(''); setEditNote(true) }}
            style={{
              width: '100%', padding: '8px 12px', marginBottom: 12,
              background: 'none', border: '1px dashed var(--gray2)', borderRadius: 8,
              fontSize: 12.5, fontWeight: 500, color: 'var(--gray3)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
              transition: 'border-color 0.12s, color 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gray3)'; e.currentTarget.style.color = 'var(--gray4)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray2)'; e.currentTarget.style.color = 'var(--gray3)' }}
          >
            <span>💡</span> Agregar nota para este lugar
          </button>
        )}

        {/* List */}
        {(pending.length > 0 || done.length > 0) ? (
          <div style={{ background: 'var(--white)', borderRadius: 12, border: '1px solid var(--border)', padding: '4px 14px', marginBottom: 8 }}>

            {pending.length > 0 && (
              <>
                <p style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gray3)', padding: '10px 0 6px' }}>
                  Pendientes
                </p>
                {pending.map(item => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    otherPlaces={otherPlaceNames(item)}
                    onToggle={() => onToggleItem(item.id)}
                    onDelete={() => setShowConfirm(item.id)}
                  />
                ))}
              </>
            )}

            {done.length > 0 && (
              <>
                <p style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gray3)', padding: '10px 0 6px' }}>
                  Comprados
                </p>
                {done.map(item => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    otherPlaces={otherPlaceNames(item)}
                    onToggle={() => onToggleItem(item.id)}
                    onDelete={() => setShowConfirm(item.id)}
                  />
                ))}
                <button
                  onClick={() => onClearDone(place.id)}
                  style={{
                    width: '100%', padding: '10px', background: 'none',
                    border: '1px dashed var(--gray2)', borderRadius: 8,
                    fontSize: 12, fontWeight: 500, color: 'var(--gray3)', cursor: 'pointer',
                    margin: '8px 0 4px', transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gray3)'; e.currentTarget.style.color = 'var(--gray4)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray2)'; e.currentTarget.style.color = 'var(--gray3)' }}
                >
                  Limpiar comprados
                </button>
              </>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--gray3)' }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>✨</div>
            <p style={{ fontFamily: 'Lora, serif', fontSize: 15, fontWeight: 500, marginBottom: 4 }}>Sin ítems pendientes</p>
            <p style={{ fontSize: 13 }}>Tocá + para agregar algo</p>
          </div>
        )}
      </div>

      <FAB onClick={() => { setSelectedPlaces([place.id]); setShowAdd(true) }} />
      <BottomNav screen="place" onNavigate={onNavigate} />

      {/* Edit note modal */}
      <ModalSheet open={editNote} onClose={() => setEditNote(false)}>
        <h2 style={{ fontFamily: 'Lora, serif', fontSize: 18, fontWeight: 500, marginBottom: 18 }}>Notas de {place.name}</h2>
        <textarea
          value={noteText}
          onChange={e => setNoteText(e.target.value)}
          placeholder="ej. Los martes hay descuento con Modo..."
          rows={5}
          style={{
            width: '100%', background: 'var(--gray1)', border: '1px solid transparent',
            borderRadius: 8, padding: '10px 12px', fontSize: 14, color: 'var(--black)',
            resize: 'vertical', outline: 'none', fontFamily: 'DM Sans, sans-serif',
            lineHeight: 1.5,
          }}
          onFocus={e => { e.target.style.background = 'var(--white)'; e.target.style.borderColor = 'rgba(26,26,26,0.15)' }}
          onBlur={e => { e.target.style.background = 'var(--gray1)'; e.target.style.borderColor = 'transparent' }}
        />
        <SubmitBtn onClick={saveNote}>Guardar nota</SubmitBtn>
      </ModalSheet>

      {/* Add item modal */}
      <ModalSheet open={showAdd} onClose={() => setShowAdd(false)}>
        <h2 style={{ fontFamily: 'Lora, serif', fontSize: 18, fontWeight: 500, marginBottom: 18 }}>Agregar ítem</h2>

        <FormField label="Nombre">
          <Input value={itemName} onChange={setItemName} placeholder="ej. Huevos, Detergente..." />
        </FormField>

        <FormField label="Cantidad">
          <div style={{ display: 'flex', gap: 8 }}>
            <Input value={qty} onChange={setQty} placeholder="cantidad" style={{ flex: 2 }} />
            <Input value={unit} onChange={setUnit} placeholder="unidad" style={{ flex: 1 }} />
          </div>
        </FormField>

        <FormField label="Dónde comprarlo">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {places.map(p => (
              <button
                key={p.id}
                onClick={() => togglePlace(p.id)}
                style={{
                  padding: '6px 12px',
                  background: selectedPlaces.includes(p.id) ? 'var(--black)' : 'var(--gray1)',
                  border: '1px solid transparent',
                  borderRadius: 7, fontSize: 13, fontWeight: selectedPlaces.includes(p.id) ? 500 : 400,
                  color: selectedPlaces.includes(p.id) ? 'white' : 'var(--gray4)',
                  cursor: 'pointer', transition: 'all 0.12s',
                }}
              >
                {p.emoji} {p.name}
              </button>
            ))}
          </div>
        </FormField>

        <FormField label="Nota (opcional)">
          <Input value={itemNote} onChange={setItemNote} placeholder="ej. sin sal, marca específica..." />
        </FormField>

        <SubmitBtn onClick={handleAddItem} disabled={!itemName.trim() || selectedPlaces.length === 0}>
          Agregar
        </SubmitBtn>
      </ModalSheet>

      {/* Delete confirm */}
      <ModalSheet open={!!showConfirm} onClose={() => setShowConfirm(null)}>
        <h2 style={{ fontFamily: 'Lora, serif', fontSize: 18, fontWeight: 500, marginBottom: 8 }}>Eliminar ítem</h2>
        <p style={{ fontSize: 14, color: 'var(--gray4)', marginBottom: 20 }}>
          ¿Eliminás "{items.find(i => i.id === showConfirm)?.name}"?
          {items.find(i => i.id === showConfirm)?.place_ids.length > 1 && ' Se eliminará de todos los lugares.'}
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowConfirm(null)}
            style={{ flex: 1, padding: 12, background: 'var(--gray1)', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button
            onClick={() => { onDeleteItem(showConfirm); setShowConfirm(null) }}
            style={{ flex: 1, padding: 12, background: 'var(--red)', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, color: 'white', cursor: 'pointer' }}
          >
            Eliminar
          </button>
        </div>
      </ModalSheet>
    </div>
  )
}

function ItemRow({ item, otherPlaces, onToggle, onDelete }) {
  const [pressed, setPressed] = useState(false)

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 11,
        padding: '9px 0', borderBottom: '1px solid var(--border)',
        opacity: item.done ? 0.6 : 1,
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={e => setPressed(true)}
      onMouseLeave={e => setPressed(false)}
    >
      <Checkbox checked={item.done} onChange={onToggle} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 400, textDecoration: item.done ? 'line-through' : 'none', color: item.done ? 'var(--gray3)' : 'var(--black)' }}>
          {item.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
          {(item.qty || item.unit) && (
            <span style={{ fontSize: 11.5, color: 'var(--gray3)' }}>
              {[item.qty, item.unit].filter(Boolean).join(' ')}
            </span>
          )}
          {otherPlaces.map(p => (
            <span key={p.id} style={{ fontSize: 10.5, fontWeight: 500, color: 'var(--accent)', background: 'var(--accent-soft)', borderRadius: 4, padding: '1px 5px' }}>
              {p.emoji} {p.name}
            </span>
          ))}
          {item.note && <span style={{ fontSize: 11, color: 'var(--gray3)', fontStyle: 'italic' }}>— {item.note}</span>}
          {item.done && item.done_by && (
            <span style={{ fontSize: 11, color: 'var(--gray3)' }}>{item.done_by}</span>
          )}
        </div>
      </div>
      {item.qty && !item.done && <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray3)' }}>{item.qty}{item.unit ? ` ${item.unit}` : ''}</span>}
      {pressed && (
        <button
          onClick={e => { e.stopPropagation(); onDelete() }}
          style={{ fontSize: 13, color: 'var(--red)', background: 'var(--red-soft)', border: 'none', borderRadius: 6, padding: '3px 7px', cursor: 'pointer' }}
        >
          🗑️
        </button>
      )}
    </div>
  )
}
