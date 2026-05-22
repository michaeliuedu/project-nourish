"use client";

import "./header.css";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

type HeaderProps = {
  name?: string;
} & React.HTMLAttributes<HTMLElement>;

export default function Header({ name, className, ...props }: HeaderProps) {
  const { data: session } = useSession();
  const displayName = name ?? session?.user?.name ?? "Guest";
  const [signOutMessage, setSignOutMessage] = useState("Sign out");

  async function handleSignOut() {
    setSignOutMessage("Signing out...");
    try {
      await signOut();
    } finally {
      setSignOutMessage("Sign out");
    }
  }

  return (
    <header {...props} className={className ? `header ${className}` : "header"}>
      <div className="header-inner">
        <div className="header-left">
          <h1>{`Welcome ${displayName}`}</h1>
          <nav>
            <Link className="header-link" href="/home">
              Home
            </Link>
            <Link className="header-link" href="/create">
              Profile
            </Link>
            <Link
              className="header-link"
              onClick={(e) => handleSignOut()}
              href="#"
            >
              {signOutMessage}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
