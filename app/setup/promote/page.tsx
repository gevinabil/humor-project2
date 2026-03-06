import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

async function promoteSelf(formData: FormData) {
  "use server";
  const { user } = await requireUser();

  const providedSecret = String(formData.get("bootstrap_secret") ?? "").trim();
  const configuredSecret = process.env.SUPERADMIN_BOOTSTRAP_SECRET;

  if (!configuredSecret || providedSecret !== configuredSecret) {
    return;
  }

  const allowedEmails = (process.env.SUPERADMIN_BOOTSTRAP_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (allowedEmails.length > 0 && !allowedEmails.includes((user.email ?? "").toLowerCase())) {
    return;
  }

  const admin = createAdminSupabaseClient();
  await admin
    .from("profiles")
    .upsert({ id: user.id, email: user.email, is_superadmin: true }, { onConflict: "id" });

  redirect("/admin");
}

export default async function PromotePage() {
  const { user } = await requireUser();

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
