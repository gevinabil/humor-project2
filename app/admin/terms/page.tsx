import { revalidatePath } from "next/cache";
import { AdminPage, AdminTableCard } from "@/components/admin-data";
import { Button, Card, Field, Input, Select, Textarea } from "@/components/ui";
import { requireSuperAdminDataAccess } from "@/lib/auth/guards";
import { getNumber, getString } from "@/lib/admin/forms";

async function createTerm(formData: FormData) {
  "use server";

  const { adminSupabase } = await requireSuperAdminDataAccess();
  const term = getString(formData, "term");
  const definition = getString(formData, "definition");
  const example = getString(formData, "example");
  const priority = getNumber(formData, "priority");
  const termTypeId = getNumber(formData, "term_type_id");

  if (!term || !definition || !example || priority === null) {
    return;
  }

  await adminSupabase.from("terms").insert({
    term,
    definition,
    example,
    priority,
    term_type_id: termTypeId
  });

  revalidatePath("/admin/terms");
}

async function updateTerm(formData: FormData) {
  "use server";

  const { adminSupabase } = await requireSuperAdminDataAccess();
  const id = getNumber(formData, "id");
  const term = getString(formData, "term");
  const definition = getString(formData, "definition");
  const example = getString(formData, "example");
  const priority = getNumber(formData, "priority");
  const termTypeId = getNumber(formData, "term_type_id");

  if (!id || !term || !definition || !example || priority === null) {
    return;
  }

  await adminSupabase
    .from("terms")
    .update({
      term,
      definition,
      example,
      priority,
      term_type_id: termTypeId,
      modified_datetime_utc: new Date().toISOString()
    })
    .eq("id", id);

  revalidatePath("/admin/terms");
}

async function deleteTerm(formData: FormData) {
  "use server";

  const { adminSupabase } = await requireSuperAdminDataAccess();
  const id = getNumber(formData, "id");

  if (!id) {
    return;
  }

  await adminSupabase.from("terms").delete().eq("id", id);
  revalidatePath("/admin/terms");
}

type TermTypeRow = {
  id: number;
  name: string;
};

type TermRow = {
  id: number;
  created_datetime_utc: string | null;
  modified_datetime_utc: string | null;
  term: string;
  definition: string;
  example: string;
  priority: number;
  term_type_id: number | null;
};

export default async function TermsPage() {
  const { adminSupabase } = await requireSuperAdminDataAccess();
  const [termsRes, termTypesRes] = await Promise.all([
    adminSupabase
      .from("terms")
      .select("id, created_datetime_utc, modified_datetime_utc, term, definition, example, priority, term_type_id")
      .order("priority", { ascending: true })
      .limit(200),
    adminSupabase.from("term_types").select("id, name").order("id", { ascending: true })
  ]);

  const error = termsRes.error || termTypesRes.error;

  if (error) {
    return (
      <AdminPage eyebrow="Dictionary" title="Terms" description="Create, read, update, and delete glossary terms.">
        <AdminTableCard title="Load Error">
          <p>Failed to load terms: {error.message}</p>
        </AdminTableCard>
      </AdminPage>
    );
  }

  const termTypes = (termTypesRes.data ?? []) as TermTypeRow[];
  const termTypeMap = new Map(termTypes.map((row) => [row.id, row.name]));
  const rows = (termsRes.data ?? []) as TermRow[];

  return (
    <AdminPage eyebrow="Dictionary" title="Terms" description="Create, read, update, and delete glossary terms.">
      <AdminTableCard title="Create Term">
        <form action={createTerm}>
          <div className="form-grid-wide">
            <Field label="Term">
              <Input name="term" required />
            </Field>
            <Field label="Priority">
              <Input min="0" name="priority" required type="number" />
            </Field>
            <Field label="Term Type">
              <Select defaultValue="" name="term_type_id">
                <option value="">No type</option>
                {termTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Definition">
              <Textarea name="definition" required />
            </Field>
            <Field label="Example">
              <Textarea name="example" required />
            </Field>
          </div>
          <Button type="submit">Create Term</Button>
        </form>
      </AdminTableCard>

      <AdminTableCard title="Manage Terms">
        <div className="image-list">
          {rows.map((row) => (
            <Card className="stack-tight" key={row.id}>
              <div className="split">
                <div className="stack-tight">
                  <span className="eyebrow">{row.term}</span>
                  <p>
                    Type {row.term_type_id ? termTypeMap.get(row.term_type_id) ?? row.term_type_id : "none"} · Priority{" "}
                    {row.priority}
                  </p>
                </div>
                <small>{row.modified_datetime_utc ?? row.created_datetime_utc ?? "-"}</small>
              </div>
              <form action={updateTerm} className="stack-tight">
                <input name="id" type="hidden" value={row.id} />
                <div className="form-grid-wide">
                  <Field label="Term">
                    <Input defaultValue={row.term} name="term" required />
                  </Field>
                  <Field label="Priority">
                    <Input defaultValue={String(row.priority)} min="0" name="priority" required type="number" />
                  </Field>
                  <Field label="Term Type">
                    <Select defaultValue={row.term_type_id ? String(row.term_type_id) : ""} name="term_type_id">
                      <option value="">No type</option>
                      {termTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Definition">
                    <Textarea defaultValue={row.definition} name="definition" required />
                  </Field>
                  <Field label="Example">
                    <Textarea defaultValue={row.example} name="example" required />
                  </Field>
                </div>
                <div className="cluster">
                  <Button type="submit" variant="secondary">
                    Update
                  </Button>
                </div>
              </form>
              <form action={deleteTerm}>
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
