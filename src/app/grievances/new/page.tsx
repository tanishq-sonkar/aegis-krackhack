"use client";

import AppShell from "@/components/shell/AppShell";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function NewGrievance() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6">Please login at /login</div>;

  async function submit() {
    setError("");

    const uid = user?.uid; // ✅ TS-safe
    const email = user?.email || "";

    if (!uid) {
      setError("You are not logged in. Please login again.");
      return;
    }

    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      return;
    }

    setSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, "grievances"), {
        createdBy: uid,
        createdByEmail: email, // (optional but useful)
        title: title.trim(),
        category,
        description: description.trim(),
        status: "submitted",
        assignedTo: null,
        createdAt: serverTimestamp(),
      });

      router.push(`/grievances/${docRef.id}`);
    } catch (e: any) {
      setError(e?.message || "Failed to submit grievance");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>New Grievance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div className="space-y-1">
              <div className="text-sm font-medium">Category</div>
              <select
                className="w-full border rounded-md p-2 bg-background"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>General</option>
                <option>Hostel</option>
                <option>Mess</option>
                <option>Academics</option>
                <option>Infrastructure</option>
              </select>
            </div>

            <Textarea
              rows={6}
              placeholder="Describe the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button onClick={submit} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
