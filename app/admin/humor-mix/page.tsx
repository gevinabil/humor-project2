import { revalidatePath } from "next/cache";
import { AdminPage, AdminTableCard } from "@/components/admin-data";
import { Button, Field, Input } from "@/components/ui";
import { requireSuperAdminDataAccess } from "@/lib/auth/guards";
import { getNumber } from "@/lib/admin/forms";

async function updateMix(formData: FormData) {
  "use server";

  const { adminSupabase } = await requireSuperAdminDataAccess();
  const id = getNumber(formData, "id");
  const humorFlavorId = getNumber(formData, "humor_flavor_id");
  const captionCount = getNumber(formData, "caption_count");

  if (!id || !humorFlavorId || captionCount === null) {
    return;
  }

  await adminSupabase
    .from("humor_flavor_mix")
    .update({
      humor_flavor_id: humorFlavorId,
      caption_count: captionCount
    })
    .eq("id", id);

  revalidatePath("/admin/humor-mix");
  revalidatePath("/admin");
}

type FlavorRow = {
  id: number;
  slug: string;
};

type MixRow = {
  id: number;
  created_datetime_utc: string | null;
  humor_flavor_id: number;
  caption_count: number;
};

export default async function HumorMixPage() {
  const { adminSupabase } = await requireSuperAdminDataAccess();
  const [mixRes, flavorsRes] = await Promise.all([
    adminSupabase.from("humor_flavor_mix").select("id, created_datetime_utc, humor_flavor_id, caption_count").order("id", { ascending: true }),
    adminSupabase.from("humor_flavors").select("id, slug").order("id", { ascending: true })
  ]);

  const error = mixRes.error || flavorsRes.error;

  if (error) {
    return (
      <AdminPage eyebrow="Weights" title="Humor Mix" description="Read and update the target caption mix per humor flavor.">
        <AdminTableCard title="Load Error">
          <p>Failed to load humor mix: {error.message}</p>
        </AdminTableCard>
      </AdminPage>
    );
  }

  const flavorMap = new Map(((flavorsRes.data ?? []) as FlavorRow[]).map((row) => [row.id, row.slug]));
  const rows = (mixRes.data ?? []) as MixRow[];

  return (
    <AdminPage eyebrow="Weights" title="Humor Mix" description="Read and update the target caption mix per humor flavor.">
      <AdminTableCard title="Flavor Distribution">
        <div className="image-list">
          {rows.map((row) => (
            <form action={updateMix} key={row.id}>
              <div className="card chrome">
                <div className="split">
                  <div className="stack-tight">
                    <span className="eyebrow">Flavor {flavorMap.get(row.humor_flavor_id) ?? row.humor_flavor_id}</span>
                    <p>Created {row.created_datetime_utc ? new Date(row.created_datetime_utc).toLocaleString() : "-"}</p>
                  </div>
                  <Button type="submit" variant="secondary">
                    Save Mix Row
                  </Button>
                </div>
                <input name="id" type="hidden" value={row.id} />
                <div className="form-grid-wide">
                  <Field label="Humor Flavor ID">
                    <Input defaultValue={String(row.humor_flavor_id)} name="humor_flavor_id" required />
                  </Field>
                  <Field label="Caption Count">
                    <Input defaultValue={String(row.caption_count)} min="0" name="caption_count" required type="number" />
                  </Field>
                </div>
              </div>
            </form>
          ))}
        </div>
      </AdminTableCard>
    </AdminPage>
  );
}
