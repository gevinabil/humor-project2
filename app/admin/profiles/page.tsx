import { requireSuperAdmin } from "@/lib/auth/guards";

type Profile = {
  id: string;
  email: string | null;
  is_superadmin: boolean | null;
  created_at: string | null;
};

export default async function ProfilesPage() {
  const { supabase } = await requireSuperAdmin();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, is_superadmin, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return (
      <section className="card">
        <h1>Profiles</h1>
        <p>Failed to load profiles: {error.message}</p>
      </section>
    );
  }

  const profiles = (data ?? []) as Profile[];

  return (
    <section className="card">
      <h1>Profiles</h1>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Superadmin</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((profile) => (
            <tr key={profile.id}>
              <td>{profile.email ?? "-"}</td>
              <td>{profile.is_superadmin ? "TRUE" : "FALSE"}</td>
              <td>{profile.created_at ? new Date(profile.created_at).toLocaleString() : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
