import NextAuth, { type NextAuthOptions } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import { prisma } from '@/lib/prisma'
import { env } from '@/lib/env'

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      authorization: { params: { scope: 'read:user user:email repo' } },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account || account.provider !== 'github') return false
      await prisma.user.upsert({
        where: { githubId: String(account.providerAccountId) },
        update: { name: user.name, email: user.email, image: user.image },
        create: {
          githubId: String(account.providerAccountId),
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
      return true
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        const dbUser = await prisma.user.findUnique({ where: { githubId: token.sub } })
        if (dbUser) session.user.id = dbUser.id
      }
      return session
    },
    async jwt({ token, account }) {
      if (account?.provider === 'github') token.sub = String(account.providerAccountId)
      return token
    },
  },
  pages: { signIn: '/login' },
}

export default NextAuth(authOptions)
