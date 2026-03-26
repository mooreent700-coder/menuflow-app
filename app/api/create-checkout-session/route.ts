import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

function getFeePercent(plan: string | null | undefined) {
  const normalized = (plan || "starter").toLowerCase();
  if (normalized === "growth") return 0.05;
  if (normalized === "premium") return 0.03;
  return 0.10;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cart, restaurantId, slug, orderId } = body || {};

    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: "No cart items" }, { status: 400 });
    }

    let restaurantQuery = supabase.from("restaurants").select("*");

    if (restaurantId) {
      restaurantQuery = restaurantQuery.eq("id", restaurantId);
    } else if (slug) {
      restaurantQuery = restaurantQuery.eq("slug", slug);
    } else {
      return NextResponse.json({ error: "Missing restaurant" }, { status: 400 });
    }

    const { data: restaurant, error: restaurantError } = await restaurantQuery.maybeSingle();

    if (restaurantError || !restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    if (!restaurant.stripe_account_id) {
      return NextResponse.json(
        { error: "Restaurant Stripe account is not connected yet." },
        { status: 400 }
      );
    }

    if (!restaurant.stripe_charges_enabled) {
      return NextResponse.json(
        { error: "Restaurant Stripe onboarding is not complete yet." },
        { status: 400 }
      );
    }

    const line_items = cart.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name || item.name_en || item.name_es || "Item",
        },
        unit_amount: Math.round(Number(item.price || 0) * 100),
      },
      quantity: Number(item.qty || 1),
    }));

    const subtotal = cart.reduce((sum: number, item: any) => {
      const price = Number(item.price || 0);
      const qty = Number(item.qty || 1);
      return sum + Math.round(price * 100) * qty;
    }, 0);

    const feePercent = getFeePercent(restaurant.plan);
    const applicationFeeAmount = Math.max(0, Math.round(subtotal * feePercent));
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      success_url: `${origin}/checkout/success?slug=${restaurant.slug || slug || ""}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel?slug=${restaurant.slug || slug || ""}`,
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
          destination: restaurant.stripe_account_id,
        },
        metadata: {
          restaurantId: String(restaurant.id || ""),
          restaurantSlug: String(restaurant.slug || slug || ""),
          restaurantPlan: String(restaurant.plan || "starter"),
          menuFlowFeePercent: String(feePercent),
          orderId: String(orderId || ""),
        },
      },
      metadata: {
        restaurantId: String(restaurant.id || ""),
        restaurantSlug: String(restaurant.slug || slug || ""),
        restaurantPlan: String(restaurant.plan || "starter"),
        menuFlowFeePercent: String(feePercent),
        orderId: String(orderId || ""),
      },
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      feePercent,
      applicationFeeAmount,
    });
  } catch (error: any) {
    console.error("CHECKOUT ROUTE ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Checkout failed" },
      { status: 500 }
    );
  }
}
