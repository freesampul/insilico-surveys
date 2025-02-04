"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { startCheckoutSession } from "@/utils/firebase.utils";
import { getUserTokens, ensureUserDocExists } from "@/utils/firebase.utils"; // ✅ New helper function
import { doc, updateDoc, getFirestore } from "firebase/firestore";
import { db } from "../../utils/firebase.utils";
import { onAuthStateChanged, getAuth } from "firebase/auth";

export default function TokensPage() {
  const { user, loading: authLoading } = useAuth();
  const [tokens, setTokens] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [username, setUsername] = useState(""); // ✅ Store username

  useEffect(() => {
    const auth = getAuth();

    // ✅ Ensure the user is authenticated before fetching tokens
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      console.log("🔐 Auth state changed:", authUser?.uid);
      setAuthChecked(true);

      if (authUser) {
        setUsername(authUser.displayName || authUser.email); // ✅ Store username
        await ensureUserDocExists(authUser.uid); // ✅ Ensure Firestore doc exists
        const userTokens = await getUserTokens(authUser.uid); // ✅ Fetch initial tokens
        setTokens(userTokens);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const updateTokensAfterPurchase = async () => {
      if (!user || !authChecked) {
        console.log("⏳ Waiting for auth state...", { user: !!user, authChecked });
        return;
      }

      // ✅ Check if we're returning from a successful purchase
      const urlParams = new URLSearchParams(window.location.search);
      const isSuccess = urlParams.get("success");

      if (isSuccess === "true" && !updating) {
        console.log("💰 Processing successful purchase for user:", user.uid);
        setUpdating(true);

        try {
          const currentTokens = await getUserTokens(user.uid);
          console.log("Current tokens:", currentTokens);

          // ✅ Ensure Firestore document exists before updating
          await ensureUserDocExists(user.uid);

          // ✅ Update tokens in Firestore
          const userDocRef = doc(db, "users", user.uid);
          const newTokens = currentTokens + 100;

          await updateDoc(userDocRef, { tokens: newTokens });

          console.log("✅ Tokens updated successfully:", newTokens);
          setTokens(newTokens);

          // ✅ Clean up the URL after purchase
          window.history.replaceState({}, "", "/tokens");
        } catch (error) {
          console.error("❌ Error updating tokens:", error);
        } finally {
          setUpdating(false);
        }
      }
    };

    if (authChecked) {
      updateTokensAfterPurchase();
    }
  }, [user, authChecked, updating]);

  const handleBuyTokens = async () => {
    try {
      await ensureUserDocExists(user.uid); // ✅ Ensure Firestore doc exists before checkout
      await startCheckoutSession("price_1QosfEDT4vO9oNMHa5zTZkkL");
    } catch (error) {
      console.error("Error starting checkout:", error);
    }
  };

  if (!authChecked || loading) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-white">Tokens</h1>
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <p className="text-gray-400">Loading...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-white">Tokens</h1>
        <p className="text-gray-400">Please sign in to view and purchase tokens.</p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-white">Tokens</h1>

      {/* ✅ Display the logged-in user's username */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-xl text-white mb-2">Logged in as</h2>
        <p className="text-lg font-bold text-blue-400">{username}</p>
      </div>

      {/* ✅ Display token balance */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-xl text-white mb-2">Your Balance</h2>
        {updating ? (
          <p className="text-gray-400">Updating tokens...</p>
        ) : (
          <p className="text-3xl font-bold text-green-500">{tokens} tokens</p>
        )}
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl text-white mb-4">Purchase Tokens</h2>
        <div className="flex flex-col space-y-4">
          <div className="p-4 border border-gray-700 rounded-lg">
            <h3 className="text-lg text-white mb-2">100 Tokens Package</h3>
            <p className="text-gray-400 mb-4">Perfect for getting started with AI survey responses</p>
            <button
              onClick={handleBuyTokens}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Buy for $5.00
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}