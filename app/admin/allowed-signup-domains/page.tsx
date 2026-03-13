import { revalidatePath } from "next/cache";
import { AdminPage, AdminTableCard } from "@/components/admin-data";
import { Button, Card, Field, Input } from "@/components/ui";
import { requireSuperAdminDataAccess } from "@/lib/auth/guards";
import { getNumber, getString } from "@/lib/admin/forms";

async function createDomain(formData: FormData) {
  "use server";

  const { adminSupabase } = await requireSuperAdminDataAccess();
  const apexDomain = getString(formData, "apex_domain");

  if (!apexDomain) {
    return;
  }

  await adminSupabase.from("allowed_signup_domains").insert({ apex_domain: apexDomain });
  revalidatePath("/admin/allowed-signup-domains");
}

async function updateDomain(formData: FormData) {
  "use server";

  const { adminSupabase } = await requireSuperAdminDataAccess();
  const id = getNumber(formData, "id");
  const apexDomain = getString(formData, "apex_domain");

  if (!id || !apexDomain) {
    return;
  }

  await adminSupabase.from("allowed_signup_domains").update({ apex_domain: apexDomain }).eq("id", id);
  revalidatePath("/admin/allowed-signup-domains");
}

async function deleteDomain(formData: FormData) {
  "use server";

  const { adminSupabase } = await requireSuperAdminDataAccess();
  const id = getNumber(formData, "id");

  if (!id) {
    return;
  }

  await adminSupabase.from("allowed_signup_domains").delete().eq("id", id);
  revalidatePath("/admin/allowed-signup-domains");
}

type DomainRow = {
  id: number;
  created_datetime_utc: string | null;
  apex_domain: string;
};

export default async function AllowedSignupDomainsPage() {
  const { adminSupabase } = await requireSuperAdminDataAccess();
  const { data, error } = await adminSupabase
    .from("allowed_signup_domains")
    .select("id, created_datetime_utc, apex_domain")
    .order("apex_domain", { ascending: true });

  if (error) {
    return (
      <AdminPage eyebrow="Access Control" title="Allowed Signup Domains" description="Create, read, update, and delete signup domain rules.">
        <AdminTableCard title="Load Error">
          <p>Failed to load domains: {error.message}</p>
        </AdminTableCard>
      </AdminPage>
    );
  }

  const rows = (data ?? []) as DomainRow[];

  return (
    <AdminPage eyebrow="Access Control" title="Allowed Signup Domains" description="Create, read, update, and delete signup domain rules.">
      <AdminTableCard title="Create Domain">
        <form action={createDomain} className="cluster">
          <Field label="Apex Domain">
            <Input name="apex_domain" placeholder="example.edu" required />
          </Field>
          <Button type="submit">Add Domain</Button>
        </form>
      </AdminTableCard>

      <AdminTableCard title="Manage Domains">
        <div className="image-list">
          {rows.map((row) => (
            <Card className="stack-tight" key={row.id}>
              <div className="split">
                <span className="eyebrow">{row.apex_domain}</span>
                <small>{row.created_datetime_utc ? new Date(row.created_datetime_utc).toLocaleString() : "-"}</small>
              </div>
              <form action={updateDomain} className="cluster">
                <input name="id" type="hidden" value={row.id} />
                <Field label="Apex Domain">
                  <Input defaultValue={row.apex_domain} name="apex_domain" required />
                </Field>
                <Button type="submit" variant="secondary">
                  Update
                </Button>
              </form>
              <form action={deleteDomain}>
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
