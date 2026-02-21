import React, { useState } from 'react'
import { IconBtn, BottomNav, FormField, Input, SubmitBtn } from './components'

export default function AddItemScreen({ places, onNavigate, onAddItem }) {
  const [name, setName] = useState('')
  const [qty, setQty] = useState('')
  const [unit, setUnit] = useState('')
  const [selectedPlaces, setSelectedPlaces] = useState([])
  const [note, setNote] = useState('')
  const [success, setSuccess] = useState(false)

  function togglePlace(id) {
    setSelectedPlaces(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  async function handleAdd() {
    if (!name.trim() || selectedPlaces.length === 0) return
    await onAddItem({ name: name.trim(), qty, unit, place_ids: selectedPlaces, note })
    setSuccess(true)
    setTimeout(() => {
      setName(''); setQty(''); setUnit(''); setNote(''); setSelectedPlaces([]); setSuccess(false)
    }, 1000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>

      {/* Header */}
      <div style={{ padding: '14px 18px 0', borderBottom: '1px solid var(--border)', paddingBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <IconBtn onClick={() => onNavigate('home')}>←</IconBtn>
          <h1 style={{ fontFamily: 'Lora, serif', fontSize: 20, fontWeight: 500, color: 'var(--black)' }}>Agregar ítem</h1>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 18px 96px' }}>

        <FormField label="¿Qué necesitás?">
          <Input value={name} onChange={setName} placeholder="ej. Huevos, Detergente, Shampoo..." />
        </FormField>

        <FormField label="Cantidad">
          <div style={{ display: 'flex', gap: 8 }}>
            <Input value={qty} onChange={setQty} placeholder="cantidad" style={{ flex: 2 }} />
            <Input value={unit} onChange={setUnit} placeholder="unidad" style={{ flex: 1 }} />
          </div>
        </FormField>

        <FormField label="Dónde comprarlo">
          {places.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--gray3)', fontStyle: 'italic' }}>Agregá primero un lugar desde el inicio</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {places.map(p => (
                <button
                  key={p.id}
                  onClick={() => togglePlace(p.id)}
                  style={{
                    padding: '7px 13px',
                    background: selectedPlaces.includes(p.id) ? 'var(--black)' : 'var(--gray1)',
                    border: '1px solid transparent',
                    borderRadius: 8, fontSize: 13, fontWeight: selectedPlaces.includes(p.id) ? 500 : 400,
                    color: selectedPlaces.includes(p.id) ? 'white' : 'var(--gray4)',
                    cursor: 'pointer', transition: 'all 0.12s',
                  }}
                >
                  {p.emoji} {p.name}
                </button>
              ))}
            </div>
          )}
        </FormField>

        <FormField label="Nota (opcional)">
          <Input value={note} onChange={setNote} placeholder="ej. sin sal, que sea marca X..." />
        </FormField>

        <SubmitBtn onClick={handleAdd} disabled={!name.trim() || selectedPlaces.length === 0}>
          {success ? '✓ Agregado' : 'Agregar a la lista'}
        </SubmitBtn>

        {selectedPlaces.length === 0 && name.trim() && (
          <p style={{ fontSize: 12, color: 'var(--amber)', textAlign: 'center', marginTop: 8 }}>
            Elegí al menos un lugar
          </p>
        )}
      </div>

      <BottomNav screen="add" onNavigate={onNavigate} />
    </div>
  )
}
