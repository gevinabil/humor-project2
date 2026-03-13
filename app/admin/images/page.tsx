import { revalidatePath } from "next/cache";
import { AdminPage, AdminTableCard } from "@/components/admin-data";
import { Button, Card, Field, Input, Textarea } from "@/components/ui";
import { requireSuperAdminDataAccess } from "@/lib/auth/guards";
import { getBoolean, getFile, getOptionalString, getString } from "@/lib/admin/forms";

const IMAGE_BUCKET = "images";

async function createImage(formData: FormData) {
  "use server";

  const { adminSupabase, user } = await requireSuperAdminDataAccess();
  const file = getFile(formData, "image_file");
  const manualUrl = getOptionalString(formData, "url");
  const additionalContext = getOptionalString(formData, "additional_context");
  const imageDescription = getOptionalString(formData, "image_description");
  const celebrityRecognition = getOptionalString(formData, "celebrity_recognition");
  const isCommonUse = getBoolean(formData, "is_common_use");
  const isPublic = getBoolean(formData, "is_public");

  let url = manualUrl;

  if (file) {
    const extension = file.name.includes(".") ? file.name.split(".").pop() : "bin";
    const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await adminSupabase.storage.from(IMAGE_BUCKET).upload(path, file, {
      cacheControl: "3600",
      contentType: file.type || undefined,
      upsert: false
    });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = adminSupabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
    url = data.publicUrl;
  }

  if (!url) {
    return;
  }

  await adminSupabase.from("images").insert({
    url,
    profile_id: user.id,
    additional_context: additionalContext,
    image_description: imageDescription,
    celebrity_recognition: celebrityRecognition,
    is_common_use: isCommonUse,
    is_public: isPublic
  });

  revalidatePath("/admin/images");
  revalidatePath("/admin");
}

async function updateImage(formData: FormData) {
  "use server";

  const { adminSupabase } = await requireSuperAdminDataAccess();
  const id = getString(formData, "id");
  const url = getString(formData, "url");
  const additionalContext = getOptionalString(formData, "additional_context");
  const imageDescription = getOptionalString(formData, "image_description");
  const celebrityRecognition = getOptionalString(formData, "celebrity_recognition");
  const isCommonUse = getBoolean(formData, "is_common_use");
  const isPublic = getBoolean(formData, "is_public");

  if (!id || !url) {
    return;
  }

  await adminSupabase
    .from("images")
    .update({
      url,
      additional_context: additionalContext,
      image_description: imageDescription,
      celebrity_recognition: celebrityRecognition,
      is_common_use: isCommonUse,
      is_public: isPublic,
      modified_datetime_utc: new Date().toISOString()
    })
    .eq("id", id);

  revalidatePath("/admin/images");
}

async function deleteImage(formData: FormData) {
  "use server";

  const { adminSupabase } = await requireSuperAdminDataAccess();
  const id = getString(formData, "id");

  if (!id) {
    return;
  }

  await adminSupabase.from("images").delete().eq("id", id);
  revalidatePath("/admin/images");
  revalidatePath("/admin");
}

type ImageRow = {
  id: string;
  created_datetime_utc: string | null;
  modified_datetime_utc: string | null;
  url: string;
  is_common_use: boolean;
  profile_id: string | null;
  additional_context: string | null;
  is_public: boolean;
  image_description: string | null;
  celebrity_recognition: string | null;
};

export default async function ImagesPage() {
  const { adminSupabase } = await requireSuperAdminDataAccess();
  const { data, error } = await adminSupabase
    .from("images")
    .select(
      "id, created_datetime_utc, modified_datetime_utc, url, is_common_use, profile_id, additional_context, is_public, image_description, celebrity_recognition"
    )
    .order("created_datetime_utc", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <AdminPage eyebrow="Assets" title="Images" description="Create, read, update, and delete images, including bucket uploads.">
        <AdminTableCard title="Load Error">
          <p>Failed to load images: {error.message}</p>
        </AdminTableCard>
      </AdminPage>
    );
  }

  const images = (data ?? []) as ImageRow[];

  return (
    <AdminPage eyebrow="Assets" title="Images" description="Create, read, update, and delete images, including bucket uploads.">
      <AdminTableCard title="Create Image">
        <div className="note">
          <p>Upload a new file to the public `images` bucket, or supply an existing public URL.</p>
        </div>
        <form action={createImage} className="stack-tight">
          <div className="form-grid-wide">
            <Field label="Upload File">
              <Input accept="image/*" name="image_file" type="file" />
            </Field>
            <Field label="Existing Public URL">
              <Input name="url" placeholder="https://..." />
            </Field>
            <Field label="Additional Context">
              <Textarea name="additional_context" />
            </Field>
            <Field label="Image Description">
              <Textarea name="image_description" />
            </Field>
            <Field label="Celebrity Recognition">
              <Textarea name="celebrity_recognition" />
            </Field>
          </div>
          <div className="cluster">
            <label className="checkbox-field">
              <input name="is_common_use" type="checkbox" />
              <span>Common use image</span>
            </label>
            <label className="checkbox-field">
              <input name="is_public" type="checkbox" />
              <span>Public image</span>
            </label>
            <Button type="submit">Create Image</Button>
          </div>
        </form>
      </AdminTableCard>

      <AdminTableCard title="Manage Images">
        <div className="image-list">
          {images.map((image) => (
            <Card className="stack-tight" key={image.id}>
              <div className="split">
                <div className="stack-tight">
                  <span className="eyebrow">Image</span>
                  <small>
                    {image.modified_datetime_utc ?? image.created_datetime_utc ?? "-"} · owner {image.profile_id ?? "unknown"}
                  </small>
                </div>
                <a className="btn btn-secondary" href={image.url} rel="noreferrer" target="_blank">
                  Open Asset
                </a>
              </div>
              <form action={updateImage} className="stack-tight">
                <input name="id" type="hidden" value={image.id} />
                <div className="form-grid-wide">
                  <Field label="Public URL">
                    <Input defaultValue={image.url} name="url" required />
                  </Field>
                  <Field label="Additional Context">
                    <Textarea defaultValue={image.additional_context ?? ""} name="additional_context" />
                  </Field>
                  <Field label="Image Description">
                    <Textarea defaultValue={image.image_description ?? ""} name="image_description" />
                  </Field>
                  <Field label="Celebrity Recognition">
                    <Textarea defaultValue={image.celebrity_recognition ?? ""} name="celebrity_recognition" />
                  </Field>
                </div>
                <div className="cluster">
                  <label className="checkbox-field">
                    <input defaultChecked={image.is_common_use} name="is_common_use" type="checkbox" />
                    <span>Common use image</span>
                  </label>
                  <label className="checkbox-field">
                    <input defaultChecked={image.is_public} name="is_public" type="checkbox" />
                    <span>Public image</span>
                  </label>
                  <Button type="submit" variant="secondary">
                    Update
                  </Button>
                </div>
              </form>
              <form action={deleteImage}>
                <input name="id" type="hidden" value={image.id} />
                <Button className="btn-danger" type="submit" variant="secondary">
                  Delete
                </Button>
              </form>
              <small>
                <code>{image.id}</code>
              </small>
            </Card>
          ))}
        </div>
      </AdminTableCard>
    </AdminPage>
  );
}
