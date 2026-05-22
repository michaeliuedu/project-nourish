import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const is_logged = !!auth?.user;
      const is_home = nextUrl.pathname.startsWith("/home");

      if (is_home) return is_logged;
      else if (is_logged) return Response.redirect(new URL("/home", nextUrl));
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
