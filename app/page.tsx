import Link from "next/link";

export default function Page() {
  return (
    <main style={{ maxWidth: 640, margin: "3rem auto", padding: "0 1rem" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>Nourish</h1>
      <p style={{ marginTop: 0, marginBottom: "1.25rem" }}>
        Welcome. Log in to continue or create a new account.
      </p>

      <div style={{ display: "flex", gap: "0.75rem" }}>
        <Link href="/login">Login</Link>
        <Link href="/register">Sign up</Link>
      </div>
    </main>
  );
}
