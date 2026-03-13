import { AdminPage, AdminTableCard } from "@/components/admin-data";
import { requireSuperAdminDataAccess } from "@/lib/auth/guards";

type CaptionRequestRow = {
  id: number;
  created_datetime_utc: string | null;
  profile_id: string;
  image_id: string;
};

export default async function CaptionRequestsPage() {
  const { adminSupabase } = await requireSuperAdminDataAccess();
  const { data, error } = await adminSupabase
    .from("caption_requests")
    .select("id, created_datetime_utc, profile_id, image_id")
    .order("created_datetime_utc", { ascending: false })
    .limit(200);

  if (error) {
    return (
      <AdminPage eyebrow="Content" title="Caption Requests" description="Read access to request intake records.">
        <AdminTableCard title="Load Error">
          <p>Failed to load caption requests: {error.message}</p>
        </AdminTableCard>
      </AdminPage>
    );
  }

  const rows = (data ?? []) as CaptionRequestRow[];

  return (
    <AdminPage eyebrow="Content" title="Caption Requests" description="Read access to request intake records.">
      <AdminTableCard title="Recent Requests">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Profile</th>
                <th>Image</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>
                    <code>{row.profile_id}</code>
                  </td>
                  <td>
                    <code>{row.image_id}</code>
                  </td>
                  <td>{row.created_datetime_utc ? new Date(row.created_datetime_utc).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminTableCard>
    </AdminPage>
  );
}
