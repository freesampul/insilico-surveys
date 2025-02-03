const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

admin.initializeApp();
const db = admin.firestore();

exports.handleStripeCheckoutCompleted = functions.https.onRequest(async (req, res) => {
  const sig = req.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_KEY);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.client_reference_id; // Get the user's ID from the checkout session
      const amountPaid = session.amount_total / 100; // Convert cents to dollars

      let tokens = 0;
      if (amountPaid >= 5) {
        tokens = 100; // Example: 100 tokens for $5+
      } else if (amountPaid >= 10) {
        tokens = 250;
      }

      // Reference to user's document
      const userDocRef = db.collection("users").doc(userId);
      const userDoc = await userDocRef.get();

      let currentTokens = 0;
      if (userDoc.exists) {
        currentTokens = userDoc.data().tokens || 0;
      }

      await userDocRef.set(
        { tokens: currentTokens + tokens },
        { merge: true }
      );

      console.log(`Updated tokens for user ${userId} to ${currentTokens + tokens}`);
    }

    res.status(200).send("Webhook received successfully");
  } catch (err) {
    console.error("Error handling webhook:", err.message);
    res.status(400).send("Webhook Error: " + err.message);
  }
});

exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
  
    const userId = context.auth.uid;
    const priceId = data.priceId; // Stripe price ID from your dashboard
  
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${data.successUrl}`,
        cancel_url: `${data.cancelUrl}`,
        client_reference_id: userId, // Reference the user
      });
  
      return { sessionId: session.id };
    } catch (error) {
      console.error("Error creating checkout session:", error.message);
      throw new functions.https.HttpsError("internal", error.message);
    }
  });