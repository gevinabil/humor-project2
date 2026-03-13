import { AdminPage, AdminTableCard } from "@/components/admin-data";
import { requireSuperAdminDataAccess } from "@/lib/auth/guards";

type CaptionRow = {
  id: string;
  created_datetime_utc: string | null;
  content: string | null;
  is_public: boolean;
  profile_id: string;
  image_id: string;
  humor_flavor_id: number | null;
  is_featured: boolean;
  caption_request_id: number | null;
  like_count: number;
  llm_prompt_chain_id: number | null;
};

type HumorFlavorRow = {
  id: number;
  slug: string;
};

export default async function CaptionsPage() {
  const { adminSupabase } = await requireSuperAdminDataAccess();
  const [captionsRes, flavorRes] = await Promise.all([
    adminSupabase
      .from("captions")
      .select(
        "id, created_datetime_utc, content, is_public, profile_id, image_id, humor_flavor_id, is_featured, caption_request_id, like_count, llm_prompt_chain_id"
      )
      .order("created_datetime_utc", { ascending: false })
      .limit(200),
    adminSupabase.from("humor_flavors").select("id, slug")
  ]);

  const error = captionsRes.error || flavorRes.error;

  if (error) {
    return (
      <AdminPage eyebrow="Content" title="Captions" description="Read access to generated and submitted captions.">
        <AdminTableCard title="Load Error">
          <p>Failed to load captions: {error.message}</p>
        </AdminTableCard>
      </AdminPage>
    );
  }

  const flavorMap = new Map(((flavorRes.data ?? []) as HumorFlavorRow[]).map((row) => [row.id, row.slug]));
  const rows = (captionsRes.data ?? []) as CaptionRow[];

  return (
    <AdminPage eyebrow="Content" title="Captions" description="Read access to generated and submitted captions.">
      <AdminTableCard title="Recent Captions">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Caption</th>
                <th>Flavor</th>
                <th>Flags</th>
                <th>Image</th>
                <th>Profile</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.content ?? "-"}</td>
                  <td>{row.humor_flavor_id ? flavorMap.get(row.humor_flavor_id) ?? row.humor_flavor_id : "-"}</td>
                  <td>
                    public:{row.is_public ? "yes" : "no"} featured:{row.is_featured ? "yes" : "no"} likes:{row.like_count}
                  </td>
                  <td>
                    <code>{row.image_id}</code>
                  </td>
                  <td>
                    <code>{row.profile_id}</code>
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
