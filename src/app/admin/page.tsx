"use client";

import AppShell from "@/components/shell/AppShell";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  updateDoc,
  where,
  orderBy,
} from "firebase/firestore";
import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Role = "student" | "faculty" | "authority" | "admin";

function RoleBadge({ role }: { role: Role | string }) {
  const r = (role || "-") as string;
  const variant =
    r === "admin" ? "default" : r === "authority" ? "secondary" : "outline";
  return <Badge variant={variant}>{r}</Badge>;
}

export default function AdminPage() {
  const { user, role, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState<Role>("faculty");

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const [users, setUsers] = useState<any[]>([]);
  const [listBusy, setListBusy] = useState(false);

  const isAdmin = role === "admin";

  async function changeRoleByEmail() {
    setMsg("");
    const mail = email.trim().toLowerCase();
    if (!mail) {
      setMsg("Enter an email.");
      return;
    }

    setBusy(true);
    try {
      // Find user doc by email
      const qy = query(
        collection(db, "users"),
        where("email", "==", mail),
        limit(5)
      );
      const snap = await getDocs(qy);

      if (snap.empty) {
        setMsg(
          "No user found with this email in Firestore. Ask them to sign up/login once first."
        );
        return;
      }

      // Usually exactly 1 doc. Update all matches just in case.
      const updates = snap.docs.map((d) =>
        updateDoc(doc(db, "users", d.id), { role: newRole })
      );
      await Promise.all(updates);

      setMsg(`Role updated ✅ (${mail} → ${newRole})`);
      await loadUsers(); // refresh list
    } catch (e: any) {
      setMsg(e.code ? `${e.code}: ${e.message}` : e.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function loadUsers() {
    setListBusy(true);
    setMsg("");
    try {
      // List users (sorted by email, no composite index needed)
      const qy = query(collection(db, "users"), orderBy("email", "asc"), limit(50));
      const snap = await getDocs(qy);
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e: any) {
      setMsg(e.code ? `${e.code}: ${e.message}` : e.message || "Failed to load users");
    } finally {
      setListBusy(false);
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6">Please login at /login</div>;

  if (!isAdmin) {
    return (
      <AppShell>
        <div className="p-2">
          <div className="text-lg font-semibold">Admin</div>
          <div className="text-sm text-muted-foreground mt-1">Access denied.</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl space-y-4">
        <div>
          <div className="text-2xl font-semibold">Admin Panel</div>
          <div className="text-sm text-muted-foreground">
            Manage roles and users (hackathon-safe minimal admin).
          </div>
        </div>

        {msg && (
          <div className="text-sm border rounded-lg p-3 bg-background">
            {msg}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Role Manager (by email)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <Input
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <select
                className="w-full border rounded-md p-2 bg-background"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as Role)}
              >
                <option value="student">student</option>
                <option value="faculty">faculty</option>
                <option value="authority">authority</option>
                <option value="admin">admin</option>
              </select>

              <Button onClick={changeRoleByEmail} disabled={busy}>
                {busy ? "Updating..." : "Update role"}
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              Note: The user must have logged in at least once so their document exists in
              <code className="mx-1">users</code>.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Users (top 50)</CardTitle>
            <Button variant="outline" size="sm" onClick={loadUsers} disabled={listBusy}>
              {listBusy ? "Loading..." : "Refresh"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <Separator />
            {users.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Click <b>Refresh</b> to load users.
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between gap-3 border rounded-lg p-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {u.name || "User"}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {u.email || "-"}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        uid: {u.id}
                      </div>
                    </div>

                    <RoleBadge role={u.role || "-"} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
