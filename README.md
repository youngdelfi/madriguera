# 🐇 Madriguera

Lista de compras compartida. React PWA + Supabase Realtime.

## Setup rápido

### 1. Supabase
1. Creá un proyecto en supabase.com (free tier)
2. Ejecutá `supabase-schema.sql` en el SQL Editor
3. Copiá tu Project URL y anon key

### 2. .env
```
REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=tu-anon-key
```

### 3. Correr
```bash
npm install
npm start       # dev
npm run build   # producción
```

### Deploy
- Netlify: arrastrá la carpeta /build
- Vercel: vercel --prod

**Sin Supabase:** la app funciona en modo demo con datos locales.
