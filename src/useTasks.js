import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

// ─── Recurrence helpers ───────────────────────────────────────────────────────
// Returns true if a recurring task should appear today
export function isDueToday(task) {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0=Sun, 1=Mon...

  if (task.recurrence === 'once') return true

  if (task.recurrence === 'daily') return true

  if (task.recurrence === 'weekly') {
    // task.recurrence_days is an array of day numbers e.g. [1, 3] = Mon, Wed
    return (task.recurrence_days || []).includes(dayOfWeek)
  }

  if (task.recurrence === 'monthly') {
    // task.recurrence_day_of_month = number e.g. 15
    return today.getDate() === task.recurrence_day_of_month
  }

  return false
}

// Returns next due date string for display
export function nextDueLabel(task) {
  if (task.recurrence === 'once') return 'una vez'
  if (task.recurrence === 'daily') return 'todos los días'
  if (task.recurrence === 'weekly') {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const names = (task.recurrence_days || []).map(d => days[d])
    return names.join(', ')
  }
  if (task.recurrence === 'monthly') return `el ${task.recurrence_day_of_month} de cada mes`
  return ''
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_TASKS = [
  {
    id: 't1', name: 'Limpiar baño', recurrence: 'weekly',
    recurrence_days: [1], recurrence_day_of_month: null,
    assigned_to: 'both', note: '',
    created_by: 'Delfi', created_by_emoji: '🌿',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 't2', name: 'Sacar a Kali a pasear', recurrence: 'daily',
    recurrence_days: [], recurrence_day_of_month: null,
    assigned_to: 'both', note: 'mínimo 20 min',
    created_by: 'Cande', created_by_emoji: '🌸',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 't3', name: 'Pagar expensas', recurrence: 'monthly',
    recurrence_days: [], recurrence_day_of_month: 10,
    assigned_to: 'Delfi', note: '',
    created_by: 'Delfi', created_by_emoji: '🌿',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 't4', name: 'Regar el Palmito', recurrence: 'weekly',
    recurrence_days: [3, 6], recurrence_day_of_month: null,
    assigned_to: 'Delfi', note: 'no encharcarlo',
    created_by: 'Delfi', created_by_emoji: '🌿',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 't5', name: 'Llamar al plomero', recurrence: 'once',
    recurrence_days: [], recurrence_day_of_month: null,
    assigned_to: 'Cande', note: '',
    created_by: 'Cande', created_by_emoji: '🌸',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
]

const isSupabaseConfigured = () => {
  const url = process.env.REACT_APP_SUPABASE_URL
  return url && url !== 'https://your-project.supabase.co' && url.includes('supabase')
}

export function useTasks(currentUser, logActivity) {
  const [tasks, setTasks] = useState(DEMO_TASKS)
  const usingSupabase = isSupabaseConfigured()

  // Load
  useEffect(() => {
    if (!usingSupabase) return
    supabase.from('tasks').select('*').order('created_at').then(({ data }) => {
      if (data) setTasks(data)
    })
  }, [usingSupabase])

  // Realtime
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
      // Delete permanently
      if (usingSupabase) {
        await supabase.from('tasks').delete().eq('id', id)
      } else {
        setTasks(prev => prev.filter(t => t.id !== id))
      }
    } else {
      // Record completion — task stays, we just log it
      // In a full implementation we'd store completion date to hide until next occurrence
      // For now we use localStorage to track today's completions
      const key = `madriguera_done_${id}_${new Date().toDateString()}`
      localStorage.setItem(key, '1')
      setTasks(prev => [...prev]) // force re-render
    }
    logActivity({ type: 'task_done', item_name: task.name })
  }, [tasks, usingSupabase, logActivity])

  const deleteTask = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id)
    if (usingSupabase) {
      await supabase.from('tasks').delete().eq('id', id)
    } else {
      setTasks(prev => prev.filter(t => t.id !== id))
    }
    if (task) logActivity({ type: 'task_delete', item_name: task.name })
  }, [tasks, usingSupabase, logActivity])

  // Check if task was completed today (for recurring tasks)
  function isCompletedToday(id) {
    const key = `madriguera_done_${id}_${new Date().toDateString()}`
    return !!localStorage.getItem(key)
  }

  // Tasks due today that haven't been completed
  const todayTasks = tasks.filter(t => isDueToday(t) && !isCompletedToday(t.id))

  // Upcoming recurring tasks (next 7 days, not today)
  function getUpcoming() {
    const upcoming = []
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    for (let i = 1; i <= 6; i++) {
      const d = new Date()
      d.setDate(d.getDate() + i)
      const dow = d.getDay()
      tasks.filter(t => t.recurrence === 'weekly' && (t.recurrence_days || []).includes(dow))
        .forEach(t => upcoming.push({ task: t, dayLabel: days[dow], daysFrom: i }))
    }
    return upcoming.slice(0, 5)
  }

  return { tasks, todayTasks, getUpcoming, addTask, completeTask, deleteTask, isCompletedToday }
}
