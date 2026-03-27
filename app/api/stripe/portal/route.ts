import { NextResponse } from "next/server";
import { ensureUser } from "@/lib/current-user";
import { getStripe } from "@/lib/stripe";
import { rateLimit } from "@/lib/rate-limit";

export async function POST() {
  const limited = await rateLimit("strict");
  if (limited) return limited;
  const user = await ensureUser();

  if (!user.stripeCustomerId) {
    return NextResponse.json(
      { error: "No billing account" },
      { status: 400 }
    );
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  });

  return NextResponse.json({ url: session.url });
}
