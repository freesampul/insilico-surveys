"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { startCheckoutSession } from "@/utils/firebase.utils";
import { getUserTokens, ensureUserDocExists, db } from "@/utils/firebase.utils";
import { doc, updateDoc } from "firebase/firestore";
import { auth } from "../../utils/firebase.utils";
import { onAuthStateChanged } from "firebase/auth";

export default function TokensPage() {
  const { user } = useAuth(); // Get user from context
  const [tokens, setTokens] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          await ensureUserDocExists(firebaseUser.uid, firebaseUser.email);
          const userTokens = await getUserTokens(firebaseUser.uid);
          setTokens(userTokens);
        } else {
          setTokens(0);
        }
      } catch (err) {
        console.error("❌ Error in auth state change logic:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const updateTokensAfterPurchase = async () => {
      if (!user) return;

      const urlParams = new URLSearchParams(window.location.search);
      const isSuccess = urlParams.get("success");

      if (isSuccess === "true" && !updating) {
        setUpdating(true);
        try {
          const currentTokens = await getUserTokens(user.uid);
          const userDocRef = doc(db, "users", user.uid);
          const newTokens = currentTokens + 100;

          await updateDoc(userDocRef, { tokens: newTokens });
          setTokens(newTokens);

          window.history.replaceState({}, "", "/tokens");
        } catch (err) {
          console.error("❌ Error updating tokens:", err);
        } finally {
          setUpdating(false);
        }
      }
    };

    updateTokensAfterPurchase();
  }, [user, updating]);

  const handleBuyTokens = async (priceId: string) => {
    try {
      if (!user) throw new Error("User must be signed in to purchase tokens.");
      await ensureUserDocExists(user.uid, user.email);
      await startCheckoutSession(priceId);
    } catch (err) {
      console.error("❌ Error starting checkout:", err);
    }
  };

  if (loading) {
    return (
      <main className="p-8 bg-[#f5f5dc] min-h-screen flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Tokens</h1>
        <p className="text-gray-700">Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="p-8 bg-[#f5f5dc] min-h-screen flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Tokens</h1>
        <p className="text-gray-700">Please sign in to view and purchase tokens.</p>
      </main>
    );
  }

  return (
    <main className="bg-[#f5f5dc] min-h-screen flex flex-col justify-between">
      {/* Main Content */}
      <div className="p-8 text-gray-900">
        <h1 className="text-3xl font-bold mb-6">Your Token Balance</h1>

        {/* Token Balance Card */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Current Balance</h2>
          {updating ? (
            <p className="text-gray-500">Updating tokens...</p>
          ) : (
            <p className="text-3xl font-bold text-green-600">{tokens} tokens</p>
          )}
        </div>

        {/* Subscription Plans */}
        <h2 className="text-2xl font-semibold mb-4">Subscription Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Basic Plan */}
          <div className="bg-white shadow-md p-6 rounded-lg text-center">
            <h3 className="text-2xl font-semibold text-gray-800">Basic</h3>
            <p className="text-gray-600 mt-2">100 tokens / month</p>
            <p className="text-xl font-bold text-green-600">$5 / month</p>
            <button
              onClick={() => handleBuyTokens("price_basic_placeholder")}
              className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Subscribe
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white shadow-md p-6 rounded-lg text-center">
            <h3 className="text-2xl font-semibold text-gray-800">Pro</h3>
            <p className="text-gray-600 mt-2">250 tokens / month</p>
            <p className="text-xl font-bold text-green-600">$10 / month</p>
            <button
              onClick={() => handleBuyTokens("price_pro_placeholder")}
              className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Subscribe
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white shadow-md p-6 rounded-lg text-center">
            <h3 className="text-2xl font-semibold text-gray-800">Enterprise</h3>
            <p className="text-gray-600 mt-2">1000 tokens / month</p>
            <p className="text-xl font-bold text-green-600">$35 / month</p>
            <button
              onClick={() => handleBuyTokens("price_enterprise_placeholder")}
              className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center py-4 mt-8">
        <p className="text-gray-400">© 2025 Insilico Surveys. All Rights Reserved.</p>
      </footer>
    </main>
  );
}