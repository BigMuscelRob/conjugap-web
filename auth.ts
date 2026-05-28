import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { authConfig } from './auth.config';

declare module 'next-auth' {
  interface Session {
    user: { id: string } & import('next-auth').DefaultSession['user'];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma as any),
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token['id'] = user.id;
      return token;
    },
    async session({ session, token }) {
      session.user.id = token['id'] as string;
      return session;
    },
  },
});
