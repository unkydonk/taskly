import { ensureUser } from "@/lib/current-user";
import { SettingsClient } from "@/components/settings-client";

export default async function SettingsPage() {
  const user = await ensureUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-4xl items-center px-4">
          <a href="/dashboard" className="text-lg font-semibold">
            Taskly
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <SettingsClient
          plan={user.plan}
          email={user.email}
          name={user.name}
          hasStripeCustomer={!!user.stripeCustomerId}
          hasTeam={!!user.teamId}
        />
      </main>
    </div>
  );
}
