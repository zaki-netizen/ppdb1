import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('[AUTH] Missing credentials');
          return null;
        }
        console.log('[AUTH] Login:', credentials.email);

        try {
          const user = await db.query.users.findFirst({
            where: eq(users.email, credentials.email as string),
          });

          if (!user) {
            console.log('[AUTH] User not found:', credentials.email);
            return null;
          }

          if (!user.password_hash) {
            console.log('[AUTH] No password hash:', credentials.email);
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password as string, user.password_hash);
          if (!isValid) {
            console.log('[AUTH] Invalid password:', credentials.email);
            return null;
          }

          console.log('[AUTH] Success:', user.email, 'role:', user.role);
          return {
            id: String(user.id),
            email: user.email,
            name: user.full_name,
            role: user.role,
          };
        } catch (e) {
          console.error('[AUTH] Error:', e);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log('[JWT] token:', token);
      if (user) {
        token.id = String(user.id);
        token.email = user.email;
        token.name = user.name;
        token.role = (user as any).role;
        console.log('[JWT] Set role:', token.role);
      }
      return token;
    },
    async session({ session, token }) {
      console.log('[SESSION] token:', JSON.stringify(token));
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        console.log('[SESSION] Done, role:', token.role);
      }
      return session;
    },
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
});
