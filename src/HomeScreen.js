import React, { useState } from 'react'
import { Checkbox, ModalSheet, FormField, Input, SubmitBtn } from './components'
import { nextDueLabel } from './useTasks'

const DAYS = [
  { label: 'Dom', value: 0 }, { label: 'Lun', value: 1 }, { label: 'Mar', value: 2 },
  { label: 'Mié', value: 3 }, { label: 'Jue', value: 4 }, { label: 'Vie', value: 5 }, { label: 'Sáb', value: 6 },
]

// Returns next N days as options for "once" tasks
function getDateOptions() {
  const opts = []
  const today = new Date(); today.setHours(0,0,0,0)
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  for (let i = 0; i <= 14; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i)
    let label
    if (i === 0) label = 'Hoy'
    else if (i === 1) label = 'Mañana'
    else label = `${dayNames[d.getDay()]} ${d.getDate()} ${monthNames[d.getMonth()]}`
    opts.push({ label, value: d.toISOString(), date: d })
  }
  return opts
}

export default function HomeScreen({
  currentUser, pendingTodayTasks, doneTodayTasks, getUpcoming, items,
  onAddTask, onCompleteTask, onDeleteTask, onNavigate,
}) {
  const [showAdd, setShowAdd] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [taskName, setTaskName] = useState('')
  const [recurrence, setRecurrence] = useState('once')
  const [selectedDays, setSelectedDays] = useState([])
  const [dayOfMonth, setDayOfMonth] = useState('')
  const [assignedTo, setAssignedTo] = useState('both')
  const [taskNote, setTaskNote] = useState('')
  const [dueDate, setDueDate] = useState(null) // ISO string or null

  const upcoming = getUpcoming()
  const pendingItems = items.filter(i => !i.done).length
  const dateOptions = getDateOptions()

  function resetForm() {
    setTaskName(''); setRecurrence('once'); setSelectedDays([])
    setDayOfMonth(''); setAssignedTo('both'); setTaskNote(''); setDueDate(null)
  }

  async function handleAdd() {
    if (!taskName.trim()) return
    await onAddTask({
      name: taskName.trim(), recurrence,
      recurrence_days: recurrence === 'weekly' ? selectedDays : [],
      recurrence_day_of_month: recurrence === 'monthly' ? parseInt(dayOfMonth) : null,
      due_date: recurrence === 'once' ? dueDate : null,
      assigned_to: assignedTo, note: taskNote,
    })
    resetForm(); setShowAdd(false)
  }

  function toggleDay(d) {
    setSelectedDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }

  const canSubmit = taskName.trim() &&
    (recurrence !== 'weekly' || selectedDays.length > 0) &&
    (recurrence !== 'monthly' || dayOfMonth)

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos días'
    if (h < 19) return 'Buenas tardes'
    return 'Buenas noches'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <div style={{ padding: '16px 18px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: 16 }}>
          <div>
            <p style={{ fontSize: 12, color: 'var(--gray3)', fontWeight: 500, marginBottom: 2 }}>{greeting()}</p>
            <h1 style={{ fontFamily: 'Lora, serif', fontSize: 22, fontWeight: 500, color: 'var(--black)' }}>
              {currentUser.emoji} {currentUser.name}
            </h1>
          </div>
          <button onClick={() => onNavigate('activity')} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '6px 12px', borderRadius: 8, background: 'var(--gray1)', border: 'none',
            fontSize: 12.5, fontWeight: 500, color: 'var(--gray4)', cursor: 'pointer', marginTop: 4,
          }}>📋 Actividad</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 96px' }}>

        {/* Quick stats */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <div onClick={() => onNavigate('lists')} style={{ flex: 1, background: 'var(--accent-soft)', borderRadius: 10, padding: '12px 14px', cursor: 'pointer' }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>{pendingItems}</p>
            <p style={{ fontSize: 11.5, color: 'var(--accent)', fontWeight: 500, marginTop: 3 }}>ítems en listas</p>
          </div>
          <div style={{ flex: 1, background: 'var(--green-soft)', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--green)', lineHeight: 1 }}>{pendingTodayTasks.length}</p>
            <p style={{ fontSize: 11.5, color: 'var(--green)', fontWeight: 500, marginTop: 3 }}>tareas pendientes</p>
          </div>
        </div>

        {/* Pending tasks */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gray3)' }}>Para hoy</span>
            <button onClick={() => setShowAdd(true)} style={{ fontSize: 12, fontWeight: 500, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>+ Nueva tarea</button>
          </div>

          {pendingTodayTasks.length === 0 && doneTodayTasks.length === 0 ? (
            <div style={{ background: 'var(--white)', borderRadius: 12, border: '1px solid var(--border)', padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>✨</div>
              <p style={{ fontFamily: 'Lora, serif', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Todo al día</p>
              <p style={{ fontSize: 12.5, color: 'var(--gray3)' }}>No hay tareas para hoy</p>
            </div>
          ) : (
            <div style={{ background: 'var(--white)', borderRadius: 12, border: '1px solid var(--border)', padding: '4px 14px' }}>
              {pendingTodayTasks.map((task, i) => (
                <TaskRow key={task.id} task={task} done={false}
                  isLast={i === pendingTodayTasks.length - 1 && doneTodayTasks.length === 0}
                  onComplete={() => onCompleteTask(task.id)}
                  onDelete={() => setConfirmDelete(task)} />
              ))}
              {doneTodayTasks.map((task, i) => (
                <TaskRow key={task.id} task={task} done={true}
                  isLast={i === doneTodayTasks.length - 1}
                  onComplete={() => {}}
                  onDelete={() => setConfirmDelete(task)} />
              ))}
            </div>
          )}
        </div>

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gray3)', display: 'block', marginBottom: 10 }}>Próximas</span>
            <div style={{ background: 'var(--white)', borderRadius: 12, border: '1px solid var(--border)', padding: '4px 14px' }}>
              {upcoming.map(({ task, dayLabel, daysFrom }, i) => (
                <div key={`${task.id}-${daysFrom}`} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0',
                  borderBottom: i < upcoming.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ width: 20, height: 20, borderRadius: 5, background: 'var(--gray1)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13.5, color: 'var(--gray4)' }}>{task.name}</span>
                    {task.note ? <span style={{ fontSize: 11, color: 'var(--gray3)', marginLeft: 6, fontStyle: 'italic' }}>— {task.note}</span> : null}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray3)', background: 'var(--gray1)', borderRadius: 5, padding: '2px 7px' }}>
                    {daysFrom === 1 ? 'mañana' : dayLabel}
                  </span>
                  <AssignedBadge assigned={task.assigned_to} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button onClick={() => setShowAdd(true)} style={{
        position: 'absolute', bottom: 76, right: 18, width: 48, height: 48,
        background: 'var(--black)', border: 'none', borderRadius: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontSize: 22, boxShadow: '0 4px 14px rgba(0,0,0,0.2)', cursor: 'pointer', zIndex: 10,
      }}>+</button>

      <BottomNavNew screen="home" onNavigate={onNavigate} />

      {/* Add task modal */}
      <ModalSheet open={showAdd} onClose={() => { setShowAdd(false); resetForm() }}>
        <h2 style={{ fontFamily: 'Lora, serif', fontSize: 18, fontWeight: 500, marginBottom: 18 }}>Nueva tarea</h2>

        <FormField label="Nombre">
          <Input value={taskName} onChange={setTaskName} placeholder="ej. Limpiar baño, Regar plantas..." />
        </FormField>

        <FormField label="Frecuencia">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[['once', '📅 Una vez'], ['daily', '🔁 Diaria'], ['weekly', '📆 Semanal'], ['monthly', '🗓️ Mensual']].map(([val, label]) => (
              <button key={val} onClick={() => setRecurrence(val)} style={{
                padding: '7px 12px', borderRadius: 8, fontSize: 13,
                background: recurrence === val ? 'var(--black)' : 'var(--gray1)',
                color: recurrence === val ? 'white' : 'var(--gray4)',
                border: 'none', cursor: 'pointer', transition: 'all 0.12s',
              }}>{label}</button>
            ))}
          </div>
        </FormField>

        {/* Once: date picker */}
        {recurrence === 'once' && (
          <FormField label="¿Para cuándo?">
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
              {dateOptions.map(opt => (
                <button key={opt.value} onClick={() => setDueDate(opt.value === dueDate ? null : opt.value)} style={{
                  flexShrink: 0, padding: '7px 12px', borderRadius: 8, fontSize: 13, whiteSpace: 'nowrap',
                  background: dueDate === opt.value ? 'var(--black)' : 'var(--gray1)',
                  color: dueDate === opt.value ? 'white' : 'var(--gray4)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.12s',
                }}>{opt.label}</button>
              ))}
            </div>
          </FormField>
        )}

        {/* Weekly: day selector */}
        {recurrence === 'weekly' && (
          <FormField label="Qué días">
            <div style={{ display: 'flex', gap: 5 }}>
              {DAYS.map(d => (
                <button key={d.value} onClick={() => toggleDay(d.value)} style={{
                  flex: 1, padding: '7px 0', borderRadius: 7, fontSize: 11.5, fontWeight: 500,
                  background: selectedDays.includes(d.value) ? 'var(--black)' : 'var(--gray1)',
                  color: selectedDays.includes(d.value) ? 'white' : 'var(--gray4)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.12s',
                }}>{d.label}</button>
              ))}
            </div>
          </FormField>
        )}

        {recurrence === 'monthly' && (
          <FormField label="Día del mes">
            <Input value={dayOfMonth} onChange={setDayOfMonth} placeholder="ej. 10" style={{ width: 80 }} />
          </FormField>
        )}

        <FormField label="Asignada a">
          <div style={{ display: 'flex', gap: 6 }}>
            {[['both', '🌿🌸 Las dos'], ['Delfi', '🌿 Delfi'], ['Cande', '🌸 Cande']].map(([val, label]) => (
              <button key={val} onClick={() => setAssignedTo(val)} style={{
                padding: '7px 12px', borderRadius: 8, fontSize: 13, flex: 1,
                background: assignedTo === val ? 'var(--black)' : 'var(--gray1)',
                color: assignedTo === val ? 'white' : 'var(--gray4)',
                border: 'none', cursor: 'pointer', transition: 'all 0.12s',
              }}>{label}</button>
            ))}
          </div>
        </FormField>

        <FormField label="Nota (opcional)">
          <Input value={taskNote} onChange={setTaskNote} placeholder="ej. mínimo 20 min..." />
        </FormField>

        <SubmitBtn onClick={handleAdd} disabled={!canSubmit}>Agregar tarea</SubmitBtn>
      </ModalSheet>

      <ModalSheet open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <h2 style={{ fontFamily: 'Lora, serif', fontSize: 18, fontWeight: 500, marginBottom: 8 }}>Eliminar tarea</h2>
        <p style={{ fontSize: 14, color: 'var(--gray4)', marginBottom: 20 }}>¿Eliminás "{confirmDelete?.name}"?</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: 12, background: 'var(--gray1)', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Cancelar</button>
          <button onClick={() => { onDeleteTask(confirmDelete.id); setConfirmDelete(null) }} style={{ flex: 1, padding: 12, background: 'var(--red)', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, color: 'white', cursor: 'pointer' }}>Eliminar</button>
        </div>
      </ModalSheet>
    </div>
  )
}

function TaskRow({ task, done, isLast, onComplete, onDelete }) {
  const [hover, setHover] = useState(false)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 11, padding: '10px 0',
      borderBottom: isLast ? 'none' : '1px solid var(--border)',
      opacity: done ? 0.7 : 1,
      transition: 'opacity 0.3s',
    }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <Checkbox checked={done} onChange={done ? undefined : onComplete} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, color: done ? 'var(--gray3)' : 'var(--black)', textDecoration: done ? 'line-through' : 'none' }}>
          {task.name}
        </div>
        {done ? (
          // Completed: show who + when
          <div style={{ fontSize: 11, color: 'var(--gray3)', marginTop: 2 }}>
            {task.done_by_emoji} {task.done_by} · {new Date(task.done_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        ) : (
          // Pending: show recurrence label
          <div style={{ fontSize: 11, color: 'var(--gray3)', marginTop: 2 }}>
            {task.recurrence === 'once' ? '📅' : '🔁'} {nextDueLabel(task)}
            {task.note && <span style={{ fontStyle: 'italic', marginLeft: 4 }}>— {task.note}</span>}
          </div>
        )}
      </div>
      <AssignedBadge assigned={task.assigned_to} />
      {hover && !done && (
        <button onClick={e => { e.stopPropagation(); onDelete() }} style={{ fontSize: 13, color: 'var(--red)', background: 'var(--red-soft)', border: 'none', borderRadius: 6, padding: '3px 7px', cursor: 'pointer' }}>🗑️</button>
      )}
    </div>
  )
}

function AssignedBadge({ assigned }) {
  if (!assigned || assigned === 'both') return <span style={{ fontSize: 14 }}>🌿🌸</span>
  if (assigned === 'Delfi') return <span style={{ fontSize: 14 }}>🌿</span>
  return <span style={{ fontSize: 14 }}>🌸</span>
}

export function BottomNavNew({ screen, onNavigate }) {
  const tabs = [
    { id: 'home', icon: '🏠', label: 'Inicio' },
    { id: 'lists', icon: '🛒', label: 'Listas' },
    { id: 'settings', icon: '⚙️', label: 'Lugares' },
  ]
  return (
    <nav style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      background: 'rgba(247,247,245,0.92)', backdropFilter: 'blur(12px)',
      borderTop: '1px solid var(--border)', display: 'flex',
      padding: '8px 0 max(16px, env(safe-area-inset-bottom))', zIndex: 20,
    }}>
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => onNavigate(tab.id)} style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          background: 'none', border: 'none', padding: '4px 0', cursor: 'pointer',
        }}>
          <span style={{ fontSize: 18, opacity: screen === tab.id ? 1 : 0.35, lineHeight: 1 }}>{tab.icon}</span>
          <span style={{ fontSize: 10, fontWeight: screen === tab.id ? 600 : 500, color: screen === tab.id ? 'var(--black)' : 'var(--gray3)', letterSpacing: '0.02em' }}>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
