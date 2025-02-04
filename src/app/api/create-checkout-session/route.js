import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    console.log('🔵 Starting checkout process...');
    console.log('🔑 Using Stripe key mode:', process.env.STRIPE_SECRET_KEY?.startsWith('sk_test') ? 'test' : 'live');
    
    const { priceId, userId } = await request.json();
    console.log('📦 Received request data:', { 
      priceId, 
      userId,
      priceIdMode: priceId?.startsWith('price_test') ? 'test' : 'live'
    });

    if (!priceId || !userId) {
      console.log('❌ Missing required parameters:', { priceId, userId });
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Validate price ID format
    if (!priceId.startsWith('price_')) {
      console.log('❌ Invalid price ID format:', priceId);
      return NextResponse.json(
        { error: 'Invalid price ID format' },
        { status: 400 }
      );
    }

    console.log('✅ Parameters validated, creating Stripe checkout session...');

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/tokens?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/tokens`,
      metadata: {
        userId: userId,
      },
    });

    console.log('💳 Stripe session created successfully:', {
      sessionId: session.id,
      url: session.url,
      mode: session.mode
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('❌ Stripe checkout error:', {
      message: error.message,
      code: error.code,
      type: error.type,
      stripeMode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test') ? 'test' : 'live'
    });
    return NextResponse.json(
      { 
        error: error.message,
        details: 'If using test mode, ensure you are using test mode price IDs (starting with price_test)'
      },
      { status: 500 }
    );
  }
} 