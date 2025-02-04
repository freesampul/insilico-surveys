"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { startCheckoutSession } from "@/utils/firebase.utils";
import { getUserTokens, ensureUserDocExists } from "@/utils/firebase.utils";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../utils/firebase.utils";
import { onAuthStateChanged, getAuth } from "firebase/auth";

export default function TokensPage() {
  const { user, loading: authLoading } = useAuth();
  const [tokens, setTokens] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [username, setUsername] = useState(""); // Store username
  const [error, setError] = useState(null); // Store error state

  useEffect(() => {
    const auth = getAuth();

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      try {
        console.log("🔐 Auth state changed:", authUser?.uid);
        setAuthChecked(true); // ✅ Auth state checked

        if (authUser) {
          setUsername(authUser.displayName || authUser.email); // Store username
          await ensureUserDocExists(authUser.uid, authUser.email); // Ensure Firestore doc exists
          const userTokens = await getUserTokens(authUser.uid); // Fetch initial tokens
          setTokens(userTokens); // Set tokens
        } else {
          console.log("🚫 No user found during auth state change.");
        }
      } catch (err) {
        console.error("❌ Error in auth state change logic:", err);
        setError("Failed to fetch user data. Please try again.");
      } finally {
        setLoading(false); // ✅ Stop loading regardless of success/failure
      }
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  useEffect(() => {
    const updateTokensAfterPurchase = async () => {
      if (!user || !authChecked) {
        console.log("⏳ Waiting for auth state...", { user: !!user, authChecked });
        return;
      }

      // Check if we're returning from a successful purchase
      const urlParams = new URLSearchParams(window.location.search);
      const isSuccess = urlParams.get("success");

      if (isSuccess === "true" && !updating) {
        console.log("💰 Processing successful purchase for user:", user.uid);
        setUpdating(true);

        try {
          const currentTokens = await getUserTokens(user.uid);
          console.log("Current tokens:", currentTokens);

          // Ensure Firestore document exists before updating
          await ensureUserDocExists(user.uid, user.email);

          // Update tokens in Firestore
          const userDocRef = doc(db, "users", user.uid);
          const newTokens = currentTokens + 100;

          await updateDoc(userDocRef, { tokens: newTokens });

          console.log("✅ Tokens updated successfully:", newTokens);
          setTokens(newTokens);

          // Clean up the URL after purchase
          window.history.replaceState({}, "", "/tokens");
        } catch (err) {
          console.error("❌ Error updating tokens:", err);
          setError("Failed to update tokens after purchase.");
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
      if (!user) {
        throw new Error("User must be signed in to purchase tokens.");
      }

      await ensureUserDocExists(user.uid, user.email); // Ensure Firestore doc exists before checkout
      await startCheckoutSession("price_1QosfEDT4vO9oNMHa5zTZkkL");
    } catch (err) {
      console.error("❌ Error starting checkout:", err);
      setError("Failed to initiate checkout. Please try again.");
    }
  };

  if (loading) {
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
          <p>{error}</p>
        </div>
      )}

      {/* Display the logged-in user's username */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-xl text-white mb-2">Logged in as</h2>
        <p className="text-lg font-bold text-blue-400">{username}</p>
      </div>

      {/* Display token balance */}
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