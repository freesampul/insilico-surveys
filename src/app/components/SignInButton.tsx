"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { FaGoogle, FaPaperPlane } from "react-icons/fa"; // Import icons

export default function SignInButton() {
  const { user } = useAuth();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Firestore doc creation/update is handled in AuthProvider
      console.log(`✅ Signed in as ${result.user.displayName}`);

      // Redirect to surveys page
      router.push("/surveys");
    } catch (error) {
      console.error("Error signing in: ", error);
    }
  };

  return (
    <div className="flex items-center justify-center">
      {user ? (
        <p></p>
      ) : (
        <button
          onClick={handleGoogleSignIn}
          className="flex items-center gap-3 px-6 py-3 bg-white text-gray-700 text-lg font-medium border border-gray-300 rounded-full shadow-md transition-transform transform hover:scale-105"
        >
          <FaGoogle className="text-red-500 text-xl" /> Sign in with Google
        </button>
      )}
    </div>
  );
}