"use client";

import AppShell from "@/components/shell/AppShell";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type Opportunity = {
  id: string;
  title: string;
  description: string;
  deadline?: any;
  tags?: string[];
  postedByEmail?: string;
  createdAt?: any;
};

export default function OpportunitiesPage() {
  const { user, role, loading } = useAuth();
  const [items, setItems] = useState<Opportunity[]>([]);
  const [search, setSearch] = useState("");

  const canPost = role === "admin" || role === "authority" || role === "faculty";

  useEffect(() => {
    const q = query(collection(db, "opportunities"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });
    return () => unsub();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6">Please login at /login</div>;

  const filtered = items.filter((o) => {
    const s = search.trim().toLowerCase();
    if (!s) return true;
    return (
      (o.title || "").toLowerCase().includes(s) ||
      (o.description || "").toLowerCase().includes(s) ||
      (o.tags || []).join(" ").toLowerCase().includes(s)
    );
  });

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xl font-semibold">Opportunities</div>
            <div className="text-sm text-muted-foreground">
              Internships, research, projects, roles
            </div>
          </div>

          {canPost && (
            <Button asChild>
              <Link href="/opportunities/new">+ New</Link>
            </Button>
          )}
        </div>

        <div className="max-w-md">
          <Input
            placeholder="Search by title / tags / description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((o) => (
            <Card key={o.id} className="hover:shadow-sm transition">
              <CardHeader>
                <CardTitle className="text-base">
                  <Link className="underline" href={`/opportunities/${o.id}`}>
                    {o.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-muted-foreground line-clamp-2">
                  {o.description}
                </div>

                {!!o.tags?.length && (
                  <div className="flex flex-wrap gap-2">
                    {o.tags.slice(0, 6).map((t) => (
                      <Badge key={t} variant="secondary">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Posted by: {o.postedByEmail || "-"}
                </div>
              </CardContent>
            </Card>
          ))}

          {filtered.length === 0 && (
            <div className="text-sm text-muted-foreground">No opportunities found.</div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
