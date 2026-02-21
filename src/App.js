import React, { useState } from 'react'
import './index.css'
import { useMadriguera } from './useMadriguera'
import HomeScreen from './HomeScreen'
import PlaceScreen from './PlaceScreen'
import ActivityScreen from './ActivityScreen'
import AddItemScreen from './AddItemScreen'
import SettingsScreen from './SettingsScreen'

export default function App() {
  const [screen, setScreen] = useState('home')
  const [selectedPlaceId, setSelectedPlaceId] = useState(null)

  const {
    places, items, activity, loading,
    addPlace, updatePlace, deletePlace,
    addItem, toggleItem, deleteItem, clearDone, updateNote, sendFeedback,
  } = useMadriguera()

  function navigate(s) { setScreen(s) }

  function selectPlace(id) {
    setSelectedPlaceId(id)
    setScreen('place')
  }

  const selectedPlace = places.find(p => p.id === selectedPlaceId)

  const containerStyle = {
    width: '100%', maxWidth: 430, height: '100%',
    margin: '0 auto', background: 'var(--bg)',
    position: 'relative', overflow: 'hidden',
  }

  if (loading) {
    return (
      <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--gray3)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🐇</div>
          <p style={{ fontFamily: 'Lora, serif', fontSize: 15 }}>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      {screen === 'home' && (
        <HomeScreen places={places} items={items} onNavigate={navigate} onSelectPlace={selectPlace} onAddPlace={addPlace} />
      )}
      {screen === 'place' && selectedPlace && (
        <PlaceScreen place={selectedPlace} items={items} places={places} onBack={() => setScreen('home')} onNavigate={navigate} onToggleItem={toggleItem} onDeleteItem={deleteItem} onClearDone={clearDone} onUpdateNote={updateNote} onAddItem={addItem} />
      )}
      {screen === 'activity' && (
        <ActivityScreen activity={activity} onNavigate={navigate} onSendFeedback={sendFeedback} />
      )}
      {screen === 'add' && (
        <AddItemScreen places={places} onNavigate={navigate} onAddItem={addItem} />
      )}
      {screen === 'settings' && (
        <SettingsScreen places={places} onNavigate={navigate} onDeletePlace={deletePlace} onUpdatePlace={updatePlace} />
      )}
    </div>
  )
}
