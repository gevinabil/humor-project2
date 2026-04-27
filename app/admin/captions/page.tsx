import { AdminPage, AdminTableCard } from "@/components/admin-data";
import { requireSuperAdminDataAccess } from "@/lib/auth/guards";

function formatSignedMetric(value: number) {
  if (Object.is(value, -0)) return "0.0";
  return value.toFixed(1);
}

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
  const totalScore = rows.reduce((sum, row) => sum + (row.like_count ?? 0), 0);
  const positiveScoreCount = rows.filter((row) => row.like_count > 0).length;
  const negativeScoreCount = rows.filter((row) => row.like_count < 0).length;
  const publicCaptionsCount = rows.filter((row) => row.is_public).length;
  const featuredCaptionsCount = rows.filter((row) => row.is_featured).length;
  const requestLinkedCount = rows.filter((row) => row.caption_request_id !== null).length;
  const averageScore = rows.length > 0 ? formatSignedMetric(totalScore / rows.length) : "0.0";
  const topCaptions = [...rows]
    .sort((left, right) => right.like_count - left.like_count)
    .slice(0, 10);
  const lowestCaptions = [...rows]
    .sort((left, right) => left.like_count - right.like_count)
    .slice(0, 10);
  const stats = [
    { label: "Loaded Captions", value: rows.length },
    { label: "Positive Score", value: positiveScoreCount },
    { label: "Negative Score", value: negativeScoreCount },
    { label: "Net Score", value: totalScore },
    { label: "Avg Score / Caption", value: averageScore },
    { label: "Public", value: publicCaptionsCount },
    { label: "Featured", value: featuredCaptionsCount },
    { label: "Request-linked", value: requestLinkedCount }
  ];

  return (
    <AdminPage eyebrow="Content" title="Captions" description="Read access to generated and submitted captions.">
      <div className="stats-grid">
        {stats.map((item) => (
          <AdminTableCard key={item.label} title={item.label}>
            <span className="stat-value">{item.value}</span>
          </AdminTableCard>
        ))}
      </div>

      <AdminTableCard
        title="Top Scoring Captions"
        description="Highest net-score captions in the current admin result set."
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Score</th>
                <th>Caption</th>
                <th>Flavor</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {topCaptions.map((row) => (
                <tr key={row.id}>
                  <td>{row.like_count}</td>
                  <td>{row.content ?? "-"}</td>
                  <td>{row.humor_flavor_id ? flavorMap.get(row.humor_flavor_id) ?? row.humor_flavor_id : "-"}</td>
                  <td>{row.created_datetime_utc ? new Date(row.created_datetime_utc).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminTableCard>

      <AdminTableCard
        title="Lowest Scoring Captions"
        description="Captions with the most negative net score in the current admin result set."
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Score</th>
                <th>Caption</th>
                <th>Flavor</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {lowestCaptions.map((row) => (
                <tr key={row.id}>
                  <td>{row.like_count}</td>
                  <td>{row.content ?? "-"}</td>
                  <td>{row.humor_flavor_id ? flavorMap.get(row.humor_flavor_id) ?? row.humor_flavor_id : "-"}</td>
                  <td>{row.created_datetime_utc ? new Date(row.created_datetime_utc).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminTableCard>

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
                    public:{row.is_public ? "yes" : "no"} featured:{row.is_featured ? "yes" : "no"} score:{row.like_count}
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
