import { AdminPage, AdminTableCard } from "@/components/admin-data";
import { requireSuperAdminDataAccess } from "@/lib/auth/guards";

type PromptChainRow = {
  id: number;
  created_datetime_utc: string | null;
  caption_request_id: number;
};

export default async function LlmPromptChainsPage() {
  const { adminSupabase } = await requireSuperAdminDataAccess();
  const { data, error } = await adminSupabase
    .from("llm_prompt_chains")
    .select("id, created_datetime_utc, caption_request_id")
    .order("created_datetime_utc", { ascending: false })
    .limit(200);

  if (error) {
    return (
      <AdminPage eyebrow="LLM" title="LLM Prompt Chains" description="Read access to prompt-chain runs.">
        <AdminTableCard title="Load Error">
          <p>Failed to load prompt chains: {error.message}</p>
        </AdminTableCard>
      </AdminPage>
    );
  }

  const rows = (data ?? []) as PromptChainRow[];

  return (
    <AdminPage eyebrow="LLM" title="LLM Prompt Chains" description="Read access to prompt-chain runs.">
      <AdminTableCard title="Recent Prompt Chains">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Caption Request</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.caption_request_id}</td>
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
