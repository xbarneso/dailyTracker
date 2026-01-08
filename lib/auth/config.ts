import { NextAuthOptions } from "next-auth"
import { verifyUser } from "./mongodb"

// NextAuth v3 - Credentials provider implementation
// In NextAuth v3, we need to create our own provider
function CredentialsProvider(options: any) {
  return {
    id: "credentials",
    name: options.name || "Credentials",
    type: "credentials" as const,
    credentials: options.credentials || {},
    authorize: options.authorize, // Use the authorize function directly, don't wrap it
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'daily-tracker-secret-key-2024-change-in-production',
  // Removed explicit cookie configuration - let NextAuth use defaults
  // This should fix cookie issues in NextAuth v3
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Record<string, string> | undefined) {
        console.log('[NextAuth] authorize called')
        console.log('[NextAuth] credentials:', credentials ? JSON.stringify({ email: credentials.email, hasPassword: !!credentials.password }) : 'null')
        
        if (!credentials?.email || !credentials?.password) {
          console.log('[NextAuth] Missing credentials - returning null')
          return null
        }

        try {
          console.log('[NextAuth] Authorizing user:', credentials.email)
          
          const user = await verifyUser(credentials.email, credentials.password)
          console.log('[NextAuth] User verified:', user ? `yes (${user.id})` : 'no')
          
          if (!user) {
            console.log('[NextAuth] User not found or invalid password - returning null')
            return null
          }

          // Return a simple plain object
          return {
            id: user.id,
            email: user.email,
          }
        } catch (error: any) {
          console.error('[NextAuth] ERROR in authorize:', error)
          console.error('[NextAuth] Error message:', error.message)
          console.error('[NextAuth] Error stack:', error.stack)
          // Return null on error - NextAuth will handle it
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt(token, user) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    async session(session, token) {
      // Simplified session callback - always return valid object
      if (!session) {
        return {
          user: { email: null },
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      }
      
      if (!session.user) {
        session.user = { email: null } as any
      }
      
      if (token?.id) {
        (session.user as any).id = token.id
      }
      
      if (token?.email && !session.user.email) {
        (session.user as any).email = token.email
      }
      
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/api/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === 'development',
}
