import { AdminPage, AdminTableCard } from "@/components/admin-data";
import { requireSuperAdminDataAccess } from "@/lib/auth/guards";

type OptionRow = {
  id: number;
  slug?: string | null;
  description?: string | null;
  name?: string | null;
};

type HumorFlavorStepRow = {
  id: number;
  humor_flavor_id: number;
  llm_temperature: number | null;
  order_by: number;
  llm_input_type_id: number;
  llm_output_type_id: number;
  llm_model_id: number;
  humor_flavor_step_type_id: number;
  llm_system_prompt: string | null;
  llm_user_prompt: string | null;
  description: string | null;
};

function labelFor(map: Map<number, string>, id: number) {
  return map.get(id) ?? String(id);
}

export default async function HumorFlavorStepsPage() {
  const { adminSupabase } = await requireSuperAdminDataAccess();
  const [stepsRes, flavorsRes, inputTypesRes, outputTypesRes, stepTypesRes, modelsRes] = await Promise.all([
    adminSupabase
      .from("humor_flavor_steps")
      .select(
        "id, humor_flavor_id, llm_temperature, order_by, llm_input_type_id, llm_output_type_id, llm_model_id, humor_flavor_step_type_id, llm_system_prompt, llm_user_prompt, description"
      )
      .order("humor_flavor_id", { ascending: true })
      .order("order_by", { ascending: true }),
    adminSupabase.from("humor_flavors").select("id, slug"),
    adminSupabase.from("llm_input_types").select("id, slug, description"),
    adminSupabase.from("llm_output_types").select("id, slug, description"),
    adminSupabase.from("humor_flavor_step_types").select("id, slug, description"),
    adminSupabase.from("llm_models").select("id, name")
  ]);

  const error =
    stepsRes.error || flavorsRes.error || inputTypesRes.error || outputTypesRes.error || stepTypesRes.error || modelsRes.error;

  if (error) {
    return (
      <AdminPage eyebrow="Execution" title="Humor Flavor Steps" description="Read access to the step pipeline behind each flavor.">
        <AdminTableCard title="Load Error">
          <p>Failed to load humor flavor steps: {error.message}</p>
        </AdminTableCard>
      </AdminPage>
    );
  }

  const flavorMap = new Map((flavorsRes.data ?? []).map((row) => [row.id, row.slug]));
  const inputTypeMap = new Map(((inputTypesRes.data ?? []) as OptionRow[]).map((row) => [row.id, row.slug ?? row.description ?? String(row.id)]));
  const outputTypeMap = new Map(((outputTypesRes.data ?? []) as OptionRow[]).map((row) => [row.id, row.slug ?? row.description ?? String(row.id)]));
  const stepTypeMap = new Map(((stepTypesRes.data ?? []) as OptionRow[]).map((row) => [row.id, row.slug ?? row.description ?? String(row.id)]));
  const modelMap = new Map(((modelsRes.data ?? []) as OptionRow[]).map((row) => [row.id, row.name ?? String(row.id)]));
  const rows = (stepsRes.data ?? []) as HumorFlavorStepRow[];

  return (
    <AdminPage eyebrow="Execution" title="Humor Flavor Steps" description="Read access to the step pipeline behind each flavor.">
      <AdminTableCard title="Configured Steps">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Flavor</th>
                <th>Order</th>
                <th>Step Type</th>
                <th>Input</th>
                <th>Output</th>
                <th>Model</th>
                <th>Temperature</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{labelFor(flavorMap, row.humor_flavor_id)}</td>
                  <td>{row.order_by}</td>
                  <td>{labelFor(stepTypeMap, row.humor_flavor_step_type_id)}</td>
                  <td>{labelFor(inputTypeMap, row.llm_input_type_id)}</td>
                  <td>{labelFor(outputTypeMap, row.llm_output_type_id)}</td>
                  <td>{labelFor(modelMap, row.llm_model_id)}</td>
                  <td>{row.llm_temperature ?? "-"}</td>
                  <td>{row.description ?? row.llm_user_prompt ?? row.llm_system_prompt ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminTableCard>
    </AdminPage>
  );
}
