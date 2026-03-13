import { revalidatePath } from "next/cache";
import { AdminPage, AdminTableCard } from "@/components/admin-data";
import { Button, Card, Field, Input } from "@/components/ui";
import { requireSuperAdminDataAccess } from "@/lib/auth/guards";
import { getNumber, getString } from "@/lib/admin/forms";

async function createProvider(formData: FormData) {
  "use server";

  const { adminSupabase } = await requireSuperAdminDataAccess();
  const name = getString(formData, "name");

  if (!name) {
    return;
  }

  await adminSupabase.from("llm_providers").insert({ name });
  revalidatePath("/admin/llm-providers");
}

async function updateProvider(formData: FormData) {
  "use server";

  const { adminSupabase } = await requireSuperAdminDataAccess();
  const id = getNumber(formData, "id");
  const name = getString(formData, "name");

  if (!id || !name) {
    return;
  }

  await adminSupabase.from("llm_providers").update({ name }).eq("id", id);
  revalidatePath("/admin/llm-providers");
}

async function deleteProvider(formData: FormData) {
  "use server";

  const { adminSupabase } = await requireSuperAdminDataAccess();
  const id = getNumber(formData, "id");

  if (!id) {
    return;
  }

  await adminSupabase.from("llm_providers").delete().eq("id", id);
  revalidatePath("/admin/llm-providers");
}

type ProviderRow = {
  id: number;
  created_datetime_utc: string | null;
  name: string;
};

export default async function LlmProvidersPage() {
  const { adminSupabase } = await requireSuperAdminDataAccess();
  const { data, error } = await adminSupabase
    .from("llm_providers")
    .select("id, created_datetime_utc, name")
    .order("id", { ascending: true });

  if (error) {
    return (
      <AdminPage eyebrow="LLM" title="LLM Providers" description="Create, read, update, and delete provider definitions.">
        <AdminTableCard title="Load Error">
          <p>Failed to load providers: {error.message}</p>
        </AdminTableCard>
      </AdminPage>
    );
  }

  const rows = (data ?? []) as ProviderRow[];

  return (
    <AdminPage eyebrow="LLM" title="LLM Providers" description="Create, read, update, and delete provider definitions.">
      <AdminTableCard title="Create Provider">
        <form action={createProvider} className="cluster">
          <Field label="Provider Name">
            <Input name="name" required />
          </Field>
          <Button type="submit">Create Provider</Button>
        </form>
      </AdminTableCard>

      <AdminTableCard title="Manage Providers">
        <div className="image-list">
          {rows.map((row) => (
            <Card className="stack-tight" key={row.id}>
              <div className="split">
                <span className="eyebrow">Provider {row.id}</span>
                <small>{row.created_datetime_utc ? new Date(row.created_datetime_utc).toLocaleString() : "-"}</small>
              </div>
              <form action={updateProvider} className="cluster">
                <input name="id" type="hidden" value={row.id} />
                <Field label="Provider Name">
                  <Input defaultValue={row.name} name="name" required />
                </Field>
                <Button type="submit" variant="secondary">
                  Update
                </Button>
              </form>
              <form action={deleteProvider}>
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
