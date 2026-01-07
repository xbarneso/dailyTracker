# Guía de Configuración Rápida

## Paso 1: Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Ve a Settings > API y copia:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`
4. Ve a SQL Editor y ejecuta el contenido de `supabase/schema.sql`

## Paso 2: Configurar Resend

1. Ve a [resend.com](https://resend.com) y crea una cuenta
2. Ve a API Keys y crea una nueva clave
3. Copia la clave → `RESEND_API_KEY`
4. Para desarrollo, puedes usar el dominio de prueba de Resend

## Paso 3: Configurar NextAuth

1. Genera un secreto seguro (puedes usar: `openssl rand -base64 32`)
2. Agrega a `.env.local`:
   - `NEXTAUTH_URL=http://localhost:3000` (o tu URL de producción)
   - `NEXTAUTH_SECRET=tu_secreto_generado`

## Paso 4: Variables de Entorno Completas

Crea `.env.local` con:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu_secreto_generado

# Resend
RESEND_API_KEY=re_tu_api_key

# Vercel Cron (solo para producción)
CRON_SECRET=otro_secreto_para_cron
```

## Paso 5: Instalar y Ejecutar

```bash
npm install
npm run dev
```

## Paso 6: Crear tu Primera Cuenta

1. Ve a `http://localhost:3000`
2. Haz clic en "Regístrate"
3. Crea tu cuenta
4. ¡Comienza a crear hábitos!

## Despliegue en Vercel

1. Conecta tu repositorio GitHub a Vercel
2. Agrega todas las variables de entorno en Vercel
3. Configura el dominio personalizado (opcional)
4. Despliega

El cron job se ejecutará automáticamente cada día a las 9 AM (configurado en `vercel.json`).

