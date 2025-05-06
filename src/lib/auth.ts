//gemini commented version
import NextAuth from "next-auth"
import Passkey from "next-auth/providers/passkey"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "../generated/prisma/client" // Adjust path if needed

const prisma = new PrismaClient()

// This is your main configuration object
const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [Passkey],
  experimental: { enableWebAuthn: true },
  // Add any other options you need here: session strategy, callbacks, etc.
}

export const {
  handlers: { GET, POST },
  auth, // <-- This is the function you need for server-side session access!
  signIn,
  signOut,
} = NextAuth(authOptions) // Pass your config object here
