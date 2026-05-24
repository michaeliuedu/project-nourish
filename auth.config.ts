import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const is_logged = !!auth?.user;
      const is_home = nextUrl.pathname.startsWith("/home");
      const is_post = nextUrl.pathname.startsWith("/post");
      const is_login = nextUrl.pathname.startsWith("/login");
      const is_register = nextUrl.pathname.startsWith("/register");

      if (is_home || is_post) return is_logged;

      if (is_login || is_register) {
        if (is_logged) return Response.redirect(new URL("/home", nextUrl));
        return true;
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
