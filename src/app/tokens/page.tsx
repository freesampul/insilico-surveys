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
  const [error, setError] = useState(null); // Store error state

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
      <h1 className="text-3xl font-bold text-white mb-6">Token Plans</h1>

      {/* Display token balance */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-xl text-white mb-2">Your Balance</h2>
        {updating ? (
          <p className="text-gray-400">Updating tokens...</p>
        ) : (
          <p className="text-3xl font-bold text-green-500">{tokens} tokens</p>
        )}
      </div>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basic Plan */}
        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <h3 className="text-2xl font-bold text-white">Basic</h3>
          <p className="text-gray-400 mt-2">100 tokens / month</p>
          <p className="text-xl font-bold text-green-400">$5 / month</p>
          <button
            onClick={() => handleBuyTokens("price_basic_placeholder")}
            className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Subscribe
          </button>
        </div>

        {/* Pro Plan */}
        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <h3 className="text-2xl font-bold text-white">Pro</h3>
          <p className="text-gray-400 mt-2">250 tokens / month</p>
          <p className="text-xl font-bold text-green-400">$10 / month</p>
          <button
            onClick={() => handleBuyTokens("price_pro_placeholder")}
            className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Subscribe
          </button>
        </div>

        {/* Enterprise Plan */}
        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <h3 className="text-2xl font-bold text-white">Enterprise</h3>
          <p className="text-gray-400 mt-2">1000 tokens / month</p>
          <p className="text-xl font-bold text-green-400">$35 / month</p>
          <button
            onClick={() => handleBuyTokens("price_enterprise_placeholder")}
            className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Subscribe
          </button>
        </div>
      </div>

      {/* One-Time Token Purchases */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-4">One-Time Purchases</h2>
      <div className="bg-gray-800 p-6 rounded-lg text-center">
        <h3 className="text-2xl font-bold text-white">100 Tokens</h3>
        <p className="text-xl font-bold text-green-400">$5 (One-Time)</p>
        <button
          onClick={() => handleBuyTokens("price_onetime_placeholder")}
          className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Buy Now
        </button>
      </div>
    </main>
  );
}