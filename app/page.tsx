import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <h1>Humor Project Admin</h1>
      <p>Use Google login, then access the protected admin area.</p>
      <div className="row">
        <Link href="/login">Login</Link>
        <Link href="/admin">Admin</Link>
      </div>
    </main>
  );
}
