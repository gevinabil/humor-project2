import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth/guards";

async function createImage(formData: FormData) {
  "use server";
  const { supabase } = await requireSuperAdmin();
  const url = String(formData.get("url") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();

  if (!url) return;

  await supabase.from("images").insert({
    url,
    title: title || null
  });

  revalidatePath("/admin/images");
}

async function updateImage(formData: FormData) {
  "use server";
  const { supabase } = await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  const url = String(formData.get("url") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();

  if (!id || !url) return;

  await supabase
    .from("images")
    .update({
      url,
      title: title || null
    })
    .eq("id", id);

  revalidatePath("/admin/images");
}

async function deleteImage(formData: FormData) {
  "use server";
  const { supabase } = await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase.from("images").delete().eq("id", id);
  revalidatePath("/admin/images");
}

type ImageRow = {
  id: string;
  url: string;
  title: string | null;
  created_at: string | null;
};

export default async function ImagesPage() {
  const { supabase } = await requireSuperAdmin();
  const { data, error } = await supabase
    .from("images")
    .select("id, url, title, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <section className="card">
        <h1>Images</h1>
        <p>Failed to load images: {error.message}</p>
      </section>
    );
  }

  const images = (data ?? []) as ImageRow[];

  return (
    <section>
      <div className="card">
        <h1>Create Image</h1>
        <form action={createImage}>
          <div className="row">
            <input name="url" placeholder="https://..." required />
            <input name="title" placeholder="Optional title" />
            <button type="submit">Create</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Manage Images</h2>
        {images.map((image) => (
          <div key={image.id} className="card">
            <form action={updateImage}>
              <input type="hidden" name="id" value={image.id} />
              <small>ID: {image.id}</small>
              <div className="row" style={{ marginTop: "0.5rem" }}>
                <input name="url" defaultValue={image.url} required />
                <input name="title" defaultValue={image.title ?? ""} placeholder="Optional title" />
                <button type="submit">Update</button>
              </div>
            </form>
            <div className="row" style={{ marginTop: "0.5rem" }}>
              <small>{image.created_at ? new Date(image.created_at).toLocaleString() : "-"}</small>
              <form action={deleteImage}>
                <input type="hidden" name="id" value={image.id} />
                <button className="danger" type="submit">
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
