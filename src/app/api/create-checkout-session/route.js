import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    console.log("🔵 Stripe Checkout API Triggered...");

    const { priceId, userId } = await request.json();
    console.log("📦 Received request data:", { priceId, userId });

    // ✅ Validate required parameters
    if (!priceId || !userId) {
      console.log("❌ Missing required parameters.");
      return NextResponse.json(
        { error: "Missing priceId or userId" },
        { status: 400 }
      );
    }

    // ✅ Ensure priceId format is valid
    if (!priceId.startsWith("price_")) {
      console.log("❌ Invalid price ID format:", priceId);
      return NextResponse.json(
        { error: "Invalid price ID format. Must start with 'price_'" },
        { status: 400 }
      );
    }

    console.log("✅ Creating Stripe Checkout session...");

    const session = await stripe.checkout.sessions.create({
      mode: "subscription", // Change to "payment" if one-time
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId, // ✅ Ensure this is a "price_xxx" ID
          quantity: 1,
        },
      ],
      customer_email: `${userId}@example.com`, // 🔥 TEMP FIX (Replace with actual email)
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/tokens?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/tokens?canceled=true`,
      metadata: { userId },
    });

    console.log("💳 Stripe session created:", session.id);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("❌ Stripe Checkout Error:", {
      message: error.message,
      code: error.code,
      type: error.type,
    });
    return NextResponse.json(
      {
        error: error.message,
        details: "Check your Stripe mode and ensure priceId is correct.",
      },
      { status: 500 }
    );
  }
}