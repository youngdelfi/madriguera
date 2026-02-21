import React, { useState } from 'react'
import { BottomNav, activityIcon, activityText, dayLabel, ModalSheet, FormField, SubmitBtn } from './components'

export default function ActivityScreen({ activity, onNavigate, onSendFeedback }) {
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSend() {
    if (!feedbackText.trim()) return
    await onSendFeedback(feedbackText.trim())
    setSent(true)
    setTimeout(() => { setFeedbackText(''); setSent(false); setShowFeedback(false) }, 1000)
  }

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
        <div style={{ paddingBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontFamily: 'Lora, serif', fontSize: 22, fontWeight: 500, color: 'var(--black)' }}>Actividad</h1>
          <button
            onClick={() => setShowFeedback(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 12px', borderRadius: 8,
              background: 'var(--gray1)', border: 'none',
              fontSize: 12.5, fontWeight: 500, color: 'var(--gray4)', cursor: 'pointer',
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--gray2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--gray1)'}
          >
            💬 Feedback
          </button>
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

      <ModalSheet open={showFeedback} onClose={() => setShowFeedback(false)}>
        <h2 style={{ fontFamily: 'Lora, serif', fontSize: 18, fontWeight: 500, marginBottom: 6 }}>Dejar feedback 💬</h2>
        <p style={{ fontSize: 13, color: 'var(--gray4)', marginBottom: 18 }}>Contanos qué falta, qué está roto o qué mejorarías.</p>
        <FormField label="Tu mensaje">
          <textarea
            value={feedbackText}
            onChange={e => setFeedbackText(e.target.value)}
            placeholder="ej. Me gustaría poder reordenar los lugares..."
            rows={4}
            style={{
              width: '100%', background: 'var(--gray1)', border: '1px solid transparent',
              borderRadius: 8, padding: '10px 12px', fontSize: 14, color: 'var(--black)',
              resize: 'none', outline: 'none', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5,
            }}
            onFocus={e => { e.target.style.background = 'var(--white)'; e.target.style.borderColor = 'rgba(26,26,26,0.15)' }}
            onBlur={e => { e.target.style.background = 'var(--gray1)'; e.target.style.borderColor = 'transparent' }}
          />
        </FormField>
        <SubmitBtn onClick={handleSend} disabled={!feedbackText.trim()}>
          {sent ? '✓ Enviado' : 'Enviar feedback'}
        </SubmitBtn>
      </ModalSheet>
    </div>
  )
}
