import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

export async function POST(req: Request) {
  try {
    const { accountId } = await req.json();

    if (!accountId) {
      return NextResponse.json(
        { error: "Missing accountId" },
        { status: 400 }
      );
    }

    const origin =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/dashboard/owner`,
      return_url: `${origin}/dashboard/owner`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: link.url });
  } catch (err: any) {
    console.error("ONBOARDING LINK ERROR:", err);

    return NextResponse.json(
      { error: err.message || "error" },
      { status: 500 }
    );
  }
}
