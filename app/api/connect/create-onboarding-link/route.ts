import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(req: Request) {
  try {
    const { accountId } = await req.json();

    const origin =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/auth/reauth`,
      return_url: `${origin}/dashboard`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: link.url });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "error" },
      { status: 500 }
    );
  }
}
