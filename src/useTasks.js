import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

// ─── Day helpers ──────────────────────────────────────────────────────────────
const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export function isDueToday(task) {
  const dow = new Date().getDay()
  if (task.recurrence === 'once') {
    // If has a specific due date, check it
    if (task.due_date) {
      const today = new Date().toDateString()
      return new Date(task.due_date).toDateString() === today
    }
    return true // no date = show always until done
  }
  if (task.recurrence === 'daily') return true
  if (task.recurrence === 'weekly') return (task.recurrence_days || []).includes(dow)
  if (task.recurrence === 'monthly') return new Date().getDate() === task.recurrence_day_of_month
  return false
}

export function isDoneToday(task) {
  if (!task.done || !task.done_at) return false
  return new Date(task.done_at).toDateString() === new Date().toDateString()
}

export function nextDueLabel(task) {
  if (task.recurrence === 'once') {
    if (task.due_date) {
      const d = new Date(task.due_date)
      const today = new Date(); today.setHours(0,0,0,0)
      const diff = Math.round((d - today) / 86400000)
      if (diff === 0) return 'hoy'
      if (diff === 1) return 'mañana'
      if (diff > 0 && diff < 7) return `el ${DAY_NAMES[d.getDay()]}`
      return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
    }
    return 'una vez'
  }
  if (task.recurrence === 'daily') return 'todos los días'
  if (task.recurrence === 'weekly') {
    const names = (task.recurrence_days || []).map(d => DAY_NAMES[d])
    return `los ${names.join(', ')}`
  }
  if (task.recurrence === 'monthly') return `el ${task.recurrence_day_of_month} de cada mes`
  return ''
}

export function formatDoneTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1)
  const time = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  if (d.toDateString() === today.toDateString()) return `hoy ${time}`
  if (d.toDateString() === yesterday.toDateString()) return `ayer ${time}`
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) + ` ${time}`
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
const nextWed = new Date(); nextWed.setDate(nextWed.getDate() + ((3 - nextWed.getDay() + 7) % 7 || 7))

const DEMO_TASKS = [
  { id: 't1', name: 'Limpiar baño', recurrence: 'weekly', recurrence_days: [1], recurrence_day_of_month: null, due_date: null, assigned_to: 'both', note: '', created_by: 'Delfi', created_by_emoji: '🌿', done: false, done_by: null, done_by_emoji: null, done_at: null, created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 't2', name: 'Sacar a Kali', recurrence: 'daily', recurrence_days: [], recurrence_day_of_month: null, due_date: null, assigned_to: 'both', note: 'mínimo 20 min', created_by: 'Cande', created_by_emoji: '🌸', done: false, done_by: null, done_by_emoji: null, done_at: null, created_at: new Date(Date.now() - 86400000 * 7).toISOString() },
  { id: 't3', name: 'Pagar expensas', recurrence: 'monthly', recurrence_days: [], recurrence_day_of_month: 10, due_date: null, assigned_to: 'Delfi', note: '', created_by: 'Delfi', created_by_emoji: '🌿', done: false, done_by: null, done_by_emoji: null, done_at: null, created_at: new Date(Date.now() - 86400000 * 10).toISOString() },
  { id: 't4', name: 'Llamar al plomero', recurrence: 'once', recurrence_days: [], recurrence_day_of_month: null, due_date: tomorrow.toISOString(), assigned_to: 'Cande', note: '', created_by: 'Cande', created_by_emoji: '🌸', done: false, done_by: null, done_by_emoji: null, done_at: null, created_at: new Date(Date.now() - 3600000).toISOString() },
]

const isSupabaseConfigured = () => {
  const url = process.env.REACT_APP_SUPABASE_URL
  return url && url !== 'https://your-project.supabase.co' && url.includes('supabase')
}

export function useTasks(currentUser, logActivity) {
  const [tasks, setTasks] = useState(DEMO_TASKS)
  const usingSupabase = isSupabaseConfigured()

  useEffect(() => {
    if (!usingSupabase) return
    supabase.from('tasks').select('*').order('created_at').then(({ data }) => {
      if (data) setTasks(data)
    })
  }, [usingSupabase])

  useEffect(() => {
    if (!usingSupabase) return
    const channel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        supabase.from('tasks').select('*').order('created_at').then(({ data }) => {
          if (data) setTasks(data)
        })
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [usingSupabase])

  const addTask = useCallback(async (taskData) => {
    const task = {
      id: Math.random().toString(36).slice(2),
      ...taskData,
      done: false, done_by: null, done_by_emoji: null, done_at: null,
      created_by: currentUser.name,
      created_by_emoji: currentUser.emoji,
      created_at: new Date().toISOString(),
    }
    if (usingSupabase) {
      await supabase.from('tasks').insert(task)
    } else {
      setTasks(prev => [...prev, task])
    }
    logActivity({ type: 'task_add', item_name: task.name })
  }, [currentUser, usingSupabase, logActivity])

  const completeTask = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    if (task.recurrence === 'once') {
      // Delete permanently, stays shown as "done" momentarily via optimistic update
      const doneTask = { ...task, done: true, done_by: currentUser.name, done_by_emoji: currentUser.emoji, done_at: new Date().toISOString() }
      setTasks(prev => prev.map(t => t.id === id ? doneTask : t))
      setTimeout(async () => {
        if (usingSupabase) {
          await supabase.from('tasks').delete().eq('id', id)
        } else {
          setTasks(prev => prev.filter(t => t.id !== id))
        }
      }, 1500)
    } else {
      // Mark done — reappears next occurrence (reset at midnight)
      const updates = { done: true, done_by: currentUser.name, done_by_emoji: currentUser.emoji, done_at: new Date().toISOString() }
      if (usingSupabase) {
        await supabase.from('tasks').update(updates).eq('id', id)
      } else {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
      }
    }
    logActivity({ type: 'task_done', item_name: task.name })
  }, [tasks, currentUser, usingSupabase, logActivity])

  const updateTask = useCallback(async (id, data) => {
    if (usingSupabase) {
      await supabase.from('tasks').update(data).eq('id', id)
    } else {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t))
    }
  }, [usingSupabase])

  const uncompleteTask = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const updates = { done: false, done_by: null, done_by_emoji: null, done_at: null }
    if (usingSupabase) {
      await supabase.from('tasks').update(updates).eq('id', id)
    } else {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
    }
  }, [tasks, usingSupabase])

  const deleteTask = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id)
    if (usingSupabase) {
      await supabase.from('tasks').delete().eq('id', id)
    } else {
      setTasks(prev => prev.filter(t => t.id !== id))
    }
    if (task) logActivity({ type: 'task_delete', item_name: task.name })
  }, [tasks, usingSupabase, logActivity])

  // Reset done status at midnight for recurring tasks
  useEffect(() => {
    if (!usingSupabase) return
    const now = new Date()
    const midnight = new Date(now); midnight.setHours(24,0,0,0)
    const ms = midnight - now
    const timer = setTimeout(async () => {
      await supabase.from('tasks')
        .update({ done: false, done_by: null, done_by_emoji: null, done_at: null })
        .neq('recurrence', 'once')
        .eq('done', true)
    }, ms)
    return () => clearTimeout(timer)
  }, [usingSupabase])

  // Tasks due today (pending + done today)
  const todayTasks = tasks.filter(t => isDueToday(t))
  const pendingTodayTasks = todayTasks.filter(t => !isDoneToday(t))
  const doneTodayTasks = todayTasks.filter(t => isDoneToday(t))

  function getUpcoming() {
    const upcoming = []
    for (let i = 1; i <= 6; i++) {
      const d = new Date(); d.setDate(d.getDate() + i)
      const dow = d.getDay()
      tasks
        .filter(t => t.recurrence === 'weekly' && (t.recurrence_days || []).includes(dow) && !isDoneToday(t))
        .forEach(t => upcoming.push({ task: t, dayLabel: DAY_NAMES[dow], daysFrom: i }))
      // Also once tasks with due_date in next 6 days
      tasks
        .filter(t => t.recurrence === 'once' && t.due_date && new Date(t.due_date).toDateString() === d.toDateString())
        .forEach(t => upcoming.push({ task: t, dayLabel: DAY_NAMES[dow], daysFrom: i }))
    }
    return upcoming.slice(0, 5)
  }

  return { tasks, todayTasks, pendingTodayTasks, doneTodayTasks, getUpcoming, addTask, completeTask, uncompleteTask, updateTask, deleteTask }
}
