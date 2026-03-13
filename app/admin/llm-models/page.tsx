import { revalidatePath } from "next/cache";
import { AdminPage, AdminTableCard } from "@/components/admin-data";
import { Button, Card, Field, Input, Select } from "@/components/ui";
import { requireSuperAdminDataAccess } from "@/lib/auth/guards";
import { getBoolean, getNumber, getString } from "@/lib/admin/forms";

async function createModel(formData: FormData) {
  "use server";

  const { adminSupabase } = await requireSuperAdminDataAccess();
  const name = getString(formData, "name");
  const llmProviderId = getNumber(formData, "llm_provider_id");
  const providerModelId = getString(formData, "provider_model_id");
  const isTemperatureSupported = getBoolean(formData, "is_temperature_supported");

  if (!name || !llmProviderId || !providerModelId) {
    return;
  }

  await adminSupabase.from("llm_models").insert({
    name,
    llm_provider_id: llmProviderId,
    provider_model_id: providerModelId,
    is_temperature_supported: isTemperatureSupported
  });

  revalidatePath("/admin/llm-models");
}

async function updateModel(formData: FormData) {
  "use server";

  const { adminSupabase } = await requireSuperAdminDataAccess();
  const id = getNumber(formData, "id");
  const name = getString(formData, "name");
  const llmProviderId = getNumber(formData, "llm_provider_id");
  const providerModelId = getString(formData, "provider_model_id");
  const isTemperatureSupported = getBoolean(formData, "is_temperature_supported");

  if (!id || !name || !llmProviderId || !providerModelId) {
    return;
  }

  await adminSupabase
    .from("llm_models")
    .update({
      name,
      llm_provider_id: llmProviderId,
      provider_model_id: providerModelId,
      is_temperature_supported: isTemperatureSupported
    })
    .eq("id", id);

  revalidatePath("/admin/llm-models");
}

async function deleteModel(formData: FormData) {
  "use server";

  const { adminSupabase } = await requireSuperAdminDataAccess();
  const id = getNumber(formData, "id");

  if (!id) {
    return;
  }

  await adminSupabase.from("llm_models").delete().eq("id", id);
  revalidatePath("/admin/llm-models");
}

type ProviderRow = {
  id: number;
  name: string;
};

type ModelRow = {
  id: number;
  created_datetime_utc: string | null;
  name: string;
  llm_provider_id: number;
  provider_model_id: string;
  is_temperature_supported: boolean;
};

export default async function LlmModelsPage() {
  const { adminSupabase } = await requireSuperAdminDataAccess();
  const [modelsRes, providersRes] = await Promise.all([
    adminSupabase
      .from("llm_models")
      .select("id, created_datetime_utc, name, llm_provider_id, provider_model_id, is_temperature_supported")
      .order("id", { ascending: true }),
    adminSupabase.from("llm_providers").select("id, name").order("id", { ascending: true })
  ]);

  const error = modelsRes.error || providersRes.error;

  if (error) {
    return (
      <AdminPage eyebrow="LLM" title="LLM Models" description="Create, read, update, and delete model definitions.">
        <AdminTableCard title="Load Error">
          <p>Failed to load models: {error.message}</p>
        </AdminTableCard>
      </AdminPage>
    );
  }

  const providers = (providersRes.data ?? []) as ProviderRow[];
  const providerMap = new Map(providers.map((row) => [row.id, row.name]));
  const rows = (modelsRes.data ?? []) as ModelRow[];

  return (
    <AdminPage eyebrow="LLM" title="LLM Models" description="Create, read, update, and delete model definitions.">
      <AdminTableCard title="Create Model">
        <form action={createModel} className="form-grid-wide">
          <Field label="Display Name">
            <Input name="name" required />
          </Field>
          <Field label="Provider">
            <Select defaultValue="" name="llm_provider_id" required>
              <option value="" disabled>
                Select provider
              </option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Provider Model ID">
            <Input name="provider_model_id" required />
          </Field>
          <label className="checkbox-field">
            <input name="is_temperature_supported" type="checkbox" />
            <span>Temperature supported</span>
          </label>
          <Button type="submit">Create Model</Button>
        </form>
      </AdminTableCard>

      <AdminTableCard title="Manage Models">
        <div className="image-list">
          {rows.map((row) => (
            <Card className="stack-tight" key={row.id}>
              <div className="split">
                <div className="stack-tight">
                  <span className="eyebrow">{row.name}</span>
                  <p>Provider {providerMap.get(row.llm_provider_id) ?? row.llm_provider_id}</p>
                </div>
                <small>{row.created_datetime_utc ? new Date(row.created_datetime_utc).toLocaleString() : "-"}</small>
              </div>
              <form action={updateModel} className="stack-tight">
                <input name="id" type="hidden" value={row.id} />
                <div className="form-grid-wide">
                  <Field label="Display Name">
                    <Input defaultValue={row.name} name="name" required />
                  </Field>
                  <Field label="Provider">
                    <Select defaultValue={String(row.llm_provider_id)} name="llm_provider_id" required>
                      {providers.map((provider) => (
                        <option key={provider.id} value={provider.id}>
                          {provider.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Provider Model ID">
                    <Input defaultValue={row.provider_model_id} name="provider_model_id" required />
                  </Field>
                  <label className="checkbox-field">
                    <input defaultChecked={row.is_temperature_supported} name="is_temperature_supported" type="checkbox" />
                    <span>Temperature supported</span>
                  </label>
                </div>
                <Button type="submit" variant="secondary">
                  Update
                </Button>
              </form>
              <form action={deleteModel}>
                <input name="id" type="hidden" value={row.id} />
                <Button className="btn-danger" type="submit" variant="secondary">
                  Delete
                </Button>
              </form>
            </Card>
          ))}
        </div>
      </AdminTableCard>
    </AdminPage>
  );
}
