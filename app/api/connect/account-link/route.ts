import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { restaurantId } = body || {};

    if (!restaurantId) {
      return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });
    }

    const { data: restaurant, error } = await supabase
      .from("restaurants")
      .select("id, stripe_account_id")
      .eq("id", restaurantId)
      .maybeSingle();

    if (error || !restaurant?.stripe_account_id) {
      return NextResponse.json({ error: "Connected account not found" }, { status: 404 });
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const accountLink = await stripe.accountLinks.create({
      account: restaurant.stripe_account_id,
      refresh_url: `${origin}/dashboard/owner?stripe=refresh`,
      return_url: `${origin}/dashboard/owner?stripe=return`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error: any) {
    console.error("CREATE ACCOUNT LINK ERROR:", error);
    return NextResponse.json({ error: error?.message || "Could not create account link" }, { status: 500 });
  }
}
