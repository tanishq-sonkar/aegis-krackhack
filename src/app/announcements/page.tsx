"use client";

import AppShell from "@/components/shell/AppShell";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function AnnouncementsPage() {
  const { user, role, loading } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");

const canPost = ["admin", "authority", "faculty"].includes((role ?? "") as string);


  useEffect(() => {
    const qy = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(qy, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return items;
    return items.filter((a) => {
      return (
        (a.title || "").toLowerCase().includes(s) ||
        (a.body || "").toLowerCase().includes(s) ||
        (a.tags || []).join(" ").toLowerCase().includes(s)
      );
    });
  }, [items, search]);

  const pinned = filtered.filter((x) => !!x.pinned);
  const normal = filtered.filter((x) => !x.pinned);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6">Please login at /login</div>;

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-2xl font-semibold">Announcements</div>
            <div className="text-sm text-muted-foreground">
              Official notices from faculty/authorities.
            </div>
          </div>
          {canPost && (
            <Button asChild>
              <Link href="/announcements/new">+ New</Link>
            </Button>
          )}
        </div>

        <div className="max-w-md">
          <Input
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {pinned.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-semibold">Pinned</div>
            <div className="grid gap-3 md:grid-cols-2">
              {pinned.map((a) => (
                <Card key={a.id} >
                  <CardHeader className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{a.title}</CardTitle>
                      <Badge variant="secondary">Pinned</Badge>
                    </div>
                    {!!a.tags?.length && (
                      <div className="flex flex-wrap gap-2">
                        {a.tags.slice(0, 6).map((t: string) => (
                          <Badge key={t} variant="outline">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-2">
                    <div className="text-sm whitespace-pre-wrap line-clamp-6">{a.body}</div>

                    {/* NEW: optional link */}
                    {a.linkUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={a.linkUrl} target="_blank" rel="noreferrer">
                          Open link
                        </a>
                      </Button>
                    )}

                    <div className="text-xs text-muted-foreground">
                      by {a.postedByEmail || "-"}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="text-sm font-semibold">All</div>
          <div className="grid gap-3 md:grid-cols-2">
            {normal.map((a) => (
              <Card key={a.id}>
                <CardHeader className="space-y-2">
                  <CardTitle className="text-base">{a.title}</CardTitle>
                  {!!a.tags?.length && (
                    <div className="flex flex-wrap gap-2">
                      {a.tags.slice(0, 6).map((t: string) => (
                        <Badge key={t} variant="outline">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-2">
                  <div className="text-sm whitespace-pre-wrap line-clamp-6">{a.body}</div>

                  {/* NEW: optional link */}
                  {a.linkUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={a.linkUrl} target="_blank" rel="noreferrer">
                        Open link
                      </a>
                    </Button>
                  )}

                  <div className="text-xs text-muted-foreground">
                    by {a.postedByEmail || "-"}
                  </div>
                </CardContent>
              </Card>
            ))}

            {filtered.length === 0 && (
              <div className="text-sm text-muted-foreground">No announcements.</div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
