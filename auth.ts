import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { z } from "zod";
import type { User } from "@/lib/definitions";
import bcrypt from "bcrypt";
import sql from "@/lib/db";

async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User[]>`SELECT * FROM users WHERE email=${email}`;
    return user[0];
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user.");
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        // persist key user fields into the token so session callback can expose them
        token.preferences = (user as any).preferences;
        token.email = (user as any).email;
        token.name = (user as any).name;
        token.id = (user as any).id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.preferences = token.preferences ?? [];
        // ensure email/name/id are present on the session user for server usage
        session.user.email = token.email ?? session.user.email;
        session.user.name = token.name ?? session.user.name;
        (session.user as any).id = token.id ?? (session.user as any).id;
      }

      return session;
    },
  },
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

          const passwordMatch = await bcrypt.compare(password, user.password);
          if (passwordMatch) return user;
        }

        return null;
      },
    }),
  ],
});
