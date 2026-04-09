import type { Metadata } from "next";

import "./globals.css";
import { NavShell } from "@/app/nav-shell";

export const metadata: Metadata = {
  title: "Jarvis UI",
  description: "Mission control for NEXUS."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main>
          <div className="shell">
            <section className="hero">
              <span className="status">NEXUS mission control</span>
              <h1>Jarvis UI</h1>
              <p>
                Read-only foundation for the portable NEXUS protocol. The UI is
                being built adapter-first so the filesystem contract stays in charge.
              </p>
              <NavShell />
            </section>
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
