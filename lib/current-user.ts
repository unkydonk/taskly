import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: { team: true },
  });

  return user;
}

export async function ensureUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  let user = await db.user.findUnique({
    where: { clerkId: userId },
    include: { team: true },
  });

  if (!user) {
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress ?? "";
    const name = clerkUser?.firstName
      ? `${clerkUser.firstName} ${clerkUser.lastName ?? ""}`.trim()
      : null;
    user = await db.user.upsert({
      where: { clerkId: userId },
      update: { email, name },
      create: { clerkId: userId, email, name },
      include: { team: true },
    });
  }

  return user;
}
