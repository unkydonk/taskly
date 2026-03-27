import { ensureUser } from "@/lib/current-user";
import { TaskList } from "@/components/task-list";

export default async function DashboardPage() {
  const user = await ensureUser();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tasks</h1>
      <TaskList hasTeam={!!user.teamId} />
    </div>
  );
}
