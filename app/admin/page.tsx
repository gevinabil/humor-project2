import { requireSuperAdmin } from "@/lib/auth/guards";

export default async function AdminDashboard() {
  const { supabase } = await requireSuperAdmin();

  const [profilesRes, superadminsRes, imagesRes, captionsRes, orphanCaptionsRes, latestCaptionRes] =
    await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_superadmin", true),
    supabase.from("images").select("id", { count: "exact", head: true }),
    supabase.from("captions").select("id", { count: "exact", head: true }),
    supabase.from("captions").select("id", { count: "exact", head: true }).is("image_id", null),
    supabase
      .from("captions")
      .select("text, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);

  const profileCount = profilesRes.count ?? 0;
  const superadminCount = superadminsRes.count ?? 0;
  const imageCount = imagesRes.count ?? 0;
  const captionCount = captionsRes.count ?? 0;
  const orphanCaptions = orphanCaptionsRes.count ?? 0;
  const captionsPerImage = imageCount > 0 ? (captionCount / imageCount).toFixed(2) : "0.00";
  const superadminPct = profileCount > 0 ? ((superadminCount / profileCount) * 100).toFixed(1) : "0.0";
  const latestCaption = latestCaptionRes.data?.text ?? "No captions yet";

  const stats = [
    { label: "Profiles", value: profileCount },
    { label: "Superadmins", value: superadminCount },
    { label: "Images", value: imageCount },
    { label: "Captions", value: captionCount },
    { label: "Captions / Image", value: captionsPerImage },
    { label: "Profiles w/ Admin %", value: `${superadminPct}%` },
    { label: "Orphan Captions", value: orphanCaptions }
  ];

  return (
    <section className="card">
      <h1>Dataset Stats</h1>
      <p>Quick snapshot of quality and coverage in your caption/rating dataset.</p>
      <div className="row">
        {stats.map((item) => (
          <div className="card" key={item.label} style={{ minWidth: "180px", marginBottom: 0 }}>
            <h3>{item.label}</h3>
            <p style={{ fontSize: "2rem", margin: 0 }}>{item.value}</p>
          </div>
        ))}
      </div>
      <div className="card" style={{ marginTop: "1rem", marginBottom: 0 }}>
        <h3>Latest Caption</h3>
        <p style={{ marginBottom: 0 }}>{latestCaption}</p>
      </div>
    </section>
  );
}
