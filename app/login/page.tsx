import { GoogleSignInButton } from "@/components/google-sign-in-button";

export default function LoginPage() {
  return (
    <main>
      <h1>Login</h1>
      <p>All admin routes are protected behind Google authentication.</p>
      <GoogleSignInButton />
    </main>
  );
}
