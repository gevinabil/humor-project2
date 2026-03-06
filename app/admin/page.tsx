import { requireSuperAdmin } from "@/lib/auth/guards";

export default async function AdminDashboard() {
  const { supabase } = await requireSuperAdmin();

  const [profilesRes, imagesRes, captionsRes] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("images").select("id", { count: "exact", head: true }),
    supabase.from("captions").select("id", { count: "exact", head: true })
  ]);

  const stats = [
    { label: "Profiles", value: profilesRes.count ?? 0 },
    { label: "Images", value: imagesRes.count ?? 0 },
    { label: "Captions", value: captionsRes.count ?? 0 }
  ];

  return (
    <section className="card">
      <h1>Dataset Stats</h1>
      <p>Quick snapshot of the tables used by the caption/rating app.</p>
      <div className="row">
        {stats.map((item) => (
          <div className="card" key={item.label} style={{ minWidth: "180px", marginBottom: 0 }}>
            <h3>{item.label}</h3>
            <p style={{ fontSize: "2rem", margin: 0 }}>{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
