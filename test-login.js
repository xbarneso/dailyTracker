const { verifyUser } = require('./lib/auth/mongodb')

async function testLogin() {
  try {
    console.log('Verificando credenciales...')
    const user = await verifyUser('xbarnesortega@gmail.com', 'pokemon.123')
    
    if (user) {
      console.log('✅ Credenciales correctas!')
      console.log('Usuario ID:', user.id)
      console.log('Email:', user.email)
    } else {
      console.log('❌ Credenciales incorrectas o usuario no existe')
    }
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    process.exit(0)
  }
}

testLogin()

