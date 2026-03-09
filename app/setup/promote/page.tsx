import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

async function promoteSelf(formData: FormData) {
  "use server";
  const { user } = await requireUser();
  const hasRequiredAdminEnv =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!hasRequiredAdminEnv) {
    redirect("/setup/promote?error=missing_admin_env");
  }

  const providedSecret = String(formData.get("bootstrap_secret") ?? "").trim();
  const configuredSecret = process.env.SUPERADMIN_BOOTSTRAP_SECRET;

  if (!configuredSecret || providedSecret !== configuredSecret) {
    redirect("/setup/promote?error=bad_secret");
  }

  const allowedEmails = (process.env.SUPERADMIN_BOOTSTRAP_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (allowedEmails.length > 0 && !allowedEmails.includes((user.email ?? "").toLowerCase())) {
    redirect("/setup/promote?error=email_not_allowed");
  }

  const admin = createAdminSupabaseClient();
  const { error } = await admin
    .from("profiles")
    .upsert({ id: user.id, email: user.email, is_superadmin: true }, { onConflict: "id" });

  if (error) {
    redirect("/setup/promote?error=promotion_failed");
  }

  redirect("/admin");
}

export default async function PromotePage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { user } = await requireUser();
  const { error } = await searchParams;
  const message =
    error === "missing_admin_env"
      ? "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment."
      : error === "bad_secret"
        ? "Bootstrap secret is incorrect or missing in server environment."
        : error === "email_not_allowed"
          ? "This email is not in SUPERADMIN_BOOTSTRAP_EMAILS."
          : error === "promotion_failed"
            ? "Failed to update profile. Check SUPABASE_SERVICE_ROLE_KEY."
            : null;

  return (
    <main>
      <section className="card">
        <h1>Bootstrap Superadmin Access</h1>
        <p>
          You are logged in as <code>{user.email}</code>.
        </p>
        <p>
          This solves lockout: first sign in with Google, then promote your own profile using a one-time
          secret and the server-side service role key.
        </p>
        {message ? (
          <p style={{ color: "#b91c1c" }}>
            <strong>Error:</strong> {message}
          </p>
        ) : null}
        <form action={promoteSelf}>
          <div className="row">
            <input name="bootstrap_secret" placeholder="Bootstrap secret" type="password" required />
            <button type="submit">Promote My Account</button>
          </div>
        </form>
      </section>
    </main>
  );
}
