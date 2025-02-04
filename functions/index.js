const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(functions.config().stripe.secret);
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Create checkout session endpoint
app.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price: req.body.priceId,
        quantity: 1,
      }],
      success_url: 'https://us-central1-sidehustles-ff134.cloudfunctions.net/handleStripeCheckoutCompleted',
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/tokens`,
      metadata: {
        userId: req.body.userId,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;

    try {
      // Add 100 tokens to user's balance
      const userRef = admin.firestore().collection('users').doc(userId);
      await admin.firestore().runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const currentTokens = userDoc.exists ? (userDoc.data().tokens || 0) : 0;
        transaction.set(userRef, { tokens: currentTokens + 100 }, { merge: true });
      });
    } catch (error) {
      console.error('Error updating user tokens:', error);
      return res.status(500).send('Error processing payment');
    }
  }

  res.json({ received: true });
});

// Separate function for handling checkout completion
exports.handleStripeCheckoutCompleted = functions.https.onRequest(async (req, res) => {
  const session = req.body;
  const userId = session.metadata.userId;

  try {
    // Add 100 tokens to user's balance
    const userRef = admin.firestore().collection('users').doc(userId);
    await admin.firestore().runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      const currentTokens = userDoc.exists ? (userDoc.data().tokens || 0) : 0;
      transaction.set(userRef, { tokens: currentTokens + 100 }, { merge: true });
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating user tokens:', error);
    res.status(500).json({ error: 'Error processing payment' });
  }
});

// Export the Express app as Cloud Functions
exports.api = functions.https.onRequest(app);