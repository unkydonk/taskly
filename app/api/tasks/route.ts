import { NextRequest, NextResponse } from "next/server";
import { ensureUser } from "@/lib/current-user";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

const FREE_TASK_LIMIT = 20;
const MAX_CONTENT_LENGTH = 2000;

export async function GET(req: NextRequest) {
  const limited = await rateLimit();
  if (limited) return limited;
  const user = await ensureUser();
  const scope = req.nextUrl.searchParams.get("scope") ?? "PERSONAL";

  const where =
    scope === "TEAM" && user.teamId
      ? { scope: "TEAM" as const, teamId: user.teamId }
      : { scope: "PERSONAL" as const, authorId: user.id };

  const tasks = await db.task.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  const totalCount = await db.task.count({ where: { authorId: user.id } });

  return NextResponse.json({
    tasks,
    totalCount,
    limit: user.plan === "FREE" ? FREE_TASK_LIMIT : null,
    plan: user.plan,
  });
}

export async function POST(req: NextRequest) {
  const limited = await rateLimit();
  if (limited) return limited;
  const user = await ensureUser();
  const { content, scope } = await req.json();

  if (!content || typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  if (content.trim().length > MAX_CONTENT_LENGTH) {
    return NextResponse.json({ error: `Content must be under ${MAX_CONTENT_LENGTH} characters` }, { status: 400 });
  }

  if (user.plan === "FREE") {
    const count = await db.task.count({ where: { authorId: user.id } });
    if (count >= FREE_TASK_LIMIT) {
      return NextResponse.json(
        { error: "Free plan limit reached. Upgrade to Pro for unlimited tasks." },
        { status: 403 }
      );
    }
  }

  const taskScope = scope === "TEAM" && user.teamId ? "TEAM" : "PERSONAL";

  const task = await db.task.create({
    data: {
      content: content.trim(),
      scope: taskScope,
      authorId: user.id,
      teamId: taskScope === "TEAM" ? user.teamId : null,
    },
    include: { author: { select: { name: true } } },
  });

  return NextResponse.json(task, { status: 201 });
}
