import { AdminPage, AdminTableCard } from "@/components/admin-data";
import { requireSuperAdminDataAccess } from "@/lib/auth/guards";

type ResponseRow = {
  id: string;
  created_datetime_utc: string | null;
  llm_model_response: string | null;
  processing_time_seconds: number;
  llm_model_id: number;
  profile_id: string;
  caption_request_id: number;
  llm_system_prompt: string;
  llm_user_prompt: string;
  llm_temperature: number | null;
  humor_flavor_id: number;
  llm_prompt_chain_id: number | null;
  humor_flavor_step_id: number | null;
};

type SimpleLookup = {
  id: number;
  name?: string | null;
  slug?: string | null;
};

export default async function LlmResponsesPage() {
  const { adminSupabase } = await requireSuperAdminDataAccess();
  const [responsesRes, modelsRes, flavorsRes] = await Promise.all([
    adminSupabase
      .from("llm_model_responses")
      .select(
        "id, created_datetime_utc, llm_model_response, processing_time_seconds, llm_model_id, profile_id, caption_request_id, llm_system_prompt, llm_user_prompt, llm_temperature, humor_flavor_id, llm_prompt_chain_id, humor_flavor_step_id"
      )
      .order("created_datetime_utc", { ascending: false })
      .limit(200),
    adminSupabase.from("llm_models").select("id, name"),
    adminSupabase.from("humor_flavors").select("id, slug")
  ]);

  const error = responsesRes.error || modelsRes.error || flavorsRes.error;

  if (error) {
    return (
      <AdminPage eyebrow="LLM" title="LLM Responses" description="Read access to stored model responses and prompts.">
        <AdminTableCard title="Load Error">
          <p>Failed to load LLM responses: {error.message}</p>
        </AdminTableCard>
      </AdminPage>
    );
  }

  const modelMap = new Map(((modelsRes.data ?? []) as SimpleLookup[]).map((row) => [row.id, row.name ?? String(row.id)]));
  const flavorMap = new Map(((flavorsRes.data ?? []) as SimpleLookup[]).map((row) => [row.id, row.slug ?? String(row.id)]));
  const rows = (responsesRes.data ?? []) as ResponseRow[];

  return (
    <AdminPage eyebrow="LLM" title="LLM Responses" description="Read access to stored model responses and prompts.">
      <AdminTableCard title="Recent Responses">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Model</th>
                <th>Flavor</th>
                <th>Response</th>
                <th>Timing</th>
                <th>Prompt Chain</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{modelMap.get(row.llm_model_id) ?? row.llm_model_id}</td>
                  <td>{flavorMap.get(row.humor_flavor_id) ?? row.humor_flavor_id}</td>
                  <td>{row.llm_model_response ?? row.llm_user_prompt}</td>
                  <td>
                    {row.processing_time_seconds}s @ {row.llm_temperature ?? "-"}
                  </td>
                  <td>{row.llm_prompt_chain_id ?? "-"}</td>
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
