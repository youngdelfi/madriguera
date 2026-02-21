import React from 'react'

// ─── Color map ────────────────────────────────────────────────────────────────
export const COLOR = {
  blue:  { dot: '#4A7FA5', soft: '#E8F0F7', text: '#4A7FA5' },
  green: { dot: '#4A9E6B', soft: '#E6F4EC', text: '#4A9E6B' },
  amber: { dot: '#C47C3A', soft: '#FBF0E4', text: '#C47C3A' },
  gray:  { dot: '#B0AFA8', soft: '#F1F1EF', text: '#6B6B65' },
  red:   { dot: '#C4503A', soft: '#FBEAE8', text: '#C4503A' },
}

// ─── Relative time ────────────────────────────────────────────────────────────
export function relativeTime(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return 'ahora'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`
  if (diff < 86400 * 2) return 'ayer'
  return new Date(dateStr).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

export function dayLabel(dateStr) {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Hoy'
  if (d.toDateString() === yesterday.toDateString()) return 'Ayer'
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────
export function Checkbox({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      style={{
        width: 20, height: 20,
        borderRadius: 5,
        border: checked ? 'none' : '1.5px solid var(--gray2)',
        background: checked ? 'var(--green)' : 'var(--white)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 0.15s',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      {checked && <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
        <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>}
    </button>
  )
}

// ─── BottomNav ────────────────────────────────────────────────────────────────
export function BottomNav({ screen, onNavigate }) {
  const tabs = [
    { id: 'home', icon: '🏠', label: 'Inicio' },
    { id: 'activity', icon: '📋', label: 'Actividad' },
    { id: 'settings', icon: '⚙️', label: 'Lugares' },
  ]
  return (
    <nav style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      background: 'rgba(247,247,245,0.92)',
      backdropFilter: 'blur(12px)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      padding: '8px 0 max(16px, env(safe-area-inset-bottom))',
      zIndex: 20,
    }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onNavigate(tab.id)}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            background: 'none', border: 'none', padding: '4px 0', cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 18, opacity: screen === tab.id ? 1 : 0.35, lineHeight: 1 }}>{tab.icon}</span>
          <span style={{
            fontSize: 10, fontWeight: screen === tab.id ? 600 : 500,
            color: screen === tab.id ? 'var(--black)' : 'var(--gray3)',
            letterSpacing: '0.02em',
          }}>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}

// ─── FAB ─────────────────────────────────────────────────────────────────────
export function FAB({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute', bottom: 76, right: 18,
        width: 48, height: 48,
        background: 'var(--black)',
        border: 'none', borderRadius: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontSize: 22,
        boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
        zIndex: 10,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
    >
      +
    </button>
  )
}

// ─── IconBtn ──────────────────────────────────────────────────────────────────
export function IconBtn({ children, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 32, height: 32, borderRadius: 8,
        background: 'var(--gray1)', border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, cursor: 'pointer', color: 'var(--gray4)',
        transition: 'background 0.12s, color 0.12s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--gray2)'; e.currentTarget.style.color = 'var(--black)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--gray1)'; e.currentTarget.style.color = 'var(--gray4)' }}
    >
      {children}
    </button>
  )
}

// ─── Modal sheet ──────────────────────────────────────────────────────────────
export function ModalSheet({ open, onClose, children }) {
  if (!open) return null
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      background: 'rgba(26,26,26,0.15)',
      backdropFilter: 'blur(2px)',
      animation: 'fadeIn 0.15s ease',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--white)',
          borderRadius: '20px 20px 0 0',
          padding: '16px 18px max(32px, env(safe-area-inset-bottom))',
          borderTop: '1px solid var(--border)',
          boxShadow: '0 -4px 40px rgba(0,0,0,0.08)',
          animation: 'slideUp 0.2s ease',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ width: 32, height: 3, background: 'var(--gray2)', borderRadius: 2, margin: '0 auto 18px' }} />
        {children}
      </div>
    </div>
  )
}

// ─── Form field ───────────────────────────────────────────────────────────────
export function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gray3)', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

export function Input({ value, onChange, placeholder, style = {} }) {
  const [focused, setFocused] = React.useState(false)
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: '100%',
        background: focused ? 'var(--white)' : 'var(--gray1)',
        border: `1px solid ${focused ? 'rgba(26,26,26,0.15)' : 'transparent'}`,
        borderRadius: 8,
        padding: '10px 12px',
        fontSize: 14, fontWeight: 400, color: 'var(--black)',
        outline: 'none',
        boxShadow: focused ? '0 0 0 3px rgba(74,127,165,0.1)' : 'none',
        transition: 'all 0.12s',
        ...style,
      }}
    />
  )
}

export function SubmitBtn({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', padding: 13,
        background: disabled ? 'var(--gray2)' : 'var(--black)',
        border: 'none', borderRadius: 10,
        fontSize: 14, fontWeight: 600, color: disabled ? 'var(--gray3)' : 'white',
        cursor: disabled ? 'not-allowed' : 'pointer',
        marginTop: 8,
        transition: 'all 0.15s',
        letterSpacing: '0.01em',
      }}
    >
      {children}
    </button>
  )
}

// ─── Activity icon ────────────────────────────────────────────────────────────
export function activityIcon(type) {
  return { add: '➕', check: '✅', delete: '🗑️', note: '✏️', new_place: '🆕', uncheck: '↩️' }[type] || '•'
}

export function activityText(entry) {
  switch (entry.type) {
    case 'add':
      const places = (entry.place_names || []).join(' y ')
      return <><strong>{entry.user_name}</strong> agregó <Chip>{entry.item_name}</Chip> {places ? `a ${places}` : ''}</>
    case 'check':
      return <><strong>{entry.user_name}</strong> tachó <Chip>{entry.item_name}</Chip>{entry.place_name ? ` en ${entry.place_name}` : ''}</>
    case 'delete':
      return <><strong>{entry.user_name}</strong> eliminó <Chip>{entry.item_name}</Chip></>
    case 'note':
      return <><strong>{entry.user_name}</strong> editó las notas de <Chip>{entry.item_name}</Chip></>
    case 'new_place':
      return <><strong>{entry.user_name}</strong> creó el lugar <Chip>{entry.item_name}</Chip></>
    default:
      return <><strong>{entry.user_name}</strong> {entry.item_name}</>
  }
}

function Chip({ children }) {
  return <span style={{ background: 'var(--gray1)', borderRadius: 4, padding: '1px 6px', fontSize: 12, fontWeight: 500 }}>{children}</span>
}

// ─── Animations ───────────────────────────────────────────────────────────────
const styleTag = document.createElement('style')
styleTag.textContent = `
  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
  @keyframes slideUp { from { transform: translateY(24px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
  @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.4 } }
`
document.head.appendChild(styleTag)
