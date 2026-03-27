import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <span className="text-lg font-semibold">Taskly</span>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="py-24 text-center">
          <div className="mx-auto max-w-2xl px-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Task management,
              <br />
              simple and shared.
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Keep track of your tasks. Share with your team. That&apos;s it.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Link href="/sign-up">
                <Button size="lg">Start for Free</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-gray-50 py-16">
          <div className="mx-auto max-w-3xl px-4">
            <div className="grid gap-8 sm:grid-cols-3">
              <div>
                <h3 className="font-semibold mb-2">Personal Tasks</h3>
                <p className="text-sm text-muted-foreground">
                  Quick bullet-point tasks with timestamps. Add, complete,
                  delete — nothing more.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Team Tasks</h3>
                <p className="text-sm text-muted-foreground">
                  Create a team, share an invite code, and collaborate on shared
                  tasks together.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Pro Plan</h3>
                <p className="text-sm text-muted-foreground">
                  Free for up to 20 tasks. Upgrade to Pro for $9/mo and get
                  unlimited tasks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="text-2xl font-bold text-center mb-8">Pricing</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border p-6">
                <h3 className="font-semibold text-lg">Free</h3>
                <p className="text-3xl font-bold mt-2">
                  $0<span className="text-sm font-normal text-muted-foreground">/mo</span>
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" /> Up to 20 tasks
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" /> Personal &amp; team tasks
                  </li>
                </ul>
              </div>
              <div className="rounded-lg border-2 border-black p-6">
                <h3 className="font-semibold text-lg">Pro</h3>
                <p className="text-3xl font-bold mt-2">
                  $9<span className="text-sm font-normal text-muted-foreground">/mo</span>
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" /> Unlimited tasks
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" /> Personal &amp; team tasks
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" /> Priority support
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        Taskly — A demo app.
      </footer>
    </div>
  );
}
