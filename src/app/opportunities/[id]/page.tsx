"use client";

import AppShell from "@/components/shell/AppShell";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
  where,
  limit,
} from "firebase/firestore";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function OpportunityDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { user, role, loading } = useAuth();
  const [opp, setOpp] = useState<any>(null);

  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const [apps, setApps] = useState<any[]>([]);
  const [myApp, setMyApp] = useState<any>(null);

  // UI feedback for Accept/Reject/Reviewing
  const [updatingAppId, setUpdatingAppId] = useState<string | null>(null);

  const canPost = role === "admin" || role === "authority" || role === "faculty";
  const isStudent = role === "student";

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "opportunities", id), (snap) => {
      setOpp(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
    return () => unsub();
  }, [id]);

  // show applications to admin/authority/faculty
  useEffect(() => {
    if (!id) return;
    if (!canPost) return;

    const q = query(
      collection(db, "opportunities", id, "applications"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setApps(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [id, canPost]);

  // show student's own application + status
  useEffect(() => {
    if (!id) return;
    if (!user) return;
    if (!isStudent) return;

    const qMy = query(
      collection(db, "opportunities", id, "applications"),
      where("studentId", "==", user.uid),
      limit(1)
    );

    const unsub = onSnapshot(qMy, (snap) => {
      if (snap.empty) setMyApp(null);
      else setMyApp({ id: snap.docs[0].id, ...snap.docs[0].data() });
    });

    return () => unsub();
  }, [id, user, isStudent]);

  const tagList: string[] = useMemo(() => opp?.tags || [], [opp]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6">Please login at /login</div>;
  if (!id) return <div className="p-6">Invalid route.</div>;

  if (opp === null) {
    return (
      <AppShell>
        <div className="space-y-3">
          <div className="text-lg font-semibold">Opportunity not found</div>
          <Link className="underline" href="/opportunities">
            Back to opportunities
          </Link>
        </div>
      </AppShell>
    );
  }

  async function apply() {
    if (!isStudent) return;
    if (!note.trim()) return;
    if (myApp) return; // prevent double apply

    const uid = user?.uid; // ✅ TS-safe
    const email = user?.email || "";

    if (!uid) {
      alert("You are not logged in. Please login again.");
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, "opportunities", id, "applications"), {
        studentId: uid,
        studentEmail: email,
        note: note.trim(),
        status: "applied",
        createdAt: serverTimestamp(),
      });
      setNote("");
      alert("Applied successfully ✅");
    } catch (e: any) {
      alert(e?.message || "Apply failed");
    } finally {
      setSaving(false);
    }
  }

  async function setApplicationStatus(
    appId: string,
    status: "accepted" | "rejected" | "reviewing" | "applied"
  ) {
    if (!canPost) return;
    setUpdatingAppId(appId);
    try {
      await updateDoc(doc(db, "opportunities", id, "applications", appId), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (e: any) {
      alert(e?.message || "Failed to update status");
    } finally {
      setUpdatingAppId(null);
    }
  }

  return (
    <AppShell>
      <div className="max-w-3xl space-y-4">
        <div className="flex items-center justify-between">
          <Link className="text-sm underline" href="/opportunities">
            ← Back
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{opp.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Posted by: {opp.postedByEmail || "-"}
            </div>

            {opp.deadline && (
              <div className="text-sm">
                <span className="text-muted-foreground">Deadline:</span>{" "}
                <span className="font-medium">{opp.deadline}</span>
              </div>
            )}

            {!!tagList.length && (
              <div className="flex flex-wrap gap-2">
                {tagList.map((t: string) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>
            )}

            <div className="whitespace-pre-wrap text-sm">{opp.description}</div>
          </CardContent>
        </Card>

        {isStudent && myApp && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Application</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm flex items-center gap-2">
                <span>Status:</span>
                <Badge variant="secondary">{myApp.status}</Badge>
              </div>
              {myApp.note && (
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  <span className="font-medium text-foreground">Your note:</span>{" "}
                  {myApp.note}
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                If status is “accepted”, you will be contacted by the poster.
              </div>
            </CardContent>
          </Card>
        )}

        {isStudent && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Apply</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {myApp && (
                <div className="text-sm text-muted-foreground">
                  You have already applied. Your status is shown above.
                </div>
              )}

              <Textarea
                rows={4}
                placeholder="Write a short note (your interest, skills, link to resume/portfolio if any)..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />

              <Button onClick={apply} disabled={saving || !note.trim() || !!myApp}>
                {saving ? "Applying..." : "Submit application"}
              </Button>

              <div className="text-xs text-muted-foreground">
                Tip: Paste your resume/portfolio link inside the note.
              </div>
            </CardContent>
          </Card>
        )}

        {canPost && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Applications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {apps.length === 0 && (
                <div className="text-sm text-muted-foreground">No applications yet.</div>
              )}

              {apps.map((a) => {
                const updating = updatingAppId === a.id;

                return (
                  <div key={a.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium">{a.studentEmail}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">status:</span>
                          <Badge variant="secondary">{a.status}</Badge>
                          {updating && (
                            <span className="text-xs text-muted-foreground">Updating...</span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updating}
                          onClick={() => setApplicationStatus(a.id, "reviewing")}
                        >
                          {updating ? "Updating..." : "Reviewing"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updating}
                          onClick={() => setApplicationStatus(a.id, "accepted")}
                        >
                          {updating ? "Updating..." : "Accept"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updating}
                          onClick={() => setApplicationStatus(a.id, "rejected")}
                        >
                          {updating ? "Updating..." : "Reject"}
                        </Button>
                      </div>
                    </div>

                    <div className="text-sm mt-2 whitespace-pre-wrap">{a.note}</div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
