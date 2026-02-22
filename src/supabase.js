import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key'

// Custom storage using cookies for PWA compatibility
const cookieStorage = {
  getItem: (key) => {
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [k, v] = cookie.trim().split('=')
      if (k === key) {
        try { return decodeURIComponent(v) } catch { return v }
      }
    }
    return null
  },
  setItem: (key, value) => {
    // 30 days
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString()
    document.cookie = `${key}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
  },
  removeItem: (key) => {
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
  },
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    storageKey: 'madriguera-auth',
    storage: cookieStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
})
