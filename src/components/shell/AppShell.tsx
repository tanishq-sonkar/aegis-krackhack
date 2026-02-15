"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

function NavItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={[
        "block rounded-xl px-3 py-2 text-sm transition",
        "border border-transparent",
        active
          ? "bg-white/10 border-white/10 text-foreground"
          : "text-muted-foreground hover:bg-white/5 hover:text-foreground hover:border-white/10",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, role } = useAuth();

  async function handleLogout() {
    await signOut(auth);
    window.location.href = "/login";
  }

  return (
    // ✅ EXACT SAME PAGE BACKDROP AS LOGIN (bg-app)
    <div className="min-h-screen bg-app">
      <div className="flex min-h-screen p-4 gap-4">
        {/* Sidebar */}
        <aside className="hidden md:block w-72 shrink-0">
          {/* ✅ EXACT SAME GLASS STYLE AS LOGIN (glass + rounded-2xl) */}
          <div className="glass rounded-2xl h-[calc(100vh-2rem)] flex flex-col overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold tracking-tight">
                    <span className="text-primary">AEGIS</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Campus Hub</div>
                </div>

                {role && (
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/15 text-primary border border-primary/25">
                    {role}
                  </span>
                )}
              </div>
            </div>

            <Separator className="bg-white/10" />

            <nav className="p-3 space-y-1">
              <NavItem href="/dashboard" label="Dashboard" />
              <NavItem href="/grievances" label="Grievances" />
              <NavItem href="/resources" label="Resources" />
              <NavItem href="/opportunities" label="Opportunities" />
              <NavItem href="/announcements" label="Announcements" />
              {role === "admin" && <NavItem href="/admin" label="Admin" />}
            </nav>

            <div className="mt-auto p-4">
              <Separator className="mb-4 bg-white/10" />
              <div className="text-xs text-muted-foreground">Signed in</div>
              <div className="text-sm font-medium truncate">{user?.email ?? "-"}</div>
              <div className="text-xs text-muted-foreground mt-1">Role: {role ?? "-"}</div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          {/* ✅ Main container also uses the SAME glass card look */}
          <div className="glass rounded-2xl h-[calc(100vh-2rem)] overflow-hidden flex flex-col">
            {/* Topbar */}
            <div className="sticky top-0 z-10 border-b border-white/10 bg-white/5 backdrop-blur">
              <div className="flex items-center justify-between px-5 py-3">
                <div className="font-medium">
                  <span className="text-primary">AEGIS</span> Campus Hub
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="border-white/15 bg-white/5 hover:bg-white/10"
                  >
                    <Link href="/dashboard">Home</Link>
                  </Button>

                  {/* ✅ Cyan “primary” like login */}
                  <Button size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-5">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
