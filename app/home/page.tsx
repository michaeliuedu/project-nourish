"use client";

import { useSession } from "next-auth/react";
import Header from "../ui/header";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <Header name={session?.user?.name ? `${session.user.name}!` : undefined} />
  );
}
