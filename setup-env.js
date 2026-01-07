const fs = require('fs')
const path = require('path')

const envContent = `# MongoDB Atlas
MONGODB_URI=mongodb+srv://xbarnesortega:pokemon%2E123@cluster0.7eh5p62.mongodb.net/habittracker?retryWrites=true&w=majority&appName=Cluster0

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=daily-tracker-secret-key-2024-change-in-production

# Resend (opcional, para emails)
RESEND_API_KEY=
`

const envPath = path.join(__dirname, '.env.local')

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent)
  console.log('✅ Archivo .env.local creado exitosamente!')
} else {
  // Update existing file
  fs.writeFileSync(envPath, envContent)
  console.log('✅ Archivo .env.local actualizado!')
}
