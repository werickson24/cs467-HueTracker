/*
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/prisma";
import * as bcrypt from "bcrypt";
*/

import NextAuth from "next-auth"
import Passkey from "next-auth/providers/passkey"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "../generated/prisma/client"
 
const prisma = new PrismaClient()
 
export const { 
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Passkey],
  experimental: { enableWebAuthn: true },
})

/*export default {
  adapter: PrismaAdapter(prisma),
  providers: [Passkey],
  experimental: { enableWebAuthn: true },
}*/

/*
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import * as bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" }, // Add this for registration
        action: { label: "Action", type: "text" } // Login or Register
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const action = credentials.action;

        if (action === 'register') {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          });

          if (existingUser) {
            throw new Error('User already exists');
          }

          // Create new user
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          const user = await prisma.user.create({
            data: {
              email: credentials.email,
              password: hashedPassword,
              name: credentials.name || null,
            }
          });

          return {
            id: user.id,
            email: user.email || "",
            name: user.name,
          };
        }

        // Login flow
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password!
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email || "",
          name: user.name,
        };
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login",
  },
};*/