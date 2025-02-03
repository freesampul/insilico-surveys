"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInButton() {
  const [user, setUser] = useState<any>(null);

  const router = useRouter();

const handleGoogleSignIn = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    setUser(result.user);
    
    // ✅ Redirect to surveys after login
    router.push("/surveys");
  } catch (error) {
    console.error("Error signing in: ", error);
  }
};

  return (
    <div>
      {user ? (
  <div>
    <p>Welcome, {user.displayName}!</p>
    <p>Email: {user.email}</p>
    <button
      onClick={() => router.push("/surveys")}
      className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
    >
      📋 Go to Surveys
    </button>
  </div>
) : (
  <button
    onClick={handleGoogleSignIn}
    className="px-4 py-2 bg-blue-500 text-white rounded"
  >
    Sign in with Google
  </button>
)}
    </div>
  );
}