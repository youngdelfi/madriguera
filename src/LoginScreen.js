import React, { useState } from 'react'
import { supabase } from './supabase'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    if (!email.trim()) return
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true },
    })
    setLoading(false)
    if (error) {
      setError('Algo salió mal. Revisá el mail e intentá de nuevo.')
    } else {
      setSent(true)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div style={{
      width: '100%', maxWidth: 430, height: '100%',
      margin: '0 auto', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 32px',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 12, lineHeight: 1 }}>🏠</div>
        <h1 style={{ fontFamily: 'Lora, serif', fontSize: 26, fontWeight: 500, color: 'var(--black)', margin: 0 }}>
          Madriguera
        </h1>
        <p style={{ fontSize: 13, color: 'var(--gray3)', marginTop: 6 }}>el nido de Delfi y Cande</p>
      </div>

      {!sent ? (
        <div style={{ width: '100%' }}>
          <p style={{ fontSize: 14, color: 'var(--gray4)', marginBottom: 20, textAlign: 'center', lineHeight: 1.6 }}>
            Ingresá tu mail y te mandamos un link para entrar.
          </p>

          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={handleKey}
            placeholder="tu@mail.com"
            autoComplete="email"
            style={{
              width: '100%', padding: '13px 14px',
              background: 'var(--white)',
              border: '1px solid var(--border)',
              borderRadius: 10, fontSize: 15,
              color: 'var(--black)', outline: 'none',
              fontFamily: 'DM Sans, sans-serif',
              boxSizing: 'border-box',
              marginBottom: 10,
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />

          {error && (
            <p style={{ fontSize: 12.5, color: 'var(--red)', marginBottom: 10, textAlign: 'center' }}>{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={!email.trim() || loading}
            style={{
              width: '100%', padding: 14,
              background: (!email.trim() || loading) ? 'var(--gray2)' : 'var(--black)',
              border: 'none', borderRadius: 10,
              fontSize: 14, fontWeight: 600,
              color: (!email.trim() || loading) ? 'var(--gray3)' : 'white',
              cursor: (!email.trim() || loading) ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            {loading ? 'Enviando...' : 'Entrar'}
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📬</div>
          <h2 style={{ fontFamily: 'Lora, serif', fontSize: 20, fontWeight: 500, marginBottom: 10 }}>
            Revisá tu mail
          </h2>
          <p style={{ fontSize: 14, color: 'var(--gray4)', lineHeight: 1.6 }}>
            Te mandamos un link a <strong>{email}</strong>.<br />
            Tocalo para entrar a Madriguera.
          </p>
          <button
            onClick={() => { setSent(false); setEmail('') }}
            style={{
              marginTop: 24, fontSize: 13, color: 'var(--gray3)',
              background: 'none', border: 'none', cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Usar otro mail
          </button>
        </div>
      )}
    </div>
  )
}
