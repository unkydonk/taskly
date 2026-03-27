import { NextRequest, NextResponse } from "next/server";
import { ensureUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limited = await rateLimit("strict");
  if (limited) return limited;
  const user = await ensureUser();
  const { inviteCode } = await req.json();

  if (!inviteCode || typeof inviteCode !== "string" || !inviteCode.trim()) {
    return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
  }

  if (user.teamId) {
    return NextResponse.json(
      { error: "You're already on a team. Leave first." },
      { status: 400 }
    );
  }

  const team = await db.team.findUnique({
    where: { inviteCode: inviteCode.trim() },
  });

  if (!team) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
  }

  await db.user.update({
    where: { id: user.id },
    data: { teamId: team.id },
  });

  const updated = await db.team.findUnique({
    where: { id: team.id },
    include: {
      members: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ team: updated });
}
