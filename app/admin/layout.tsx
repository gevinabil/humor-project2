import Link from "next/link";
import { Button, Card } from "@/components/ui";
import { requireSuperAdmin } from "@/lib/auth/guards";

const navGroups = [
  {
    title: "Overview",
    links: [{ href: "/admin", label: "Dashboard" }]
  },
  {
    title: "People",
    links: [
      { href: "/admin/users", label: "Users" },
      { href: "/admin/allowed-signup-domains", label: "Signup Domains" },
      { href: "/admin/whitelist-email-addresses", label: "Whitelisted Emails" }
    ]
  },
  {
    title: "Content",
    links: [
      { href: "/admin/images", label: "Images" },
      { href: "/admin/captions", label: "Captions" },
      { href: "/admin/caption-requests", label: "Caption Requests" },
      { href: "/admin/caption-examples", label: "Caption Examples" }
    ]
  },
  {
    title: "Humor System",
    links: [
      { href: "/admin/humor-flavors", label: "Humor Flavors" },
      { href: "/admin/humor-flavor-steps", label: "Flavor Steps" },
      { href: "/admin/humor-mix", label: "Humor Mix" },
      { href: "/admin/terms", label: "Terms" }
    ]
  },
  {
    title: "LLM",
    links: [
      { href: "/admin/llm-providers", label: "LLM Providers" },
      { href: "/admin/llm-models", label: "LLM Models" },
      { href: "/admin/llm-prompt-chains", label: "Prompt Chains" },
      { href: "/admin/llm-responses", label: "LLM Responses" }
    ]
  }
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
        <Card className="sidebar-hero" scanlines>
          <span className="eyebrow">Admin Surface</span>
          <h2>Humor Project 2</h2>
          <p>Dark-glass command center for moderation, caption analytics, and humor system operations.</p>
          <div className="sidebar-user">
            <span className="sidebar-user-dot" />
            <small>{user.email}</small>
          </div>
        </Card>

        <Card className="stack-tight sidebar-nav-card">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.title}>
              <p className="nav-group-title">{group.title}</p>
              <nav className="admin-sidebar-nav" aria-label={`${group.title} resources`}>
                {group.links.map((link) => (
                  <Link href={link.href} key={link.href} prefetch>
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
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
