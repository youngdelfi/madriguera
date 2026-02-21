import React from 'react'
import { BottomNav, activityIcon, activityText, dayLabel } from './components'

export default function ActivityScreen({ activity, onNavigate }) {
  // Group by day
  const grouped = []
  let currentDay = null

  ;[...activity].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).forEach(entry => {
    const label = dayLabel(entry.created_at)
    if (label !== currentDay) {
      grouped.push({ type: 'header', label })
      currentDay = label
    }
    grouped.push({ type: 'entry', entry })
  })

  const avatarColors = { '🌸': '#F5E8F0', '🌿': '#E6F4EC', '🌻': '#FBF0E4', '🐇': '#E8F0F7' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <div style={{ padding: '14px 18px 0' }}>
        <div style={{ paddingBottom: 14 }}>
          <h1 style={{ fontFamily: 'Lora, serif', fontSize: 22, fontWeight: 500, color: 'var(--black)' }}>Actividad</h1>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 96px' }}>
        {activity.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--gray3)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
            <p style={{ fontFamily: 'Lora, serif', fontSize: 16, fontWeight: 500, marginBottom: 6 }}>Sin actividad aún</p>
            <p style={{ fontSize: 13 }}>Las acciones de la lista aparecerán acá</p>
          </div>
        )}

        {grouped.map((row, i) => {
          if (row.type === 'header') {
            return (
              <p key={i} style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gray3)', padding: '14px 0 6px' }}>
                {row.label}
              </p>
            )
          }
          const { entry } = row
          const bg = avatarColors[entry.user_emoji] || 'var(--gray1)'

          return (
            <div
              key={entry.id}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '10px 0', borderBottom: '1px solid var(--border)',
              }}
            >
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, flexShrink: 0,
              }}>
                {entry.user_emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--black)', lineHeight: 1.45 }}>
                  {activityText(entry)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--gray3)', marginTop: 3 }}>
                  {new Date(entry.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div style={{ fontSize: 14, marginTop: 1, opacity: 0.55 }}>
                {activityIcon(entry.type)}
              </div>
            </div>
          )
        })}
      </div>

      <BottomNav screen="activity" onNavigate={onNavigate} />
    </div>
  )
}
