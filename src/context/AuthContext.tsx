"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

// ✅ Include faculty too
export type Role = "student" | "authority" | "admin" | "faculty";

type AuthState = {
  user: User | null;
  role: Role | null;
  loading: boolean;
};

const AuthContext = createContext<AuthState>({
  user: null,
  role: null,
  loading: true,
});

// ✅ Small runtime guard so random/invalid role values don't break typing
function normalizeRole(value: unknown): Role {
  const r = String(value || "").toLowerCase();
  if (r === "admin") return "admin";
  if (r === "authority") return "authority";
  if (r === "faculty") return "faculty";
  return "student";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (!u) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        const roleFromDb = snap.exists() ? snap.data()?.role : null;
        setRole(normalizeRole(roleFromDb));
      } catch {
        // fallback: keep app usable even if Firestore read fails
        setRole("student");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
