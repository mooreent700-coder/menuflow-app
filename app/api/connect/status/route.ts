import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

function getFeePercent(plan: string | null | undefined) {
  const normalized = (plan || "starter").toLowerCase();
  if (normalized === "growth") return 5;
  if (normalized === "premium") return 3;
  return 10;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });
    }

    const { data: restaurant, error } = await supabase
      .from("restaurants")
      .select("id, plan, stripe_account_id, stripe_onboarding_complete, stripe_charges_enabled, stripe_payouts_enabled")
      .eq("id", restaurantId)
      .maybeSingle();

    if (error || !restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    if (!restaurant.stripe_account_id) {
      return NextResponse.json({
        connected: false,
        onboardingComplete: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        feePercent: getFeePercent(restaurant.plan),
      });
    }

    const account = await stripe.accounts.retrieve(restaurant.stripe_account_id);

    const onboardingComplete = Boolean(account.details_submitted && account.charges_enabled && account.payouts_enabled);

    await supabase
      .from("restaurants")
      .update({
        stripe_onboarding_complete: onboardingComplete,
        stripe_charges_enabled: Boolean(account.charges_enabled),
        stripe_payouts_enabled: Boolean(account.payouts_enabled),
      })
      .eq("id", restaurant.id);

    return NextResponse.json({
      connected: true,
      accountId: account.id,
      onboardingComplete,
      chargesEnabled: Boolean(account.charges_enabled),
      payoutsEnabled: Boolean(account.payouts_enabled),
      feePercent: getFeePercent(restaurant.plan),
    });
  } catch (error: any) {
    console.error("CONNECT STATUS ERROR:", error);
    return NextResponse.json({ error: error?.message || "Could not load Stripe status" }, { status: 500 });
  }
}
