import React, { useState, useRef, useCallback } from 'react'
import { ModalSheet, FormField, Input, SubmitBtn } from './components'
import { nextDueLabel } from './useTasks'

const DAYS = [
  { label: 'Dom', value: 0 }, { label: 'Lun', value: 1 }, { label: 'Mar', value: 2 },
  { label: 'Mié', value: 3 }, { label: 'Jue', value: 4 }, { label: 'Vie', value: 5 }, { label: 'Sáb', value: 6 },
]

function getDateOptions() {
  const opts = []
  const today = new Date(); today.setHours(0,0,0,0)
  const dayNames = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
  const monthNames = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  for (let i = 0; i <= 14; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i)
    let label = i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : `${dayNames[d.getDay()]} ${d.getDate()} ${monthNames[d.getMonth()]}`
    opts.push({ label, value: d.toISOString() })
  }
  return opts
}

// ─── Swipeable TaskRow ───────────────────────────────────────────────────────
function TaskRow({ task, done, isLast, onComplete, onEdit, onDelete }) {
  const [swipeX, setSwipeX] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const startX = useRef(null)
  const rowRef = useRef(null)
  const SWIPE_THRESHOLD = 60

  const onTouchStart = useCallback((e) => {
    startX.current = e.touches[0].clientX
    setSwiping(false)
  }, [])

  const onTouchMove = useCallback((e) => {
    if (startX.current === null) return
    const dx = e.touches[0].clientX - startX.current
    if (Math.abs(dx) > 8) setSwiping(true)
    // Only allow left swipe
    if (dx < 0) setSwipeX(Math.max(dx, -130))
    else if (swipeX < 0) setSwipeX(Math.min(0, swipeX + dx * 0.3))
  }, [swipeX])

  const onTouchEnd = useCallback(() => {
    if (swipeX < -SWIPE_THRESHOLD) {
      setSwipeX(-130) // snap open
    } else {
      setSwipeX(0) // snap closed
    }
    startX.current = null
    setTimeout(() => setSwiping(false), 100)
  }, [swipeX])

  const closeSwipe = () => setSwipeX(0)

  const handleCheckboxClick = (e) => {
    e.stopPropagation()
    if (!swiping) onComplete()
  }

  return (
    <div style={{ position: 'relative', overflow: 'hidden',
      borderBottom: isLast ? 'none' : '1px solid var(--border)' }}>
      
      {/* Action buttons behind */}
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0,
        display: 'flex', alignItems: 'stretch',
        width: 130,
      }}>
        <button onClick={(e) => { e.stopPropagation(); closeSwipe(); onEdit() }} style={{
          flex: 1, border: 'none', background: '#4A90D9', color: 'white',
          fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
        }}>
          <span style={{ fontSize: 16 }}>✏️</span>
          Editar
        </button>
        <button onClick={(e) => { e.stopPropagation(); closeSwipe(); onDelete() }} style={{
          flex: 1, border: 'none', background: '#E05252', color: 'white',
          fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
        }}>
          <span style={{ fontSize: 16 }}>🗑️</span>
          Eliminar
        </button>
      </div>

      {/* Row content */}
      <div
        ref={rowRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          display: 'flex', alignItems: 'center', gap: 4, padding: '10px 6px 10px 0',
          background: 'var(--white)',
          transform: `translateX(${swipeX}px)`,
          transition: swiping ? 'none' : 'transform 0.2s ease',
          opacity: done ? 0.72 : 1,
          willChange: 'transform',
        }}
      >
        {/* Big tap target for checkbox */}
        <div
          onClick={handleCheckboxClick}
          style={{
            width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          }}
        >
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            border: done ? 'none' : '2px solid var(--gray2)',
            background: done ? 'var(--green)' : 'var(--white)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
            boxShadow: done ? 'none' : 'inset 0 1px 2px rgba(0,0,0,0.06)',
          }}>
            {done && <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
              <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 14, color: done ? 'var(--gray3)' : 'var(--black)',
            textDecoration: done ? 'line-through' : 'none',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {task.name}
          </div>
          {done ? (
            <div style={{ fontSize: 11, color: 'var(--gray3)', marginTop: 2 }}>
              {task.done_by_emoji} {task.done_by} · {new Date(task.done_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          ) : (
            <div style={{ fontSize: 11, color: 'var(--gray3)', marginTop: 2 }}>
              {task.recurrence === 'once' ? '📅' : '🔁'} {nextDueLabel(task)}
              {task.note && <span style={{ fontStyle: 'italic', marginLeft: 4 }}>— {task.note}</span>}
            </div>
          )}
        </div>

        <AssignedBadge assigned={task.assigned_to} />
        {/* Swipe hint arrow */}
        <div style={{ fontSize: 11, color: 'var(--gray2)', paddingLeft: 4, paddingRight: 2, flexShrink: 0 }}>‹</div>
      </div>
    </div>
  )
}

// ─── Upcoming row (con checkbox para completar anticipado) ────────────────────
function UpcomingRow({ task, dayLabel, daysFrom, isLast, onComplete, onEdit, onDelete }) {
  const [swipeX, setSwipeX] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const startX = useRef(null)

  const onTouchStart = (e) => { startX.current = e.touches[0].clientX; setSwiping(false) }
  const onTouchMove = (e) => {
    if (startX.current === null) return
    const dx = e.touches[0].clientX - startX.current
    if (Math.abs(dx) > 8) setSwiping(true)
    if (dx < 0) setSwipeX(Math.max(dx, -130))
  }
  const onTouchEnd = () => {
    setSwipeX(swipeX < -60 ? -130 : 0)
    startX.current = null
    setTimeout(() => setSwiping(false), 100)
  }

  return (
    <div style={{ position: 'relative', overflow: 'hidden',
      borderBottom: isLast ? 'none' : '1px solid var(--border)' }}>
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, display: 'flex', width: 130 }}>
        <button onClick={() => { setSwipeX(0); onEdit() }} style={{ flex: 1, border: 'none', background: '#4A90D9', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <span style={{ fontSize: 16 }}>✏️</span>Editar
        </button>
        <button onClick={() => { setSwipeX(0); onDelete() }} style={{ flex: 1, border: 'none', background: '#E05252', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <span style={{ fontSize: 16 }}>🗑️</span>Eliminar
        </button>
      </div>
      <div
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '9px 6px 9px 0',
          background: 'var(--white)', transform: `translateX(${swipeX}px)`,
          transition: swiping ? 'none' : 'transform 0.2s ease' }}>
        {/* Checkbox to mark future task done now */}
        <div onClick={() => !swiping && onComplete()} style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, border: '2px solid var(--gray2)', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 13.5, color: 'var(--gray4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{task.name}</span>
          {task.note && <span style={{ fontSize: 11, color: 'var(--gray3)', fontStyle: 'italic' }}>— {task.note}</span>}
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray3)', background: 'var(--gray1)', borderRadius: 5, padding: '2px 7px', flexShrink: 0 }}>
          {daysFrom === 1 ? 'mañana' : dayLabel}
        </span>
        <AssignedBadge assigned={task.assigned_to} />
        <div style={{ fontSize: 11, color: 'var(--gray2)', paddingLeft: 4, paddingRight: 2, flexShrink: 0 }}>‹</div>
      </div>
    </div>
  )
}

function AssignedBadge({ assigned }) {
  if (!assigned || assigned === 'both') return <span style={{ fontSize: 14, flexShrink: 0 }}>🌿🌸</span>
  if (assigned === 'Delfi') return <span style={{ fontSize: 14, flexShrink: 0 }}>🌿</span>
  return <span style={{ fontSize: 14, flexShrink: 0 }}>🌸</span>
}

// ─── Task form (shared for add + edit) ───────────────────────────────────────
function TaskForm({ initial = {}, onSubmit, onClose }) {
  const [name, setName] = useState(initial.name || '')
  const [recurrence, setRecurrence] = useState(initial.recurrence || 'once')
  const [selectedDays, setSelectedDays] = useState(initial.recurrence_days || [])
  const [dayOfMonth, setDayOfMonth] = useState(initial.recurrence_day_of_month?.toString() || '')
  const [assignedTo, setAssignedTo] = useState(initial.assigned_to || 'both')
  const [note, setNote] = useState(initial.note || '')
  const [dueDate, setDueDate] = useState(initial.due_date || null)
  const dateOptions = getDateOptions()

  const toggleDay = (d) => setSelectedDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])

  const canSubmit = name.trim() &&
    (recurrence !== 'weekly' || selectedDays.length > 0) &&
    (recurrence !== 'monthly' || dayOfMonth)

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit({ name: name.trim(), recurrence, recurrence_days: recurrence === 'weekly' ? selectedDays : [],
      recurrence_day_of_month: recurrence === 'monthly' ? parseInt(dayOfMonth) : null,
      due_date: recurrence === 'once' ? dueDate : null, assigned_to: assignedTo, note })
  }

  return (
    <>
      <FormField label="Nombre">
        <Input value={name} onChange={setName} placeholder="ej. Limpiar baño, Regar plantas..." />
      </FormField>

      <FormField label="Frecuencia">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[['once','📅 Una vez'],['daily','🔁 Diaria'],['weekly','📆 Semanal'],['monthly','🗓️ Mensual']].map(([val, label]) => (
            <button key={val} onClick={() => setRecurrence(val)} style={{
              padding: '7px 12px', borderRadius: 8, fontSize: 13,
              background: recurrence === val ? 'var(--black)' : 'var(--gray1)',
              color: recurrence === val ? 'white' : 'var(--gray4)',
              border: 'none', cursor: 'pointer', transition: 'all 0.12s',
            }}>{label}</button>
          ))}
        </div>
      </FormField>

      {recurrence === 'once' && (
        <FormField label="¿Para cuándo?">
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
            {dateOptions.map(opt => (
              <button key={opt.value} onClick={() => setDueDate(dueDate === opt.value ? null : opt.value)} style={{
                flexShrink: 0, padding: '7px 12px', borderRadius: 8, fontSize: 13, whiteSpace: 'nowrap',
                background: dueDate === opt.value ? 'var(--black)' : 'var(--gray1)',
                color: dueDate === opt.value ? 'white' : 'var(--gray4)',
                border: 'none', cursor: 'pointer',
              }}>{opt.label}</button>
            ))}
          </div>
        </FormField>
      )}

      {recurrence === 'weekly' && (
        <FormField label="Qué días">
          <div style={{ display: 'flex', gap: 5 }}>
            {DAYS.map(d => (
              <button key={d.value} onClick={() => toggleDay(d.value)} style={{
                flex: 1, padding: '7px 0', borderRadius: 7, fontSize: 11.5, fontWeight: 500,
                background: selectedDays.includes(d.value) ? 'var(--black)' : 'var(--gray1)',
                color: selectedDays.includes(d.value) ? 'white' : 'var(--gray4)',
                border: 'none', cursor: 'pointer',
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
          {[['both','🌿🌸 Las dos'],['Delfi','🌿 Delfi'],['Cande','🌸 Cande']].map(([val, label]) => (
            <button key={val} onClick={() => setAssignedTo(val)} style={{
              padding: '7px 12px', borderRadius: 8, fontSize: 13, flex: 1,
              background: assignedTo === val ? 'var(--black)' : 'var(--gray1)',
              color: assignedTo === val ? 'white' : 'var(--gray4)',
              border: 'none', cursor: 'pointer',
            }}>{label}</button>
          ))}
        </div>
      </FormField>

      <FormField label="Nota (opcional)">
        <Input value={note} onChange={setNote} placeholder="ej. mínimo 20 min..." />
      </FormField>

      <SubmitBtn onClick={handleSubmit} disabled={!canSubmit}>
        {initial.id ? 'Guardar cambios' : 'Agregar tarea'}
      </SubmitBtn>
    </>
  )
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function HomeScreen({
  currentUser, pendingTodayTasks, doneTodayTasks, getUpcoming, items,
  onAddTask, onCompleteTask, onUncompleteTask, onUpdateTask, onDeleteTask, onNavigate,
}) {
  const [showAdd, setShowAdd] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const upcoming = getUpcoming()
  const pendingItems = items.filter(i => !i.done).length

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
            display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
            borderRadius: 8, background: 'var(--gray1)', border: 'none',
            fontSize: 12.5, fontWeight: 500, color: 'var(--gray4)', cursor: 'pointer', marginTop: 4,
          }}>📋 Actividad</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 96px' }}>
        {/* Stats */}
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

        {/* Today tasks */}
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
            <div style={{ background: 'var(--white)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
              {pendingTodayTasks.map((task, i) => (
                <TaskRow key={task.id} task={task} done={false}
                  isLast={i === pendingTodayTasks.length - 1 && doneTodayTasks.length === 0}
                  onComplete={() => onCompleteTask(task.id)}
                  onEdit={() => setEditTask(task)}
                  onDelete={() => setConfirmDelete(task)} />
              ))}
              {doneTodayTasks.map((task, i) => (
                <TaskRow key={task.id} task={task} done={true}
                  isLast={i === doneTodayTasks.length - 1}
                  onComplete={() => onUncompleteTask(task.id)}
                  onEdit={() => setEditTask(task)}
                  onDelete={() => setConfirmDelete(task)} />
              ))}
            </div>
          )}
        </div>

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gray3)', display: 'block', marginBottom: 10 }}>Próximas</span>
            <div style={{ background: 'var(--white)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
              {upcoming.map(({ task, dayLabel, daysFrom }, i) => (
                <UpcomingRow key={`${task.id}-${daysFrom}`} task={task} dayLabel={dayLabel} daysFrom={daysFrom}
                  isLast={i === upcoming.length - 1}
                  onComplete={() => onCompleteTask(task.id)}
                  onEdit={() => setEditTask(task)}
                  onDelete={() => setConfirmDelete(task)} />
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

      {/* Add modal */}
      <ModalSheet open={showAdd} onClose={() => setShowAdd(false)}>
        <h2 style={{ fontFamily: 'Lora, serif', fontSize: 18, fontWeight: 500, marginBottom: 18 }}>Nueva tarea</h2>
        <TaskForm onSubmit={async (data) => { await onAddTask(data); setShowAdd(false) }} onClose={() => setShowAdd(false)} />
      </ModalSheet>

      {/* Edit modal */}
      <ModalSheet open={!!editTask} onClose={() => setEditTask(null)}>
        <h2 style={{ fontFamily: 'Lora, serif', fontSize: 18, fontWeight: 500, marginBottom: 18 }}>Editar tarea</h2>
        {editTask && <TaskForm key={editTask.id} initial={editTask}
          onSubmit={async (data) => { await onUpdateTask(editTask.id, data); setEditTask(null) }}
          onClose={() => setEditTask(null)} />}
      </ModalSheet>

      {/* Delete confirm */}
      <ModalSheet open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <h2 style={{ fontFamily: 'Lora, serif', fontSize: 18, fontWeight: 500, marginBottom: 8 }}>Eliminar tarea</h2>
        <p style={{ fontSize: 14, color: 'var(--gray4)', marginBottom: 20 }}>¿Eliminás "{confirmDelete?.name}"?</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: 12, background: 'var(--gray1)', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Cancelar</button>
          <button onClick={() => { onDeleteTask(confirmDelete.id); setConfirmDelete(null) }} style={{ flex: 1, padding: 12, background: '#E05252', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, color: 'white', cursor: 'pointer' }}>Eliminar</button>
        </div>
      </ModalSheet>
    </div>
  )
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
