import { getFunctions, httpsCallable } from "firebase/functions";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

export const auth = getAuth(); // Export auth instance
export const db = getFirestore(); // Export Firestore instance

const YOUR_DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || "https://nsilico.net"; // Ensure HTTPS

/** 
 * ✅ Ensure a user's Firestore document exists and includes their email.
 */
export const ensureUserDocExists = async (uid, email) => {
  try {
    console.log("🔍 Checking if user doc exists:", uid);
    const userDocRef = doc(db, "users", uid);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      console.log("🚀 Creating new user document with tokens and email...");
      await setDoc(userDocRef, { tokens: 100, email }, { merge: true });
    } else {
      // Update the email if it's missing or outdated
      const currentData = userSnap.data();
      if (!currentData.email || currentData.email !== email) {
        console.log("🔄 Updating user's email in Firestore...");
        await setDoc(userDocRef, { email }, { merge: true });
      }
    }
  } catch (error) {
    console.error("❌ Error ensuring user doc exists:", error);
  }
};

/**
 * ✅ Start a Stripe Checkout Session
 */
export const startCheckoutSession = async (priceId) => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("User must be logged in");
  }

  try {
    await ensureUserDocExists(currentUser.uid, currentUser.email); // ✅ Ensure Firestore doc exists before checkout

    console.log("✅ Initiating Stripe checkout session...");
    console.log("📌 Domain:", YOUR_DOMAIN);
    console.log("📌 Price ID:", priceId);

    const response = await fetch(`${YOUR_DOMAIN}/api/create-checkout-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceId,
        userId: currentUser.uid,
        successUrl: `${YOUR_DOMAIN}/tokens?success=true`,
        cancelUrl: `${YOUR_DOMAIN}/tokens?canceled=true`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Checkout session error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`Failed to create checkout session: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.url) {
      throw new Error("No checkout URL received from server");
    }

    console.log("✅ Redirecting to:", data.url);
    window.location.href = data.url;
  } catch (error) {
    console.error("❌ Error starting checkout:", error);
    throw error;
  }
};

/**
 * ✅ Fetch a user's token balance from Firestore.
 */
export const getUserTokens = async (uid) => {
  try {
    const userDocRef = doc(db, "users", uid);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      return userSnap.data().tokens || 0;
    } else {
      return 0;
    }
  } catch (error) {
    console.error("❌ Error fetching tokens:", error);
    return 0;
  }
};

/**
 * ✅ Create a Stripe customer and link their email.
 */
export const createStripeCustomer = async (user) => {
  const functions = getFunctions();
  const createStripeCustomerFunction = httpsCallable(functions, "createStripeCustomer");

  try {
    const { data } = await createStripeCustomerFunction({ email: user.email });

    // Store the customer ID in Firestore
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(
      userDocRef,
      {
        stripeCustomerId: data.customerId,
        email: user.email,
      },
      { merge: true }
    );

    return data.customerId;
  } catch (error) {
    console.error("❌ Error creating Stripe customer:", error);
    throw error;
  }
};