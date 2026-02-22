import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

// ─── Period helpers ───────────────────────────────────────────────────────────
function startOfWeek() {
  const d = new Date(); d.setHours(0,0,0,0)
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1)) // Monday
  return d
}
function endOfWeek() {
  const d = startOfWeek(); d.setDate(d.getDate() + 6); d.setHours(23,59,59,999); return d
}
function startOfMonth() {
  const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d
}
function endOfMonth() {
  const d = new Date(); d.setMonth(d.getMonth()+1); d.setDate(0); d.setHours(23,59,59,999); return d
}

function isDoneInPeriod(task, from, to) {
  if (!task.done || !task.done_at) return false
  const t = new Date(task.done_at)
  return t >= from && t <= to
}

export function isDoneToday(task) {
  const now = new Date()
  const start = new Date(now); start.setHours(0,0,0,0)
  const end = new Date(now); end.setHours(23,59,59,999)
  return isDoneInPeriod(task, start, end)
}

function isDoneThisWeek(task) { return isDoneInPeriod(task, startOfWeek(), endOfWeek()) }
function isDoneThisMonth(task) { return isDoneInPeriod(task, startOfMonth(), endOfMonth()) }

// Day of week this task falls on (for weekly tasks)
function weeklyDayLabel(task) {
  const days = task.recurrence_days || []
  const today = new Date().getDay()
  // Find which day this week it's due — prefer future days, else past
  const sorted = [...days].sort((a,b) => {
    const da = (a - today + 7) % 7
    const db = (b - today + 7) % 7
    return da - db
  })
  if (sorted.length === 0) return ''
  const d = sorted[0]
  // Label: "hoy", "mañana", "el Mié"
  const diff = (d - today + 7) % 7
  if (diff === 0) return 'hoy'
  if (diff === 1) return 'mañana'
  return `el ${DAY_NAMES[d]}`
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

// ─── Demo data ────────────────────────────────────────────────────────────────
const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
const DEMO_TASKS = [
  { id: 't1', name: 'Feria', recurrence: 'weekly', recurrence_days: [3], recurrence_day_of_month: null, due_date: null, assigned_to: 'both', note: '', created_by: 'Delfi', created_by_emoji: '🌿', done: false, done_by: null, done_by_emoji: null, done_at: null, created_at: new Date(Date.now() - 86400000*3).toISOString() },
  { id: 't2', name: 'Sacar a Kali', recurrence: 'daily', recurrence_days: [], recurrence_day_of_month: null, due_date: null, assigned_to: 'both', note: 'mínimo 20 min', created_by: 'Cande', created_by_emoji: '🌸', done: false, done_by: null, done_by_emoji: null, done_at: null, created_at: new Date(Date.now() - 86400000*7).toISOString() },
  { id: 't3', name: 'Pagar expensas', recurrence: 'monthly', recurrence_days: [], recurrence_day_of_month: 10, due_date: null, assigned_to: 'Delfi', note: '', created_by: 'Delfi', created_by_emoji: '🌿', done: false, done_by: null, done_by_emoji: null, done_at: null, created_at: new Date(Date.now() - 86400000*10).toISOString() },
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
      const doneTask = { ...task, done: true, done_by: currentUser.name, done_by_emoji: currentUser.emoji, done_at: new Date().toISOString() }
      setTasks(prev => prev.map(t => t.id === id ? doneTask : t))
      setTimeout(async () => {
        if (usingSupabase) await supabase.from('tasks').delete().eq('id', id)
        else setTasks(prev => prev.filter(t => t.id !== id))
      }, 1500)
    } else {
      const updates = { done: true, done_by: currentUser.name, done_by_emoji: currentUser.emoji, done_at: new Date().toISOString() }
      if (usingSupabase) await supabase.from('tasks').update(updates).eq('id', id)
      else setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
    }
    logActivity({ type: 'task_done', item_name: task.name })
  }, [tasks, currentUser, usingSupabase, logActivity])

  const uncompleteTask = useCallback(async (id) => {
    const updates = { done: false, done_by: null, done_by_emoji: null, done_at: null }
    if (usingSupabase) await supabase.from('tasks').update(updates).eq('id', id)
    else setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }, [usingSupabase])

  const updateTask = useCallback(async (id, data) => {
    if (usingSupabase) await supabase.from('tasks').update(data).eq('id', id)
    else setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t))
  }, [usingSupabase])

  const deleteTask = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id)
    if (usingSupabase) await supabase.from('tasks').delete().eq('id', id)
    else setTasks(prev => prev.filter(t => t.id !== id))
    if (task) logActivity({ type: 'task_delete', item_name: task.name })
  }, [tasks, usingSupabase, logActivity])

  // ─── Derived task lists ─────────────────────────────────────────────────────
  const today = new Date()
  const todayDow = today.getDay()
  const todayDate = today.getDate()

  // HOY: daily + once-for-today + weekly if today is their day + monthly if today is their day
  const todayTasks = tasks.filter(t => {
    if (t.recurrence === 'daily') return true
    if (t.recurrence === 'once') {
      if (t.due_date) return new Date(t.due_date).toDateString() === today.toDateString()
      return !t.done // no date = always show until done
    }
    if (t.recurrence === 'weekly') return (t.recurrence_days || []).includes(todayDow)
    if (t.recurrence === 'monthly') return t.recurrence_day_of_month === todayDate
    return false
  })
  const pendingTodayTasks = todayTasks.filter(t => !isDoneToday(t))
  const doneTodayTasks = todayTasks.filter(t => isDoneToday(t))

  // ESTA SEMANA: all weekly tasks — show all week, with their day label
  const weekTasks = tasks
    .filter(t => t.recurrence === 'weekly')
    .map(t => ({
      task: t,
      dayLabel: weeklyDayLabel(t),
      dueToday: (t.recurrence_days || []).includes(todayDow),
      done: isDoneThisWeek(t),
    }))
    .sort((a, b) => {
      // sort by next occurrence day
      const nextDay = (days, today) => {
        const sorted = [...days].sort((x,y) => (x-today+7)%7 - (y-today+7)%7)
        return sorted[0] ?? 0
      }
      return (nextDay(a.task.recurrence_days||[], todayDow) - todayDow + 7) % 7
           - (nextDay(b.task.recurrence_days||[], todayDow) - todayDow + 7) % 7
    })

  // ESTE MES: all monthly tasks — show all month, with day-of-month label
  const monthTasks = tasks
    .filter(t => t.recurrence === 'monthly')
    .map(t => ({
      task: t,
      dayLabel: `el ${t.recurrence_day_of_month}`,
      dueToday: t.recurrence_day_of_month === todayDate,
      done: isDoneThisMonth(t),
    }))
    .sort((a, b) => a.task.recurrence_day_of_month - b.task.recurrence_day_of_month)

  // PRÓXIMAMENTE: once tasks with future due date
  const upcomingTasks = tasks
    .filter(t => {
      if (t.recurrence !== 'once' || !t.due_date) return false
      const d = new Date(t.due_date); d.setHours(0,0,0,0)
      const tod = new Date(); tod.setHours(0,0,0,0)
      return d > tod
    })
    .map(t => ({ task: t, dayLabel: nextDueLabel(t) }))
    .sort((a,b) => new Date(a.task.due_date) - new Date(b.task.due_date))

  return {
    tasks,
    todayTasks, pendingTodayTasks, doneTodayTasks,
    weekTasks, monthTasks, upcomingTasks,
    addTask, completeTask, uncompleteTask, updateTask, deleteTask
  }
}
