import Link from "next/link";
import { Button, Card } from "@/components/ui";
import { requireSuperAdmin } from "@/lib/auth/guards";

const navLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/images", label: "Images" },
  { href: "/admin/humor-flavors", label: "Humor Flavors" },
  { href: "/admin/humor-flavor-steps", label: "Flavor Steps" },
  { href: "/admin/humor-mix", label: "Humor Mix" },
  { href: "/admin/terms", label: "Terms" },
  { href: "/admin/captions", label: "Captions" },
  { href: "/admin/caption-requests", label: "Caption Requests" },
  { href: "/admin/caption-examples", label: "Caption Examples" },
  { href: "/admin/llm-providers", label: "LLM Providers" },
  { href: "/admin/llm-models", label: "LLM Models" },
  { href: "/admin/llm-prompt-chains", label: "Prompt Chains" },
  { href: "/admin/llm-responses", label: "LLM Responses" },
  { href: "/admin/allowed-signup-domains", label: "Signup Domains" },
  { href: "/admin/whitelist-email-addresses", label: "Whitelisted Emails" }
];

async function signOut() {
  "use server";
  const { supabase } = await requireSuperAdmin();
  await supabase.auth.signOut();
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireSuperAdmin();

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Card className="stack-tight" scanlines>
          <span className="eyebrow">Admin Area</span>
          <h2>Control Terminal</h2>
          <p>Full operational surface for the humor application.</p>
          <small>{user.email}</small>
        </Card>

        <Card className="stack-tight">
          <nav className="admin-sidebar-nav" aria-label="Admin resources">
            {navLinks.map((link) => (
              <Link href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
          <form action={signOut}>
            <Button type="submit" variant="secondary">
              Sign out
            </Button>
          </form>
        </Card>
      </aside>

      <div className="admin-content">{children}</div>
    </main>
  );
}
