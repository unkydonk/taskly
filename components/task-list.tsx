"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatTaskDate } from "@/lib/format-date";
import { X, Check, Circle } from "lucide-react";
import Link from "next/link";

interface Task {
  id: string;
  content: string;
  completed: boolean;
  scope: "PERSONAL" | "TEAM";
  createdAt: string;
  author: { name: string | null; email: string };
}

interface TaskData {
  tasks: Task[];
  totalCount: number;
  limit: number | null;
  plan: "FREE" | "PRO";
}

export function TaskList({ hasTeam }: { hasTeam: boolean }) {
  const [scope, setScope] = useState<"PERSONAL" | "TEAM">("PERSONAL");
  const [data, setData] = useState<TaskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/tasks?scope=${scope}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [scope]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || submitting) return;

    setSubmitting(true);

    // Optimistic add
    const tempTask: Task = {
      id: `temp-${Date.now()}`,
      content: newTask.trim(),
      completed: false,
      scope,
      createdAt: new Date().toISOString(),
      author: { name: null, email: "" },
    };

    setData((prev) =>
      prev
        ? {
            ...prev,
            tasks: [tempTask, ...prev.tasks],
            totalCount: prev.totalCount + 1,
          }
        : prev
    );
    setNewTask("");

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newTask.trim(), scope }),
    });

    if (!res.ok) {
      // Revert optimistic update
      setData((prev) =>
        prev
          ? {
              ...prev,
              tasks: prev.tasks.filter((t) => t.id !== tempTask.id),
              totalCount: prev.totalCount - 1,
            }
          : prev
      );
      const err = await res.json();
      if (res.status === 403) {
        alert(err.error);
      }
    } else {
      const created = await res.json();
      setData((prev) =>
        prev
          ? {
              ...prev,
              tasks: prev.tasks.map((t) =>
                t.id === tempTask.id ? created : t
              ),
            }
          : prev
      );
    }
    setSubmitting(false);
  };

  const toggleTask = async (task: Task) => {
    // Optimistic toggle
    setData((prev) =>
      prev
        ? {
            ...prev,
            tasks: prev.tasks.map((t) =>
              t.id === task.id ? { ...t, completed: !t.completed } : t
            ),
          }
        : prev
    );

    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !task.completed }),
    });

    if (!res.ok) {
      // Revert
      setData((prev) =>
        prev
          ? {
              ...prev,
              tasks: prev.tasks.map((t) =>
                t.id === task.id ? { ...t, completed: task.completed } : t
              ),
            }
          : prev
      );
    }
  };

  const deleteTask = async (taskId: string) => {
    const prev = data;
    setData((d) =>
      d
        ? {
            ...d,
            tasks: d.tasks.filter((t) => t.id !== taskId),
            totalCount: d.totalCount - 1,
          }
        : d
    );

    const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    if (!res.ok && prev) {
      setData(prev);
    }
  };

  const atLimit =
    data?.plan === "FREE" && data.limit && data.totalCount >= data.limit;
  const nearLimit =
    data?.plan === "FREE" &&
    data.limit &&
    data.totalCount >= data.limit - 5 &&
    !atLimit;

  return (
    <div className="space-y-6">
      {/* Scope toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant={scope === "PERSONAL" ? "default" : "outline"}
          size="sm"
          onClick={() => setScope("PERSONAL")}
        >
          My Tasks
        </Button>
        {hasTeam && (
          <Button
            variant={scope === "TEAM" ? "default" : "outline"}
            size="sm"
            onClick={() => setScope("TEAM")}
          >
            Team Tasks
          </Button>
        )}
      </div>

      {/* New task input */}
      <form onSubmit={addTask} className="flex gap-2">
        <Input
          placeholder={atLimit ? "Task limit reached" : "Add a new task..."}
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          disabled={!!atLimit}
          className="flex-1"
        />
        <Button type="submit" disabled={!!atLimit || submitting}>
          Add
        </Button>
      </form>

      {/* Limit warnings */}
      {nearLimit && (
        <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          You&apos;ve used {data.totalCount} of {data.limit} tasks on the free plan.{" "}
          <Link href="/settings" className="font-medium underline">
            Upgrade to Pro
          </Link>{" "}
          for unlimited tasks.
        </div>
      )}
      {atLimit && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          You&apos;ve reached the {data.limit}-task limit.{" "}
          <Link href="/settings" className="font-medium underline">
            Upgrade to Pro
          </Link>{" "}
          to add more.
        </div>
      )}

      {/* Task count */}
      {data && data.limit && (
        <div className="text-xs text-muted-foreground">
          {data.totalCount} / {data.limit} tasks used
          {data.plan === "FREE" && (
            <Badge variant="outline" className="ml-2 text-xs">
              Free
            </Badge>
          )}
          {data.plan === "PRO" && (
            <Badge className="ml-2 text-xs">Pro</Badge>
          )}
        </div>
      )}
      {data && !data.limit && (
        <div className="text-xs text-muted-foreground">
          {data.tasks.length} tasks
          <Badge className="ml-2 text-xs">Pro</Badge>
        </div>
      )}

      {/* Task list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : data?.tasks.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          No tasks yet. Add one above!
        </div>
      ) : (
        <ul className="space-y-1">
          {data?.tasks.map((task) => (
            <li
              key={task.id}
              className="group flex items-center gap-3 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors"
            >
              <button
                onClick={() => toggleTask(task)}
                className="flex-shrink-0 text-muted-foreground hover:text-foreground"
              >
                {task.completed ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <span
                  className={`text-sm ${
                    task.completed
                      ? "line-through text-muted-foreground"
                      : ""
                  }`}
                >
                  <span className="text-xs text-muted-foreground mr-2">
                    {formatTaskDate(task.createdAt)}
                  </span>
                  {task.content}
                </span>
                {scope === "TEAM" && task.author.name && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    — {task.author.name}
                  </span>
                )}
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-600 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
