import { AdminPage, AdminTableCard } from "@/components/admin-data";
import { requireSuperAdminDataAccess } from "@/lib/auth/guards";

type HumorFlavorRow = {
  id: number;
  created_datetime_utc: string | null;
  slug: string;
  description: string | null;
};

export default async function HumorFlavorsPage() {
  const { adminSupabase } = await requireSuperAdminDataAccess();
  const { data, error } = await adminSupabase
    .from("humor_flavors")
    .select("id, created_datetime_utc, slug, description")
    .order("id", { ascending: true });

  if (error) {
    return (
      <AdminPage eyebrow="Humor Taxonomy" title="Humor Flavors" description="Read access to humor flavor definitions.">
        <AdminTableCard title="Load Error">
          <p>Failed to load humor flavors: {error.message}</p>
        </AdminTableCard>
      </AdminPage>
    );
  }

  const rows = (data ?? []) as HumorFlavorRow[];

  return (
    <AdminPage eyebrow="Humor Taxonomy" title="Humor Flavors" description="Read access to humor flavor definitions.">
      <AdminTableCard title="Flavor Registry">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.slug}</td>
                  <td>{row.description ?? "-"}</td>
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
