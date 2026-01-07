// Middleware disabled for Next.js 10 compatibility
// NextAuth v4 with Next.js 10 doesn't support middleware properly
// Route protection is handled in individual pages instead

export function middleware() {
  // No-op middleware for Next.js 10
}

export const config = {
  matcher: [],
}
