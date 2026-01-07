# Daily Tracker - Seguimiento de Hábitos

Aplicación web moderna para el seguimiento de hábitos diarios, semanales y mensuales con tema selva/jungle.

## Características

- ✅ Autenticación con NextAuth.js
- 🌿 Gestión de hábitos (crear, editar, eliminar)
- 📊 Métricas y gráficos de progreso
- 📧 Notificaciones por email (Resend)
- 🎨 Diseño moderno con tema selva
- 📱 Responsive design
- 📤 Exportación de datos (CSV/JSON)

## Tecnologías

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (PostgreSQL)
- **NextAuth.js** (Autenticación)
- **Resend** (Emails)
- **Recharts** (Gráficos)

## Configuración

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Resend
RESEND_API_KEY=your_resend_api_key

# Vercel Cron (opcional, para producción)
CRON_SECRET=your_cron_secret
```

### 2. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Obtén las claves de API desde el dashboard
3. Ejecuta el script SQL en `supabase/schema.sql` en el SQL Editor de Supabase

### 3. Configurar Resend

1. Crea una cuenta en [Resend](https://resend.com)
2. Obtén tu API key
3. Verifica tu dominio (o usa el dominio de prueba para desarrollo)

### 4. Instalar Dependencias

```bash
npm install
```

### 5. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Despliegue en Vercel

1. Conecta tu repositorio a Vercel
2. Agrega las variables de entorno en la configuración de Vercel
3. Configura el cron job en `vercel.json` (se ejecuta diariamente a las 9 AM)
4. Despliega

### Configurar Cron en Vercel

El cron job está configurado en `vercel.json` para ejecutarse diariamente. Asegúrate de:

1. Agregar `CRON_SECRET` como variable de entorno en Vercel
2. Configurar el cron job en el dashboard de Vercel (si es necesario)

## Estructura del Proyecto

```
DailyTracker/
├── app/
│   ├── (auth)/          # Páginas de autenticación
│   ├── (dashboard)/     # Páginas del dashboard
│   ├── api/             # API routes
│   └── layout.tsx        # Layout principal
├── components/          # Componentes React
├── lib/                 # Utilidades y configuraciones
├── types/               # Tipos TypeScript
└── supabase/            # Scripts SQL
```

## Uso

1. **Registro/Login**: Crea una cuenta o inicia sesión
2. **Crear Hábitos**: Ve a "Hábitos" y crea tus hábitos diarios, semanales o mensuales
3. **Completar Hábitos**: Marca los hábitos como completados desde el dashboard
4. **Ver Métricas**: Revisa tus estadísticas y gráficos en "Métricas"
5. **Configurar Notificaciones**: Ajusta las preferencias de email en "Configuración"

## Licencia

ISC

