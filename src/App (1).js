import React, { useState, useEffect } from 'react'
import './index.css'
import { supabase } from './supabase'
import { useMadriguera } from './useMadriguera'
import { useTasks } from './useTasks'
import LoginScreen from './LoginScreen'
import HomeScreen from './HomeScreen'
import ListsScreen from './ListsScreen'
import PlaceScreen from './PlaceScreen'
import ActivityScreen from './ActivityScreen'
import AddItemScreen from './AddItemScreen'
import SettingsScreen from './SettingsScreen'

const isSupabaseConfigured = () => {
  const url = process.env.REACT_APP_SUPABASE_URL
  return url && url !== 'https://your-project.supabase.co' && url.includes('supabase')
}

export default function App() {
  const [screen, setScreen] = useState('home')
  const [selectedPlaceId, setSelectedPlaceId] = useState(null)
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const usingSupabase = isSupabaseConfigured()

  // Auth
  useEffect(() => {
    if (!usingSupabase) {
      setAuthLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [usingSupabase])

  const {
    places, items, activity, loading, currentUser,
    addPlace, updatePlace, deletePlace,
    addItem, toggleItem, deleteItem, clearDone, updateNote, sendFeedback,
    logActivity,
  } = useMadriguera(session)

  const { todayTasks, pendingTodayTasks, doneTodayTasks, getUpcoming, addTask, completeTask, uncompleteTask, deleteTask } = useTasks(currentUser, logActivity)

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

  if (authLoading || loading) {
    return (
      <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--gray3)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🏠</div>
          <p style={{ fontFamily: 'Lora, serif', fontSize: 15 }}>Cargando...</p>
        </div>
      </div>
    )
  }

  // Show login only if Supabase is configured and no session
  if (usingSupabase && !session) {
    return <div style={containerStyle}><LoginScreen /></div>
  }

  return (
    <div style={containerStyle}>
      {screen === 'home' && (
        <HomeScreen
          currentUser={currentUser}
          todayTasks={todayTasks}
          pendingTodayTasks={pendingTodayTasks}
          doneTodayTasks={doneTodayTasks}
          getUpcoming={getUpcoming}
          items={items}
          places={places}
          onAddTask={addTask}
          onCompleteTask={completeTask}
          onUncompleteTask={uncompleteTask}
          onDeleteTask={deleteTask}
          onNavigate={navigate}
        />
      )}
      {screen === 'lists' && (
        <ListsScreen
          places={places} items={items}
          onNavigate={navigate} onSelectPlace={selectPlace} onAddPlace={addPlace}
        />
      )}
      {screen === 'place' && selectedPlace && (
        <PlaceScreen
          place={selectedPlace} items={items} places={places}
          onBack={() => setScreen('lists')} onNavigate={navigate}
          onToggleItem={toggleItem} onDeleteItem={deleteItem}
          onClearDone={clearDone} onUpdateNote={updateNote} onAddItem={addItem}
        />
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
