const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(functions.config().stripe.secret);
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// ✅ CREATE CHECKOUT SESSION
app.post("/create-checkout-session", async (req, res) => {
  try {
    if (!req.body.priceId || !req.body.userId) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price: req.body.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/tokens?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/tokens?canceled=true`,
      metadata: {
        userId: req.body.userId,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("❌ Error creating checkout session:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ WEBHOOK ENDPOINT FOR PAYMENT SUCCESS
app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("✅ Webhook event received:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata.userId;

    try {
      // ✅ Fetch line items to determine which product was purchased
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const purchasedPriceId = lineItems.data[0]?.price.id;

      // ✅ Correct token amounts
      const tokenMapping = {
        "price_1QsYsNDT4vO9oNMHEMOrExQu": 500,  // Basic Plan
        "price_1QsYsnDT4vO9oNMHjm9I6O99": 1250, // Pro Plan
        "price_1QsYtCDT4vO9oNMHsqVR1KBR": 5000 // Enterprise Plan
      };

      const tokensToAdd = tokenMapping[purchasedPriceId] || 0; // Default to 0 if no match

      if (tokensToAdd === 0) {
        console.warn("⚠️ No matching product found for:", purchasedPriceId);
        return res.status(400).send("Invalid product purchase.");
      }

      // ✅ Update Firestore user token balance
      const userRef = admin.firestore().collection("users").doc(userId);
      await admin.firestore().runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const currentTokens = userDoc.exists ? (userDoc.data().tokens || 0) : 0;
        transaction.set(userRef, { tokens: currentTokens + tokensToAdd }, { merge: true });
      });

      console.log(`💰 Successfully added ${tokensToAdd} tokens to user ${userId}`);
    } catch (error) {
      console.error("❌ Error updating user tokens:", error);
      return res.status(500).send("Error processing payment");
    }
  }

  res.json({ received: true });
});

// ✅ DEPLOY FUNCTION
exports.api = functions.https.onRequest(app);