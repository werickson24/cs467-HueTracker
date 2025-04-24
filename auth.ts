import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
//import postgres from 'postgres';
import { z } from 'zod';
import type { User } from '@/src/app/lib/definitions';
import { authConfig } from './auth.config';

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.POSTGRES_URL!);

async function getUser(email: string): Promise<User | undefined> {
  try {
    const result = await sql.query(
      `SELECT id, name, email, password FROM users WHERE email = $1`,
      [email]
    );
    return <User>result[0] || undefined;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;

          const user = await getUser(email);
          if (!user) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }

        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
});