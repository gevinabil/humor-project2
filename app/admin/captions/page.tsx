import { requireSuperAdmin } from "@/lib/auth/guards";

type Caption = {
  id: string;
  text: string | null;
  image_id: string | null;
  created_at: string | null;
};

export default async function CaptionsPage() {
  const { supabase } = await requireSuperAdmin();
  const { data, error } = await supabase
    .from("captions")
    .select("id, text, image_id, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return (
      <section className="card">
        <h1>Captions</h1>
        <p>Failed to load captions: {error.message}</p>
      </section>
    );
  }

  const captions = (data ?? []) as Caption[];

  return (
    <section className="card">
      <h1>Captions</h1>
      <table>
        <thead>
          <tr>
            <th>Caption</th>
            <th>Image ID</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {captions.map((caption) => (
            <tr key={caption.id}>
              <td>{caption.text ?? "-"}</td>
              <td>{caption.image_id ?? "-"}</td>
              <td>{caption.created_at ? new Date(caption.created_at).toLocaleString() : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
