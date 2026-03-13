import { revalidatePath } from "next/cache";
import { AdminPage, AdminTableCard } from "@/components/admin-data";
import { Button, Card, Field, Input, Select, Textarea } from "@/components/ui";
import { requireSuperAdminDataAccess } from "@/lib/auth/guards";
import { getNumber, getOptionalString, getString } from "@/lib/admin/forms";

async function createCaptionExample(formData: FormData) {
  "use server";

  const { adminSupabase } = await requireSuperAdminDataAccess();
  const imageDescription = getString(formData, "image_description");
  const caption = getString(formData, "caption");
  const explanation = getString(formData, "explanation");
  const priority = getNumber(formData, "priority");
  const imageId = getOptionalString(formData, "image_id");

  if (!imageDescription || !caption || !explanation || priority === null) {
    return;
  }

  await adminSupabase.from("caption_examples").insert({
    image_description: imageDescription,
    caption,
    explanation,
    priority,
    image_id: imageId
  });

  revalidatePath("/admin/caption-examples");
}

async function updateCaptionExample(formData: FormData) {
  "use server";

  const { adminSupabase } = await requireSuperAdminDataAccess();
  const id = getNumber(formData, "id");
  const imageDescription = getString(formData, "image_description");
  const caption = getString(formData, "caption");
  const explanation = getString(formData, "explanation");
  const priority = getNumber(formData, "priority");
  const imageId = getOptionalString(formData, "image_id");

  if (!id || !imageDescription || !caption || !explanation || priority === null) {
    return;
  }

  await adminSupabase
    .from("caption_examples")
    .update({
      image_description: imageDescription,
      caption,
      explanation,
      priority,
      image_id: imageId,
      modified_datetime_utc: new Date().toISOString()
    })
    .eq("id", id);

  revalidatePath("/admin/caption-examples");
}

async function deleteCaptionExample(formData: FormData) {
  "use server";

  const { adminSupabase } = await requireSuperAdminDataAccess();
  const id = getNumber(formData, "id");

  if (!id) {
    return;
  }

  await adminSupabase.from("caption_examples").delete().eq("id", id);
  revalidatePath("/admin/caption-examples");
}

type ImageRow = {
  id: string;
  url: string | null;
};

type CaptionExampleRow = {
  id: number;
  created_datetime_utc: string | null;
  modified_datetime_utc: string | null;
  image_description: string;
  caption: string;
  explanation: string;
  priority: number;
  image_id: string | null;
};

export default async function CaptionExamplesPage() {
  const { adminSupabase } = await requireSuperAdminDataAccess();
  const [examplesRes, imagesRes] = await Promise.all([
    adminSupabase
      .from("caption_examples")
      .select("id, created_datetime_utc, modified_datetime_utc, image_description, caption, explanation, priority, image_id")
      .order("priority", { ascending: true })
      .limit(200),
    adminSupabase.from("images").select("id, url").order("created_datetime_utc", { ascending: false }).limit(150)
  ]);

  const error = examplesRes.error || imagesRes.error;

  if (error) {
    return (
      <AdminPage eyebrow="Examples" title="Caption Examples" description="Create, read, update, and delete caption examples.">
        <AdminTableCard title="Load Error">
          <p>Failed to load caption examples: {error.message}</p>
        </AdminTableCard>
      </AdminPage>
    );
  }

  const images = (imagesRes.data ?? []) as ImageRow[];
  const rows = (examplesRes.data ?? []) as CaptionExampleRow[];

  return (
    <AdminPage eyebrow="Examples" title="Caption Examples" description="Create, read, update, and delete caption examples.">
      <AdminTableCard title="Create Example">
        <form action={createCaptionExample} className="stack-tight">
          <div className="form-grid-wide">
            <Field label="Priority">
              <Input min="0" name="priority" required type="number" />
            </Field>
            <Field label="Related Image">
              <Select defaultValue="" name="image_id">
                <option value="">No linked image</option>
                {images.map((image) => (
                  <option key={image.id} value={image.id}>
                    {image.id}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Image Description">
              <Textarea name="image_description" required />
            </Field>
            <Field label="Caption">
              <Textarea name="caption" required />
            </Field>
            <Field label="Explanation">
              <Textarea name="explanation" required />
            </Field>
          </div>
          <Button type="submit">Create Example</Button>
        </form>
      </AdminTableCard>

      <AdminTableCard title="Manage Examples">
        <div className="image-list">
          {rows.map((row) => (
            <Card className="stack-tight" key={row.id}>
              <div className="split">
                <div className="stack-tight">
                  <span className="eyebrow">Example {row.id}</span>
                  <p>Priority {row.priority}</p>
                </div>
                <small>{row.modified_datetime_utc ?? row.created_datetime_utc ?? "-"}</small>
              </div>
              <form action={updateCaptionExample} className="stack-tight">
                <input name="id" type="hidden" value={row.id} />
                <div className="form-grid-wide">
                  <Field label="Priority">
                    <Input defaultValue={String(row.priority)} min="0" name="priority" required type="number" />
                  </Field>
                  <Field label="Related Image">
                    <Select defaultValue={row.image_id ?? ""} name="image_id">
                      <option value="">No linked image</option>
                      {images.map((image) => (
                        <option key={image.id} value={image.id}>
                          {image.id}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Image Description">
                    <Textarea defaultValue={row.image_description} name="image_description" required />
                  </Field>
                  <Field label="Caption">
                    <Textarea defaultValue={row.caption} name="caption" required />
                  </Field>
                  <Field label="Explanation">
                    <Textarea defaultValue={row.explanation} name="explanation" required />
                  </Field>
                </div>
                <Button type="submit" variant="secondary">
                  Update
                </Button>
              </form>
              <form action={deleteCaptionExample}>
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
