/*import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";  // Using relative path

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers*/

import { GET, POST } from "@/lib/auth"

export { GET, POST }