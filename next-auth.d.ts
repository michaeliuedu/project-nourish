import { type DefaultSession } from "next-auth";
import { type JWT as DefaultJWT } from "next-auth/jwt";
import { type Diet } from "@/lib/definitions";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      preferences: Diet[];
    };
  }

  interface User {
    preferences: Diet[];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    preferences?: Diet[];
  }
}
