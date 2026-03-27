import { NextResponse } from "next/server";
import { ensureUser } from "@/lib/current-user";
import { getStripe } from "@/lib/stripe";
import { rateLimit } from "@/lib/rate-limit";

export async function POST() {
  const limited = await rateLimit("strict");
  if (limited) return limited;
  const user = await ensureUser();

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: process.env.STRIPE_PRO_PRICE_ID!,
        quantity: 1,
      },
    ],
    customer_email: user.stripeCustomerId ? undefined : user.email,
    customer: user.stripeCustomerId ?? undefined,
    client_reference_id: user.id,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  });

  return NextResponse.json({ url: session.url });
}
