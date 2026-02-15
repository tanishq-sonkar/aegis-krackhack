"use client";

import AppShell from "@/components/shell/AppShell";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function GrievancesHome() {
  const { user, role, loading } = useAuth();

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6">Please login at /login</div>;

  return (
    <AppShell>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Grievances</h1>
            <p className="text-sm text-muted-foreground">File and track issues with status updates.</p>
          </div>
          <Button asChild>
            <Link href="/grievances/new">+ New</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">My Grievances</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              View grievances you have filed and track their status.
              <div className="mt-3">
                <Button variant="outline" asChild>
                  <Link href="/grievances/mine">Open</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {(role === "admin" || role === "authority") && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Inbox</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                View assigned grievances and update status / remarks.
                <div className="mt-3">
                  <Button variant="outline" asChild>
                    <Link href="/grievances/inbox">Open</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
