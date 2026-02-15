"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

function NavItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={[
        "block rounded-md px-3 py-2 text-sm transition",
        active ? "bg-muted font-medium" : "hover:bg-muted/60",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, role } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex md:w-64 md:flex-col border-r bg-background">
          <div className="p-5">
            <div className="text-lg font-semibold">AEGIS</div>
            <div className="text-xs text-muted-foreground">Campus Hub</div>
          </div>
          <Separator />
          <nav className="p-3 space-y-1">
            <NavItem href="/dashboard" label="Dashboard" />
            <NavItem href="/grievances" label="Grievances" />
            <NavItem href="/resources" label="Resources" />
            <NavItem href="/opportunities" label="Opportunities" />
            {role === "admin" && <NavItem href="/admin" label="Admin" />}
          </nav>

          <div className="mt-auto p-4">
            <Separator className="mb-4" />
            <div className="text-xs text-muted-foreground">Signed in</div>
            <div className="text-sm font-medium truncate">{user?.email ?? "-"}</div>
            <div className="text-xs text-muted-foreground mt-1">Role: {role ?? "-"}</div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1">
          {/* Topbar */}
          <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
            <div className="flex items-center justify-between px-5 py-3">
              <div className="font-medium">AEGIS Campus Hub</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard">Home</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="p-5">{children}</div>
        </main>
      </div>
    </div>
  );
}
