import Link from "next/link";
import { ButtonLink, Card } from "@/components/ui";

export default function HomePage() {
  return (
    <main className="page-shell">
      <Card className="hero" scanlines>
        <span className="eyebrow">Neon Terminal Control Surface</span>
        <div className="stack-tight">
          <h1>Humor Project Admin</h1>
          <p>
            Review authentication, monitor dataset health, and move between the protected control panels without
            the default barebones shell.
          </p>
        </div>
        <div className="cluster">
          <ButtonLink href="/login">Open Login</ButtonLink>
          <ButtonLink href="/admin" variant="secondary">
            Enter Admin
          </ButtonLink>
        </div>
      </Card>

      <section className="surface-grid">
        <Card>
          <div className="stack-tight">
            <span className="eyebrow">Access Flow</span>
            <h2>Protected routes stay behind Google auth</h2>
            <p>
              Use the login route to initiate OAuth, then return to the terminal to inspect profiles, images, and
              captions.
            </p>
          </div>
        </Card>

        <Card>
          <div className="stack-tight">
            <span className="eyebrow">Quick Links</span>
            <div className="admin-nav">
              <Link href="/login">Authentication</Link>
              <Link href="/admin">Dashboard</Link>
              <Link href="/admin/profiles">Profiles</Link>
              <Link href="/admin/captions">Captions</Link>
              <Link href="/admin/images">Images</Link>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
