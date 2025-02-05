"use client";

import { ReactNode, useEffect, useState, createContext, useContext } from "react";
import { auth } from "../../../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { ensureUserDocExists, getUserTokens } from "@/utils/firebase.utils";

interface AuthContextProps {
  user: User | null;
  tokens: number;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps>({ user: null, tokens: 0, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Sync Firestore on login
        await ensureUserDocExists(firebaseUser.uid, firebaseUser.email!);
        const userTokens = await getUserTokens(firebaseUser.uid);

        setUser(firebaseUser);
        setTokens(userTokens);
      } else {
        setUser(null);
        setTokens(0);
      }
      setLoading(false); // Stop loading after auth state is determined
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, tokens, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}