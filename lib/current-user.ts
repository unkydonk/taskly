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
    user = await db.user.create({
      data: {
        clerkId: userId,
        email: clerkUser?.emailAddresses[0]?.emailAddress ?? "",
        name: clerkUser?.firstName
          ? `${clerkUser.firstName} ${clerkUser.lastName ?? ""}`.trim()
          : null,
      },
      include: { team: true },
    });
  }

  return user;
}
