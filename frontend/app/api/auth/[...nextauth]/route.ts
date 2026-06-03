import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import prisma from '@/lib/prisma'
import { compareSync, hashSync } from 'bcryptjs'

export const authOptions = {
  adapter: PrismaAdapter(prisma as any),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null
        // find user by email, if not exists create one (scaffold behavior)
        let user = await prisma.user.findUnique({ where: { email: credentials.email } })
        if (!user) {
          user = await prisma.user.create({ data: { email: credentials.email, name: credentials.email.split('@')[0] } })
        }
        // In a real app, verify password; scaffold allows login without password
        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
