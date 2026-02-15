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

export default function UploadResourcePage() {
  const router = useRouter();
  const { user, role, loading } = useAuth();

  const canUpload = role === "admin" || role === "authority" || role === "faculty";

  const [title, setTitle] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [type, setType] = useState("Notes");
  const [description, setDescription] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6">Please login at /login</div>;
  if (!canUpload) return <div className="p-6">Access denied.</div>;

  async function handleUpload() {
    setMsg("");

    if (!title.trim() || !courseCode.trim()) {
      setMsg("Title and Course Code are required.");
      return;
    }
    if (!linkUrl.trim() || !isValidUrl(linkUrl.trim())) {
      setMsg("Please paste a valid https:// link.");
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, "resources"), {
        title: title.trim(),
        courseCode: courseCode.trim().toUpperCase(),
        type,
        description: description.trim(),
        isFile: false,
        linkUrl: linkUrl.trim(),

        uploadedBy: user.uid,
        uploadedByEmail: user.email || "",
        createdAt: serverTimestamp(),
      });

      router.push("/resources");
    } catch (e: any) {
      setMsg(e.code ? `${e.code}: ${e.message}` : e.message || "Upload failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Upload Resource (Link)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Input
                placeholder="Course Code (e.g., EE201P)"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Type</div>
              <select
                className="w-full border rounded-md p-2 bg-background"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option>Notes</option>
                <option>Slides</option>
                <option>Assignment</option>
                <option>Lab</option>
                <option>Other</option>
              </select>
            </div>

            <Textarea
              rows={3}
              placeholder="Short description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="space-y-1">
              <div className="text-sm font-medium">Resource link</div>
              <Input
                placeholder="Paste https:// link (Drive/Notion/GitHub/etc.)"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
              <div className="text-xs text-muted-foreground">
                Tip: For Google Drive, set access to “Anyone with the link can view”.
              </div>
            </div>

            {msg && <p className="text-sm text-red-600">{msg}</p>}

            <Button onClick={handleUpload} disabled={saving}>
              {saving ? "Saving..." : "Save Resource"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
