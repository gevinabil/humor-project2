import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Humor Signal Terminal",
  description: "Protected admin area for humor study data"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="fx-grid">
          <div className="app-shell">{children}</div>
        </div>
      </body>
    </html>
  );
}
