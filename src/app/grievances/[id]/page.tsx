"use client";

import AppShell from "@/components/shell/AppShell";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  getDocs,
  where,
  limit,
} from "firebase/firestore";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function statusBadgeVariant(status: string) {
  if (status === "resolved") return "default";
  if (status === "in_review") return "secondary";
  return "outline";
}

export default function GrievanceDetail() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { user, role, loading } = useAuth();
  const [g, setG] = useState<any>(null);
  const [updates, setUpdates] = useState<any[]>([]);
  const [comment, setComment] = useState("");
  const [newStatus, setNewStatus] = useState("in_review");
  const [saving, setSaving] = useState(false);

  // Admin assignment (by email)
  const [assignEmail, setAssignEmail] = useState("");
  const [assignMsg, setAssignMsg] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (!id) return;

    const unsub = onSnapshot(doc(db, "grievances", id), (snap) => {
      setG(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });

    const uq = query(
      collection(db, "grievances", id, "updates"),
      orderBy("createdAt", "asc")
    );

    const unsub2 = onSnapshot(uq, (snap) => {
      setUpdates(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsub();
      unsub2();
    };
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6">Please login at /login</div>;
  if (!id) return <div className="p-6">Invalid route.</div>;

  if (g === null) {
    return (
      <AppShell>
        <div className="space-y-3">
          <div className="text-lg font-semibold">Grievance not found</div>
          <Link className="underline" href="/grievances">
            Back to grievances
          </Link>
        </div>
      </AppShell>
    );
  }

  const canUpdate = role === "admin" || role === "authority";

  async function addUpdate() {
    if (!canUpdate) return;
    if (!comment.trim()) return;

    setSaving(true);
    try {
      await addDoc(collection(db, "grievances", id, "updates"), {
        by: user.uid,
        comment: comment.trim(),
        newStatus,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "grievances", id), { status: newStatus });
      setComment("");
    } finally {
      setSaving(false);
    }
  }

  async function assignToAuthorityByEmail() {
    if (role !== "admin") return;

    setAssignMsg("");
    const email = assignEmail.trim().toLowerCase();
    if (!email) {
      setAssignMsg("Enter an email.");
      return;
    }

    setAssigning(true);
    try {
      const qUser = query(collection(db, "users"), where("email", "==", email), limit(1));
      const snap = await getDocs(qUser);

      if (snap.empty) {
        setAssignMsg("No user found with this email.");
        return;
      }

      const authorityUid = snap.docs[0].id;

      await updateDoc(doc(db, "grievances", id), { assignedTo: authorityUid });

      // Optional: log assignment in timeline (keeps status unchanged)
      await addDoc(collection(db, "grievances", id, "updates"), {
        by: user.uid,
        comment: `Assigned to: ${email}`,
        newStatus: g.status ?? "submitted",
        createdAt: serverTimestamp(),
      });

      setAssignMsg("Assigned successfully ✅");
      setAssignEmail("");
    } catch (e: any) {
      setAssignMsg(e.message || "Failed to assign");
    } finally {
      setAssigning(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-3xl space-y-4">
        <div className="flex items-center justify-between">
          <Link className="text-sm underline" href="/grievances">
            ← Back
          </Link>
          <Badge variant={statusBadgeVariant(g.status)}>{g.status}</Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{g.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-muted-foreground">{g.category}</div>
            <div className="text-sm">{g.description}</div>

            {g.assignedTo ? (
              <div className="text-xs text-muted-foreground">
                AssignedTo UID: <span className="font-medium">{g.assignedTo}</span>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">Not assigned yet.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {updates.length === 0 && (
              <div className="text-sm text-muted-foreground">No updates yet.</div>
            )}
            {updates.map((u) => (
              <div key={u.id} className="border rounded-lg p-3">
                <div className="text-xs text-muted-foreground">
                  status → <span className="font-medium">{u.newStatus}</span>
                </div>
                <div className="text-sm mt-1">{u.comment}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        {role === "admin" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assign to Authority (by Email)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <input
                className="w-full border rounded-md p-2 bg-background"
                placeholder="authority@example.com"
                value={assignEmail}
                onChange={(e) => setAssignEmail(e.target.value)}
              />
              <Button
                onClick={assignToAuthorityByEmail}
                disabled={assigning || !assignEmail.trim()}
              >
                {assigning ? "Assigning..." : "Assign"}
              </Button>
              {assignMsg && <p className="text-sm text-muted-foreground">{assignMsg}</p>}
            </CardContent>
          </Card>
        )}

        {canUpdate && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <select
                className="w-full border rounded-md p-2 bg-background"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="submitted">submitted</option>
                <option value="in_review">in_review</option>
                <option value="resolved">resolved</option>
              </select>

              <Textarea
                rows={3}
                placeholder="Comment / remark..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />

              <Button onClick={addUpdate} disabled={saving || !comment.trim()}>
                {saving ? "Saving..." : "Add update"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
