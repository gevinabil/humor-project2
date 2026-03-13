import { AdminPage, AdminTableCard } from "@/components/admin-data";
import { requireSuperAdminDataAccess } from "@/lib/auth/guards";

type ProfileRow = {
  id: string;
  created_datetime_utc: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  is_superadmin: boolean;
  is_in_study: boolean;
  is_matrix_admin: boolean;
};

export default async function UsersPage() {
  const { adminSupabase } = await requireSuperAdminDataAccess();
  const { data, error } = await adminSupabase
    .from("profiles")
    .select("id, created_datetime_utc, first_name, last_name, email, is_superadmin, is_in_study, is_matrix_admin")
    .order("created_datetime_utc", { ascending: false })
    .limit(200);

  if (error) {
    return (
      <AdminPage eyebrow="Users" title="Users" description="Read access to the profiles table.">
        <AdminTableCard title="Load Error">
          <p>Failed to load users: {error.message}</p>
        </AdminTableCard>
      </AdminPage>
    );
  }

  const profiles = (data ?? []) as ProfileRow[];

  return (
    <AdminPage eyebrow="Users" title="Users" description="Read access to the profiles table.">
      <AdminTableCard title="Profiles">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Created</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => (
                <tr key={profile.id}>
                  <td>{[profile.first_name, profile.last_name].filter(Boolean).join(" ") || "-"}</td>
                  <td>{profile.email ?? "-"}</td>
                  <td>
                    {profile.is_superadmin ? "superadmin " : ""}
                    {profile.is_matrix_admin ? "matrix-admin " : ""}
                    {profile.is_in_study ? "in-study" : ""}
                  </td>
                  <td>{profile.created_datetime_utc ? new Date(profile.created_datetime_utc).toLocaleString() : "-"}</td>
                  <td>
                    <code>{profile.id}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminTableCard>
    </AdminPage>
  );
}
