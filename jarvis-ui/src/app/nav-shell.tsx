"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

const HIDDEN_NAV_PREFIXES = ["/start", "/onboarding"] as const;
const HIDDEN_NAV_EXACT = ["/"] as const;

export function NavShell() {
  const pathname = usePathname();

  const hideNav =
    HIDDEN_NAV_EXACT.includes(pathname as (typeof HIDDEN_NAV_EXACT)[number]) ||
    HIDDEN_NAV_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (hideNav) {
    return null;
  }

  return (
    <nav className="nav">
      <Link href={"/" as Route}>Home</Link>
      <Link href={"/start" as Route}>Start</Link>
      <Link href={"/jarvis" as Route}>Jarvis</Link>
      <Link href={"/command" as Route}>Command</Link>
      <Link href={"/command/validation" as Route}>Validation</Link>
      <Link href={"/overview" as Route}>Overview</Link>
      <Link href={"/onboarding" as Route}>Onboarding</Link>
      <Link href={"/rooms" as Route}>Rooms</Link>
      <Link href={"/vault" as Route}>Vault</Link>
      <Link href={"/queue" as Route}>Queue</Link>
      <Link href={"/artifacts" as Route}>Artifacts</Link>
      <Link href={"/api/nexus/health" as Route}>Health API</Link>
    </nav>
  );
}
