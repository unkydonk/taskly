import { NextRequest, NextResponse } from "next/server";
import { ensureUser } from "@/lib/current-user";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await ensureUser();
  const { id } = await params;
  const { completed } = await req.json();

  const task = await db.task.findUnique({ where: { id } });
  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Allow toggling own tasks or team tasks
  const canEdit =
    task.authorId === user.id ||
    (task.scope === "TEAM" && task.teamId === user.teamId);

  if (!canEdit) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await db.task.update({
    where: { id },
    data: { completed },
    include: { author: { select: { name: true, email: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await ensureUser();
  const { id } = await params;

  const task = await db.task.findUnique({ where: { id } });
  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (task.authorId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.task.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
