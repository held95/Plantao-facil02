import type { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { authUserRepository } from '../repositories/authRepository';
import { loginLimiter } from '../utils/rateLimit';

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        if (loginLimiter) {
          const ip =
            (req as { headers?: Record<string, string> })?.headers?.['x-forwarded-for']
              ?.split(',')[0] ?? '127.0.0.1';
          const { success } = await loginLimiter.limit(ip);
          if (!success) throw new Error('TooManyRequests');
        }

        const user = await authUserRepository.findByEmail(credentials.email as string);
        if (!user) {
          return null;
        }

        if (user.status === 'pendente_aprovacao') {
          throw new Error('PENDING_APPROVAL');
        }

        if (user.status === 'rejeitado') {
          throw new Error('ACCOUNT_REJECTED');
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );
        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          name: user.nome,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
};
