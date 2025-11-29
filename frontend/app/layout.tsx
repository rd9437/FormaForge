import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FormaForge",
  description: "AI-assisted dynamic form builder with contextual memory"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <div className="app-content">{children}</div>
          <footer className="app-footer">Build and designed by Rudransh Das</footer>
        </div>
      </body>
    </html>
  );
}
