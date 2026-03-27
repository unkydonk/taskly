import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Standard: 20 requests per 10 seconds
const standardLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20, "10 s") })
  : null;

// Strict: 5 requests per 10 seconds (for sensitive endpoints)
const strictLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "10 s") })
  : null;

export async function rateLimit(
  level: "standard" | "strict" = "standard"
): Promise<NextResponse | null> {
  const limiter = level === "strict" ? strictLimiter : standardLimiter;
  if (!limiter) return null; // Skip if Redis not configured

  const { userId } = await auth();
  const key = userId ?? "anonymous";

  const { success } = await limiter.limit(key);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  return null;
}
