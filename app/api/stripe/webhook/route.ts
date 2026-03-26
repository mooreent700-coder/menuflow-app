import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Missing Stripe webhook signature", { status: 400 });
  }

  try {
    const rawBody = await req.text();
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case "checkout.session.completed":
      case "payment_intent.succeeded":
      case "account.updated":
      default:
        break;
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error: any) {
    console.error("STRIPE WEBHOOK ERROR:", error);
    return new Response(`Webhook Error: ${error?.message || "unknown"}`, { status: 400 });
  }
}
