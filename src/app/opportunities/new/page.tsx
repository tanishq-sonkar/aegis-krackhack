"use client";

import AppShell from "@/components/shell/AppShell";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function NewOpportunityPage() {
  const router = useRouter();
  const { user, role, loading } = useAuth();

  const canPost = role === "admin" || role === "authority" || role === "faculty";

  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState(""); // yyyy-mm-dd
  const [tags, setTags] = useState(""); // comma separated
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6">Please login at /login</div>;
  if (!canPost) return <div className="p-6">Access denied.</div>;

  async function create() {
    setErr("");
    if (!title.trim() || !description.trim()) {
      setErr("Title and description are required.");
      return;
    }

    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 12);

    setSaving(true);
    try {
      const docRef = await addDoc(collection(db, "opportunities"), {
        title: title.trim(),
        description: description.trim(),
        deadline: deadline ? deadline : null, // keep simple (string). You can upgrade to Timestamp later.
        tags: tagList,
        postedBy: user.uid,
        postedByEmail: user.email || "",
        createdAt: serverTimestamp(),
      });

      router.push(`/opportunities/${docRef.id}`);
    } catch (e: any) {
      setErr(e.message || "Failed to create.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Create Opportunity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Title (e.g., Research Intern - Signal Processing)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <Input
              placeholder="Deadline (optional) - YYYY-MM-DD"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />

            <Input
              placeholder="Tags (comma separated) e.g., ML, Web, Internship"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />

            <Textarea
              rows={7}
              placeholder="Full description + eligibility + how to apply..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {err && <p className="text-sm text-red-600">{err}</p>}

            <Button onClick={create} disabled={saving}>
              {saving ? "Creating..." : "Create"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
