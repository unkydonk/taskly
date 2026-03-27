import { NextResponse } from "next/server";
import { ensureUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function POST() {
  const limited = await rateLimit();
  if (limited) return limited;
  const user = await ensureUser();

  if (!user.teamId) {
    return NextResponse.json({ error: "Not on a team" }, { status: 400 });
  }

  await db.user.update({
    where: { id: user.id },
    data: { teamId: null },
  });

  return NextResponse.json({ success: true });
}
