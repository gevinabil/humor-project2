"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function GoogleSignInButton() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createBrowserSupabaseClient();
      const redirectTo = `${window.location.origin}/auth/callback`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo, skipBrowserRedirect: true }
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (!data?.url) {
        setError("Google OAuth URL was not returned by Supabase.");
        setLoading(false);
        return;
      }

      window.location.assign(data.url);
    } catch (e) {
      setLoading(false);
      setError(e instanceof Error ? e.message : "Unexpected login error.");
    }
  };

  return (
    <div>
      <button onClick={onSignIn} disabled={loading}>
        {loading ? "Redirecting..." : "Continue with Google"}
      </button>
      {error ? (
        <p style={{ marginTop: "0.5rem", color: "#b91c1c" }}>
          Login error: {error}
        </p>
      ) : null}
    </div>
  );
}
