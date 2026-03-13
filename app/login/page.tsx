import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { Card } from "@/components/ui";

export default function LoginPage() {
  return (
    <main className="page-shell">
      <Card className="hero" scanlines>
        <span className="eyebrow">Authentication</span>
        <div className="stack-tight">
          <h1>Login</h1>
          <p>All admin routes are protected behind Google authentication.</p>
        </div>
        <GoogleSignInButton />
      </Card>
    </main>
  );
}
