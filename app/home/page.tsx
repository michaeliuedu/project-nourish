"use client";

import { useSession } from "next-auth/react";
import Header from "../ui/header";
import HomeFeed from "./home-feed";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <main>
      <Header name={session?.user?.name ? `${session.user.name}` : undefined} />
      <HomeFeed />
    </main>
  );
}
