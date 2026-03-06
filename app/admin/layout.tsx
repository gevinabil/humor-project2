import Link from "next/link";
import { requireSuperAdmin } from "@/lib/auth/guards";

async function signOut() {
  "use server";
  const { supabase } = await requireSuperAdmin();
  await supabase.auth.signOut();
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireSuperAdmin();

  return (
    <main>
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <strong>Admin Area</strong>
          <small>{user.email}</small>
        </div>
        <div className="row" style={{ marginTop: "0.7rem" }}>
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/profiles">Profiles</Link>
          <Link href="/admin/captions">Captions</Link>
          <Link href="/admin/images">Images</Link>
          <form action={signOut}>
            <button className="secondary" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </div>
      {children}
    </main>
  );
}
