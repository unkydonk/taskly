import { NextRequest, NextResponse } from "next/server";
import { ensureUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

const MAX_TEAM_NAME_LENGTH = 100;

// GET current user's team info
export async function GET() {
  const limited = await rateLimit();
  if (limited) return limited;
  const user = await ensureUser();

  if (!user.teamId) {
    return NextResponse.json({ team: null });
  }

  const team = await db.team.findUnique({
    where: { id: user.teamId },
    include: {
      members: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ team });
}

// POST create a new team
export async function POST(req: NextRequest) {
  const limited = await rateLimit();
  if (limited) return limited;
  const user = await ensureUser();
  const { name } = await req.json();

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Team name is required" }, { status: 400 });
  }

  if (name.trim().length > MAX_TEAM_NAME_LENGTH) {
    return NextResponse.json({ error: `Team name must be under ${MAX_TEAM_NAME_LENGTH} characters` }, { status: 400 });
  }

  if (user.teamId) {
    return NextResponse.json(
      { error: "You're already on a team. Leave first." },
      { status: 400 }
    );
  }

  const team = await db.team.create({
    data: {
      name: name.trim(),
      members: { connect: { id: user.id } },
    },
    include: {
      members: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ team }, { status: 201 });
}
