import Link from "next/link";
import { Card } from "@/components/ui";
import { requireSuperAdminDataAccess } from "@/lib/auth/guards";

function formatSignedMetric(value: number) {
  if (Object.is(value, -0)) return "0.0";
  return value.toFixed(1);
}

const resourceGroups = [
  {
    title: "People and Access",
    links: [
      { href: "/admin/users", label: "Users" },
      { href: "/admin/allowed-signup-domains", label: "Allowed Signup Domains" },
      { href: "/admin/whitelist-email-addresses", label: "Whitelisted Email Addresses" }
    ]
  },
  {
    title: "Humor System",
    links: [
      { href: "/admin/humor-flavors", label: "Humor Flavors" },
      { href: "/admin/humor-flavor-steps", label: "Humor Flavor Steps" },
      { href: "/admin/humor-mix", label: "Humor Mix" },
      { href: "/admin/terms", label: "Terms" }
    ]
  },
  {
    title: "Content",
    links: [
      { href: "/admin/images", label: "Images" },
      { href: "/admin/captions", label: "Captions" },
      { href: "/admin/caption-requests", label: "Caption Requests" },
      { href: "/admin/caption-examples", label: "Caption Examples" }
    ]
  },
  {
    title: "LLM Operations",
    links: [
      { href: "/admin/llm-providers", label: "LLM Providers" },
      { href: "/admin/llm-models", label: "LLM Models" },
      { href: "/admin/llm-prompt-chains", label: "LLM Prompt Chains" },
      { href: "/admin/llm-responses", label: "LLM Responses" }
    ]
  }
];

const statLinks: Record<string, string> = {
  Users: "/admin/users",
  Images: "/admin/images",
  Captions: "/admin/captions",
  "Positive Score": "/admin/captions",
  "Negative Score": "/admin/captions",
  "Caption Net Score": "/admin/captions",
  "Avg Score / Caption": "/admin/captions",
  "Public Captions": "/admin/captions",
  "Featured Captions": "/admin/captions",
  Requests: "/admin/caption-requests",
  Examples: "/admin/caption-examples",
  "LLM Models": "/admin/llm-models",
  Providers: "/admin/llm-providers",
  "Humor Flavors": "/admin/humor-flavors",
  "Flavor Steps": "/admin/humor-flavor-steps"
};

export default async function AdminDashboard() {
  const { adminSupabase } = await requireSuperAdminDataAccess();
  const [
    profilesRes,
    imagesRes,
    captionsRes,
    requestsRes,
    examplesRes,
    modelsRes,
    providersRes,
    flavorsRes,
    stepsRes,
    captionRatingRes
  ] = await Promise.all([
    adminSupabase.from("profiles").select("id", { count: "exact", head: true }),
    adminSupabase.from("images").select("id", { count: "exact", head: true }),
    adminSupabase.from("captions").select("id", { count: "exact", head: true }),
    adminSupabase.from("caption_requests").select("id", { count: "exact", head: true }),
    adminSupabase.from("caption_examples").select("id", { count: "exact", head: true }),
    adminSupabase.from("llm_models").select("id", { count: "exact", head: true }),
    adminSupabase.from("llm_providers").select("id", { count: "exact", head: true }),
    adminSupabase.from("humor_flavors").select("id", { count: "exact", head: true }),
    adminSupabase.from("humor_flavor_steps").select("id", { count: "exact", head: true }),
    adminSupabase.from("captions").select("id, like_count, is_public, is_featured").limit(5000)
  ]);

  const ratingRows = captionRatingRes.data ?? [];
  const totalCaptionLikes = ratingRows.reduce((sum, row) => sum + (row.like_count ?? 0), 0);
  const positiveScoreCaptionsCount = ratingRows.filter((row) => (row.like_count ?? 0) > 0).length;
  const negativeScoreCaptionsCount = ratingRows.filter((row) => (row.like_count ?? 0) < 0).length;
  const publicCaptionsCount = ratingRows.filter((row) => row.is_public).length;
  const featuredCaptionsCount = ratingRows.filter((row) => row.is_featured).length;
  const averageScorePerCaption =
    ratingRows.length > 0 ? formatSignedMetric(totalCaptionLikes / ratingRows.length) : "0.0";

  const stats = [
    { label: "Users", value: profilesRes.count ?? 0 },
    { label: "Images", value: imagesRes.count ?? 0 },
    { label: "Captions", value: captionsRes.count ?? 0 },
    { label: "Positive Score", value: positiveScoreCaptionsCount },
    { label: "Negative Score", value: negativeScoreCaptionsCount },
    { label: "Caption Net Score", value: totalCaptionLikes },
    { label: "Avg Score / Caption", value: averageScorePerCaption },
    { label: "Public Captions", value: publicCaptionsCount },
    { label: "Featured Captions", value: featuredCaptionsCount },
    { label: "Requests", value: requestsRes.count ?? 0 },
    { label: "Examples", value: examplesRes.count ?? 0 },
    { label: "LLM Models", value: modelsRes.count ?? 0 },
    { label: "Providers", value: providersRes.count ?? 0 },
    { label: "Humor Flavors", value: flavorsRes.count ?? 0 },
    { label: "Flavor Steps", value: stepsRes.count ?? 0 }
  ];

  return (
    <section className="surface-grid">
      <Card className="stack-tight" scanlines>
        <span className="eyebrow">Overview</span>
        <h1>Admin Dashboard</h1>
        <p>Operate the full humor admin surface from one terminal, covering people, content, flavor logic, and LLM infrastructure.</p>
      </Card>

      <div className="stats-grid">
        {stats.map((item) => (
          <Card className="stat-card" key={item.label}>
            <Link aria-label={`Open ${item.label}`} className="stat-link" href={statLinks[item.label] ?? "/admin"} prefetch>
              <span className="stat-label">{item.label}</span>
              <span className="stat-value">{item.value}</span>
            </Link>
          </Card>
        ))}
      </div>

      <div className="surface-grid">
        {resourceGroups.map((group) => (
          <Card className="stack-tight" key={group.title}>
            <h2>{group.title}</h2>
            <div className="admin-nav">
              {group.links.map((link) => (
                <Link href={link.href} key={link.href} prefetch>
                  {link.label}
                </Link>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
