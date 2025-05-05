import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    password?: string;
  }
}