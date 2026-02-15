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

export default function ResourcesPage() {
  const { user, role, loading } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const qy = query(collection(db, "resources"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(qy, (snap) => {
      setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const canUpload = role === "admin" || role === "authority" || role === "faculty";

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => {
      return (
        (r.title || "").toLowerCase().includes(s) ||
        (r.courseCode || "").toLowerCase().includes(s) ||
        (r.type || "").toLowerCase().includes(s)
      );
    });
  }, [rows, search]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6">Please login at /login</div>;

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Resources</h1>
            <p className="text-sm text-muted-foreground">
              Course resources uploaded by faculty/authorities.
            </p>
          </div>
          {canUpload && (
            <Button asChild>
              <Link href="/resources/upload">+ Upload</Link>
            </Button>
          )}
        </div>

        <div className="flex gap-2 max-w-xl">
          <Input
            placeholder="Search by title / course code / type…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">No resources found.</div>
          ) : (
            filtered.map((r) => (
              <Card key={r.id}>
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">{r.title}</CardTitle>
                    <Badge variant="secondary">{r.courseCode || "—"}</Badge>
                  </div>
                  <div className="flex gap-2">
                    {r.type && <Badge variant="outline">{r.type}</Badge>}
                    {r.isFile ? (
                      <Badge variant="outline">File</Badge>
                    ) : (
                      <Badge variant="outline">Link</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {r.description && (
                    <p className="text-sm text-muted-foreground">{r.description}</p>
                  )}

                  {r.isFile ? (
                    <Button asChild variant="outline" size="sm">
                      <a href={r.fileUrl} target="_blank" rel="noreferrer">
                        Download / View
                      </a>
                    </Button>
                  ) : (
                    <Button asChild variant="outline" size="sm">
                      <a href={r.linkUrl} target="_blank" rel="noreferrer">
                        Open link
                      </a>
                    </Button>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Uploaded by: {r.uploadedByEmail || r.uploadedBy || "—"}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
