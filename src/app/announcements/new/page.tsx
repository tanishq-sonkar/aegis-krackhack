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

function isValidUrl(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function NewAnnouncementPage() {
  const router = useRouter();
  const { user, role, loading } = useAuth();

  const canPost = role === "admin" || role === "authority" || role === "faculty";

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [pinned, setPinned] = useState(false);

  // NEW: optional link
  const [linkUrl, setLinkUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6">Please login at /login</div>;
  if (!canPost) return <div className="p-6">Access denied.</div>;

  async function create() {
    setErr("");
    if (!title.trim() || !body.trim()) {
      setErr("Title and content are required.");
      return;
    }

    const link = linkUrl.trim();
    if (link && !isValidUrl(link)) {
      setErr("Please enter a valid https:// link (or keep it empty).");
      return;
    }

    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 12);

    setSaving(true);
    try {
      await addDoc(collection(db, "announcements"), {
        title: title.trim(),
        body: body.trim(),
        tags: tagList,
        pinned,
        linkUrl: link || null, // NEW

        postedBy: user.uid,
        postedByEmail: user.email || "",
        createdAt: serverTimestamp(),
      });

      router.push("/announcements");
    } catch (e: any) {
      setErr(e.message || "Failed to post.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Post Announcement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Title (e.g., Midsem schedule released)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <Textarea
              rows={8}
              placeholder="Write announcement..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />

            {/* NEW: Link */}
            <Input
              placeholder="Optional link (Google Form / PDF / Drive / Website)"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />

            <Input
              placeholder="Tags (comma separated) e.g., exams, hostel, academics"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
              />
              Pin this announcement
            </label>

            {err && <p className="text-sm text-red-600">{err}</p>}

            <Button onClick={create} disabled={saving}>
              {saving ? "Posting..." : "Post"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
