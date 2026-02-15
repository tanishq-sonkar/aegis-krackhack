"use client";

import AppShell from "@/components/shell/AppShell";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function badgeVariant(status: string) {
  if (status === "resolved") return "default";
  if (status === "in_review") return "secondary";
  return "outline";
}

export default function MyGrievances() {
  const { user, loading } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) return;

    const qy = query(
      collection(db, "grievances"),
      where("createdBy", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(qy, (snap) => {
      setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setReady(true);
    });

    return () => unsub();
  }, [user]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6">Please login at /login</div>;

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">My Grievances</h1>
            <p className="text-sm text-muted-foreground">All grievances filed by you.</p>
          </div>
          <Button asChild>
            <Link href="/grievances/new">+ New</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent</CardTitle>
          </CardHeader>
          <CardContent>
            {!ready ? (
              <div className="text-sm text-muted-foreground">Loading list…</div>
            ) : rows.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No grievances yet. Create one from “New”.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Open</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((g) => (
                      <TableRow key={g.id}>
                        <TableCell className="font-medium">{g.title}</TableCell>
                        <TableCell>{g.category}</TableCell>
                        <TableCell>
                          <Badge variant={badgeVariant(g.status)}>{g.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/grievances/${g.id}`}>View</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
