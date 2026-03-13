import { revalidatePath } from "next/cache";
import { AdminPage, AdminTableCard } from "@/components/admin-data";
import { Button, Card, Field, Input } from "@/components/ui";
import { requireSuperAdminDataAccess } from "@/lib/auth/guards";
import { getNumber, getString } from "@/lib/admin/forms";

async function createEmail(formData: FormData) {
  "use server";

  const { adminSupabase } = await requireSuperAdminDataAccess();
  const emailAddress = getString(formData, "email_address");

  if (!emailAddress) {
    return;
  }

  await adminSupabase.from("whitelist_email_addresses").insert({ email_address: emailAddress });
  revalidatePath("/admin/whitelist-email-addresses");
}

async function updateEmail(formData: FormData) {
  "use server";

  const { adminSupabase } = await requireSuperAdminDataAccess();
  const id = getNumber(formData, "id");
  const emailAddress = getString(formData, "email_address");

  if (!id || !emailAddress) {
    return;
  }

  await adminSupabase
    .from("whitelist_email_addresses")
    .update({
      email_address: emailAddress,
      modified_datetime_utc: new Date().toISOString()
    })
    .eq("id", id);

  revalidatePath("/admin/whitelist-email-addresses");
}

async function deleteEmail(formData: FormData) {
  "use server";

  const { adminSupabase } = await requireSuperAdminDataAccess();
  const id = getNumber(formData, "id");

  if (!id) {
    return;
  }

  await adminSupabase.from("whitelist_email_addresses").delete().eq("id", id);
  revalidatePath("/admin/whitelist-email-addresses");
}

type EmailRow = {
  id: number;
  created_datetime_utc: string | null;
  modified_datetime_utc: string | null;
  email_address: string;
};

export default async function WhitelistEmailAddressesPage() {
  const { adminSupabase } = await requireSuperAdminDataAccess();
  const { data, error } = await adminSupabase
    .from("whitelist_email_addresses")
    .select("id, created_datetime_utc, modified_datetime_utc, email_address")
    .order("email_address", { ascending: true });

  if (error) {
    return (
      <AdminPage eyebrow="Access Control" title="Whitelisted Email Addresses" description="Create, read, update, and delete explicit email allowlist entries.">
        <AdminTableCard title="Load Error">
          <p>Failed to load whitelisted email addresses: {error.message}</p>
        </AdminTableCard>
      </AdminPage>
    );
  }

  const rows = (data ?? []) as EmailRow[];

  return (
    <AdminPage eyebrow="Access Control" title="Whitelisted Email Addresses" description="Create, read, update, and delete explicit email allowlist entries.">
      <AdminTableCard title="Create Email Rule">
        <form action={createEmail} className="cluster">
          <Field label="Email Address">
            <Input name="email_address" required type="email" />
          </Field>
          <Button type="submit">Add Address</Button>
        </form>
      </AdminTableCard>

      <AdminTableCard title="Manage Email Rules">
        <div className="image-list">
          {rows.map((row) => (
            <Card className="stack-tight" key={row.id}>
              <div className="split">
                <span className="eyebrow">{row.email_address}</span>
                <small>{row.modified_datetime_utc ?? row.created_datetime_utc ?? "-"}</small>
              </div>
              <form action={updateEmail} className="cluster">
                <input name="id" type="hidden" value={row.id} />
                <Field label="Email Address">
                  <Input defaultValue={row.email_address} name="email_address" required type="email" />
                </Field>
                <Button type="submit" variant="secondary">
                  Update
                </Button>
              </form>
              <form action={deleteEmail}>
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
