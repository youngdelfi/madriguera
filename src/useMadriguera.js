import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

// ─── Local user identity (stored in localStorage) ───────────────────────────
function getLocalUser() {
  let user = localStorage.getItem('madriguera_user')
  if (!user) {
    const id = Math.random().toString(36).slice(2, 8)
    user = JSON.stringify({ id, name: 'Yo', emoji: '🌿' })
    localStorage.setItem('madriguera_user', user)
  }
  return JSON.parse(user)
}

// ─── Seed data for demo (used when Supabase is not configured) ───────────────
const DEMO_PLACES = [
  { id: '1', name: 'Coto', emoji: '🛒', color: 'blue', note: 'Los martes con Modo: descuento en carne. Pedir bola de lomo o nalga y que la piquen una vez.' },
  { id: '2', name: 'Feria del barrio', emoji: '🥦', color: 'green', note: 'Solo va los sábados a la mañana.' },
  { id: '3', name: 'Bazar chino', emoji: '🏮', color: 'amber', note: '' },
  { id: '4', name: 'Pedidos Ya', emoji: '📦', color: 'gray', note: 'Para días de lluvia.' },
]

const DEMO_ITEMS = [
  { id: 'i1', name: 'Leche', qty: '2', unit: 'L', place_ids: ['1'], note: '', done: false, done_by: null, done_at: null, created_at: new Date(Date.now() - 3600000).toISOString(), created_by: 'Cande', created_by_emoji: '🌸' },
  { id: 'i2', name: 'Pollo', qty: '1', unit: 'kg', place_ids: ['1'], note: '', done: false, done_by: null, done_at: null, created_at: new Date(Date.now() - 7200000).toISOString(), created_by: 'Cande', created_by_emoji: '🌸' },
  { id: 'i3', name: 'Huevos', qty: '1', unit: 'docena', place_ids: ['1', '2'], note: '', done: false, done_by: null, done_at: null, created_at: new Date(Date.now() - 86400000).toISOString(), created_by: 'Delfi', created_by_emoji: '🌿' },
  { id: 'i4', name: 'Limones', qty: '6', unit: '', place_ids: ['1', '2'], note: '', done: false, done_by: null, done_at: null, created_at: new Date(Date.now() - 90000000).toISOString(), created_by: 'Delfi', created_by_emoji: '🌿' },
  { id: 'i5', name: 'Tomates', qty: '1', unit: 'kg', place_ids: ['2'], note: '', done: false, done_by: null, done_at: null, created_at: new Date(Date.now() - 100000000).toISOString(), created_by: 'Cande', created_by_emoji: '🌸' },
  { id: 'i6', name: 'Lechuga', qty: '', unit: '', place_ids: ['2'], note: '', done: false, done_by: null, done_at: null, created_at: new Date(Date.now() - 101000000).toISOString(), created_by: 'Cande', created_by_emoji: '🌸' },
  { id: 'i7', name: 'Velas', qty: '', unit: '', place_ids: ['3'], note: '', done: false, done_by: null, done_at: null, created_at: new Date(Date.now() - 172800000).toISOString(), created_by: 'Cande', created_by_emoji: '🌸' },
  { id: 'i8', name: 'Detergente', qty: '', unit: '', place_ids: ['3'], note: '', done: false, done_by: null, done_at: null, created_at: new Date(Date.now() - 172900000).toISOString(), created_by: 'Cande', created_by_emoji: '🌸' },
  { id: 'i9', name: 'Yogur', qty: '2', unit: '', place_ids: ['1'], note: '', done: true, done_by: 'Cande', done_at: new Date(Date.now() - 1800000).toISOString(), created_at: new Date(Date.now() - 200000000).toISOString(), created_by: 'Delfi', created_by_emoji: '🌿' },
]

const DEMO_ACTIVITY = [
  { id: 'a1', type: 'check', item_name: 'Yogur', place_name: 'Coto', user_name: 'Cande', user_emoji: '🌸', created_at: new Date(Date.now() - 300000).toISOString() },
  { id: 'a2', type: 'add', item_name: 'Huevos', place_names: ['Coto', 'Feria'], user_name: 'Delfi', user_emoji: '🌿', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'a3', type: 'note', item_name: 'Coto', user_name: 'Delfi', user_emoji: '🌿', created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 'a4', type: 'add', item_name: 'Velas', place_names: ['Bazar'], user_name: 'Cande', user_emoji: '🌸', created_at: new Date(Date.now() - 86400000 - 1800000).toISOString() },
  { id: 'a5', type: 'delete', item_name: 'Cebollas', place_name: 'Feria', user_name: 'Delfi', user_emoji: '🌿', created_at: new Date(Date.now() - 86400000 - 3600000 * 3).toISOString() },
  { id: 'a6', type: 'check', item_name: 'Tomates', place_name: 'Feria', user_name: 'Cande', user_emoji: '🌸', created_at: new Date(Date.now() - 86400000 - 3600000 * 8).toISOString() },
  { id: 'a7', type: 'new_place', item_name: 'Pedidos Ya', user_name: 'Delfi', user_emoji: '🌿', created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
]

const isSupabaseConfigured = () => {
  const url = process.env.REACT_APP_SUPABASE_URL
  return url && url !== 'https://your-project.supabase.co' && url.includes('supabase')
}

export function useMadriguera() {
  const [places, setPlaces] = useState(DEMO_PLACES)
  const [items, setItems] = useState(DEMO_ITEMS)
  const [activity, setActivity] = useState(DEMO_ACTIVITY)
  const [loading, setLoading] = useState(false)
  const currentUser = getLocalUser()
  const usingSupabase = isSupabaseConfigured()

  // ── Load from Supabase ────────────────────────────────────────────────────
  useEffect(() => {
    if (!usingSupabase) return
    setLoading(true)

    Promise.all([
      supabase.from('places').select('*').order('position'),
      supabase.from('items').select('*').order('created_at', { ascending: false }),
      supabase.from('activity').select('*').order('created_at', { ascending: false }).limit(50),
    ]).then(([p, i, a]) => {
      if (p.data) setPlaces(p.data)
      if (i.data) setItems(i.data)
      if (a.data) setActivity(a.data)
      setLoading(false)
    })
  }, [usingSupabase])

  // ── Realtime subscriptions ─────────────────────────────────────────────────
  useEffect(() => {
    if (!usingSupabase) return

    const channel = supabase
      .channel('madriguera-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'places' }, () => {
        supabase.from('places').select('*').order('position').then(({ data }) => { if (data) setPlaces(data) })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
        supabase.from('items').select('*').order('created_at', { ascending: false }).then(({ data }) => { if (data) setItems(data) })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity' }, () => {
        supabase.from('activity').select('*').order('created_at', { ascending: false }).limit(50).then(({ data }) => { if (data) setActivity(data) })
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [usingSupabase])

  // ── Helpers ───────────────────────────────────────────────────────────────
  const logActivity = useCallback(async (entry) => {
    const record = { ...entry, created_at: new Date().toISOString(), user_name: currentUser.name, user_emoji: currentUser.emoji, id: Math.random().toString(36).slice(2) }
    if (usingSupabase) {
      await supabase.from('activity').insert(record)
    } else {
      setActivity(prev => [record, ...prev])
    }
  }, [currentUser, usingSupabase])

  // ── Actions ───────────────────────────────────────────────────────────────
  const addPlace = useCallback(async ({ name, emoji, color }) => {
    const place = { id: Math.random().toString(36).slice(2), name, emoji, color: color || 'blue', note: '', position: places.length }
    if (usingSupabase) {
      await supabase.from('places').insert(place)
    } else {
      setPlaces(prev => [...prev, place])
      logActivity({ type: 'new_place', item_name: name })
    }
    logActivity({ type: 'new_place', item_name: name })
  }, [places.length, usingSupabase, logActivity])

  const updatePlace = useCallback(async (id, updates) => {
    if (usingSupabase) {
      await supabase.from('places').update(updates).eq('id', id)
    } else {
      setPlaces(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
    }
  }, [usingSupabase])

  const deletePlace = useCallback(async (id) => {
    if (usingSupabase) {
      await supabase.from('places').delete().eq('id', id)
      await supabase.from('items').delete().contains('place_ids', [id])
    } else {
      setPlaces(prev => prev.filter(p => p.id !== id))
      setItems(prev => prev.filter(item => !item.place_ids.includes(id)))
    }
  }, [usingSupabase])

  const addItem = useCallback(async ({ name, qty, unit, place_ids, note }) => {
    const item = {
      id: Math.random().toString(36).slice(2),
      name, qty, unit, place_ids, note,
      done: false, done_by: null, done_at: null,
      created_at: new Date().toISOString(),
      created_by: currentUser.name,
      created_by_emoji: currentUser.emoji,
    }
    if (usingSupabase) {
      await supabase.from('items').insert(item)
    } else {
      setItems(prev => [item, ...prev])
    }
    const placeNames = places.filter(p => place_ids.includes(p.id)).map(p => p.name)
    logActivity({ type: 'add', item_name: name, place_names: placeNames })
  }, [currentUser, usingSupabase, places, logActivity])

  const toggleItem = useCallback(async (id) => {
    const item = items.find(i => i.id === id)
    if (!item) return
    const updates = item.done
      ? { done: false, done_by: null, done_at: null }
      : { done: true, done_by: currentUser.name, done_at: new Date().toISOString() }

    if (usingSupabase) {
      await supabase.from('items').update(updates).eq('id', id)
    } else {
      setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))
    }
    if (!item.done) {
      const placeName = places.find(p => item.place_ids[0] === p.id)?.name || ''
      logActivity({ type: 'check', item_name: item.name, place_name: placeName })
    }
  }, [items, currentUser, usingSupabase, places, logActivity])

  const deleteItem = useCallback(async (id) => {
    const item = items.find(i => i.id === id)
    if (usingSupabase) {
      await supabase.from('items').delete().eq('id', id)
    } else {
      setItems(prev => prev.filter(i => i.id !== id))
    }
    if (item) logActivity({ type: 'delete', item_name: item.name })
  }, [items, usingSupabase, logActivity])

  const clearDone = useCallback(async (placeId) => {
    const doneIds = items.filter(i => i.done && i.place_ids.includes(placeId)).map(i => i.id)
    if (usingSupabase) {
      await supabase.from('items').delete().in('id', doneIds)
    } else {
      setItems(prev => prev.filter(i => !doneIds.includes(i.id)))
    }
  }, [items, usingSupabase])

  const updateNote = useCallback(async (placeId, note) => {
    await updatePlace(placeId, { note })
    logActivity({ type: 'note', item_name: places.find(p => p.id === placeId)?.name || '' })
  }, [updatePlace, places, logActivity])

  const sendFeedback = useCallback(async (text) => {
    await logActivity({ type: 'feedback', item_name: text })
  }, [logActivity])

  return {
    places, items, activity, loading, currentUser, usingSupabase,
    addPlace, updatePlace, deletePlace,
    addItem, toggleItem, deleteItem, clearDone, updateNote, sendFeedback,
    logActivity,
  }
}
