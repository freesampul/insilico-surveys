"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { startCheckoutSession } from "@/utils/firebase.utils";
import { getUserTokens, ensureUserDocExists, db } from "@/utils/firebase.utils";
import { doc, updateDoc } from "firebase/firestore";
import { auth } from "../../utils/firebase.utils";
import { onAuthStateChanged } from "firebase/auth";
import { FaCoins, FaCheckCircle, FaRocket } from "react-icons/fa"; // Icons for plans

export default function TokensPage() {
  const { user } = useAuth();
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


  const handleBuyTokens = async (productId: string) => {
    try {
      if (!user) throw new Error("User must be signed in to purchase tokens.");
      await ensureUserDocExists(user.uid, user.email);
      await startCheckoutSession(productId);
    } catch (err) {
      console.error("❌ Error starting checkout:", err);
    }
  };

  if (loading) {
    return (
      <main className="p-8 bg-[#f5ebe0] min-h-screen flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Tokens</h1>
        <p className="text-gray-700">Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="p-8 bg-[#f5ebe0] min-h-screen flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Tokens</h1>
        <p className="text-gray-700">Please sign in to view and purchase tokens.</p>
      </main>
    );
  }

  return (
    <main className="bg-[#f5ebe0] min-h-screen flex flex-col">
      {/* Token Balance */}
      <div className="p-8 text-gray-900 flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-6">Your Token Balance</h1>

        <div className="bg-white shadow-lg rounded-xl p-6 flex items-center gap-4">
          <FaCoins className="text-yellow-500 text-5xl" />
          {updating ? (
            <p className="text-gray-500 text-xl">Updating tokens...</p>
          ) : (
            <p className="text-4xl font-bold text-green-600">{tokens} tokens</p>
          )}
        </div>
      </div>

      {/* Subscription Plans */}
      <section className="mt-16 max-w-4xl mx-auto text-center px-6">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">Choose a Plan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Basic Plan */}
          <div className="bg-white shadow-lg p-6 rounded-xl text-center flex flex-col items-center">
            <FaCheckCircle className="text-green-500 text-4xl mb-3" />
            <h3 className="text-2xl font-semibold text-gray-800">Basic</h3>
            <p className="text-gray-600 mt-2">500 tokens / month</p>
            <p className="text-xl font-bold text-green-600">$5 / month</p>
            <button onClick={() => handleBuyTokens("price_1QsYsNDT4vO9oNMHEMOrExQu")}
              className="mt-4 bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition"
            >
              Subscribe
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white shadow-lg p-6 rounded-xl text-center flex flex-col items-center">
            <FaRocket className="text-blue-500 text-4xl mb-3" />
            <h3 className="text-2xl font-semibold text-gray-800">Pro</h3>
            <p className="text-gray-600 mt-2">1250 tokens / month</p>
            <p className="text-xl font-bold text-green-600">$10 / month</p>
            <button onClick={() => handleBuyTokens("price_1QsYsnDT4vO9oNMHjm9I6O99")}

              className="mt-4 bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition"
            >
              Subscribe
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white shadow-lg p-6 rounded-xl text-center flex flex-col items-center">
            <FaCoins className="text-yellow-500 text-4xl mb-3" />
            <h3 className="text-2xl font-semibold text-gray-800">Enterprise</h3>
            <p className="text-gray-600 mt-2">5000 tokens / month</p>
            <p className="text-xl font-bold text-green-600">$35 / month</p>
            <button onClick={() => handleBuyTokens("price_1QsYtCDT4vO9oNMHsqVR1KBR")}
              className="mt-4 bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition"
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}