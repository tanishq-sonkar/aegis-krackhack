"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function ensureUserDoc(uid: string, payload: any) {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) await setDoc(ref, payload);
  }

  async function handleSubmit() {
    setError("");
    setInfo("");
    setLoading(true);
    try {
      if (isSignup) {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await ensureUserDoc(res.user.uid, {
          name: name || "User",
          email,
          role: "student",
          createdAt: Date.now(),
        });
      } else {
        const res = await signInWithEmailAndPassword(auth, email, password);
        await ensureUserDoc(res.user.uid, { email, role: "student" });
      }
      router.push("/dashboard");
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setError("");
    setInfo("");
    if (!email.trim()) {
      setError("Enter your email first, then click Forgot password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfo("Password reset link sent to your email ✅");
    } catch (e: any) {
      setError(e?.message || "Failed to send reset email");
    }
  }

  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-4">
      <div className="w-full max-w-md glass rounded-2xl p-7">
        <div className="text-center">
          <div className="text-3xl font-semibold tracking-tight">
            <span className="text-primary">AEGIS</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {isSignup ? "Create an account to continue" : "Login to continue"}
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {isSignup && (
            <Input
              className="h-11"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <Input
            className="h-11"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            inputMode="email"
            autoComplete="email"
          />

          <Input
            className="h-11"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isSignup ? "new-password" : "current-password"}
          />

          {error && <p className="text-sm text-red-400">{error}</p>}
          {info && <p className="text-sm text-emerald-300">{info}</p>}

          {/* ✅ Cyan primary button (uses shadcn + --primary) */}
          <Button
            className="w-full h-11 text-base font-medium"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (isSignup ? "Creating..." : "Signing in...") : isSignup ? "Create account" : "Sign in"}
          </Button>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </button>

            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-sm text-primary hover:underline"
            >
              {isSignup ? "Already have an account?" : "New here? Create account"}
            </button>
          </div>

          <div className="pt-2 text-center text-xs text-muted-foreground">
            By continuing, you agree to the campus policies.
          </div>
        </div>
      </div>
    </div>
  );
}
