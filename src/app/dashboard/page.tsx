"use client";

import AppShell from "@/components/shell/AppShell";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

function Tile({
  title,
  desc,
  href,
  icon,
  accent = false,
}: {
  title: string;
  desc: string;
  href: string;
  icon?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <Link href={href} className="block group">
      <Card
        className={[
          "glass rounded-2xl overflow-hidden border-border/50",
          "transition-all duration-200",
          "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20",
          accent ? "ring-1 ring-primary/25" : "",
        ].join(" ")}
      >
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-lg">{title}</CardTitle>
              <div className="text-sm text-muted-foreground">{desc}</div>
            </div>

            <div
              className={[
                "h-10 w-10 rounded-xl grid place-items-center",
                "bg-primary/10 text-primary border border-primary/20",
                "transition-transform duration-200",
                "group-hover:scale-105",
              ].join(" ")}
            >
              {icon ?? (
                <span className="text-base font-semibold" aria-hidden>
                  →
                </span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center gap-2 text-sm text-primary">
            <span className="opacity-80 group-hover:opacity-100">Open</span>
            <span className="transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Dashboard() {
  const { user, role, loading } = useAuth();

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6">Please login at /login</div>;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="glass rounded-2xl p-6 border border-border/50">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-3xl font-semibold tracking-tight">
                Welcome back <span className="text-primary">👋</span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {user.email}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className="bg-primary/15 text-primary border border-primary/25">
                {role}
              </Badge>
              <Badge variant="secondary" className="border border-border/50">
                AEGIS
              </Badge>
            </div>
          </div>

          {/* Quick actions */}
          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild className="h-10 px-4">
              <Link href="/grievances">+ New Grievance</Link>
            </Button>

            <Button asChild variant="outline" className="h-10 px-4">
              <Link href="/resources">Browse Resources</Link>
            </Button>

            <Button asChild variant="outline" className="h-10 px-4">
              <Link href="/opportunities">Explore Opportunities</Link>
            </Button>
          </div>
        </div>

        {/* Tiles */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Tile
            title="Grievances"
            desc="File and track grievances with status updates."
            href="/grievances"
            accent
            icon={<span className="text-lg">⚠️</span>}
          />
          <Tile
            title="Resources"
            desc="Browse course resources and downloads."
            href="/resources"
            icon={<span className="text-lg">📚</span>}
          />
          <Tile
            title="Opportunities"
            desc="Explore internships/research and apply."
            href="/opportunities"
            icon={<span className="text-lg">💼</span>}
          />

          {role === "admin" && (
            <Tile
              title="Admin"
              desc="Manage categories, roles and assignments."
              href="/admin"
              icon={<span className="text-lg">⚙️</span>}
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}
