# Configuración con MongoDB Atlas (GRATIS)

## Paso 1: Crear cuenta en MongoDB Atlas

1. Ve a [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Haz clic en "Try Free"
3. Crea una cuenta (es gratis)
4. Selecciona el plan "Free" (M0)

## Paso 2: Crear un Cluster

1. Selecciona "Build a Database"
2. Elige "FREE" (M0 Sandbox)
3. Selecciona una región cercana a ti
4. Dale un nombre al cluster (ej: "Cluster0")
5. Haz clic en "Create"

## Paso 3: Crear Usuario de Base de Datos

1. En "Database Access", haz clic en "Add New Database User"
2. Elige "Password" como método de autenticación
3. Crea un usuario y contraseña (guárdalos)
4. Dale permisos de "Read and write to any database"
5. Haz clic en "Add User"

## Paso 4: Configurar Acceso de Red

1. En "Network Access", haz clic en "Add IP Address"
2. Haz clic en "Allow Access from Anywhere" (0.0.0.0/0)
3. O agrega tu IP específica
4. Haz clic en "Confirm"

## Paso 5: Obtener Connection String

1. Ve a "Database" y haz clic en "Connect"
2. Selecciona "Connect your application"
3. Elige "Node.js" y la versión más reciente
4. Copia la connection string (se ve así: `mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
5. Reemplaza `<password>` con tu contraseña de usuario

## Paso 6: Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# MongoDB
MONGODB_URI=mongodb+srv://usuario:tu_password@cluster0.xxxxx.mongodb.net/habittracker?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=un_secreto_aleatorio_aqui

# Resend (opcional, para emails)
RESEND_API_KEY=tu_resend_key
```

## Paso 7: Reiniciar el Servidor

```bash
npm run dev
```

¡Listo! Ahora puedes registrarte e iniciar sesión.

