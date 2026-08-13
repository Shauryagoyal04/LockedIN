import type { NextAuthConfig } from 'next-auth'

// Edge-safe config — no bcryptjs, no Prisma.
// Used by middleware for session checks only.
export const authConfig: NextAuthConfig = {
  providers: [],
  pages: { signIn: '/login' },
  callbacks: {
    authorized({ auth }) {
      return !!auth
    },
  },
}
