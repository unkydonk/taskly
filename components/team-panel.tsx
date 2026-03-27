"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface TeamMember {
  id: string;
  name: string | null;
}

interface Team {
  id: string;
  name: string;
  inviteCode: string;
  members: TeamMember[];
}

export function TeamPanel() {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/teams")
      .then((r) => r.json())
      .then((d) => {
        setTeam(d.team);
        setLoading(false);
      });
  }, []);

  const createTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: teamName }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setTeam(data.team);
    setTeamName("");
    router.refresh();
  };

  const joinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/teams/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteCode }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setTeam(data.team);
    setInviteCode("");
    router.refresh();
  };

  const leaveTeam = async () => {
    const res = await fetch("/api/teams/leave", { method: "POST" });
    if (res.ok) {
      setTeam(null);
      router.refresh();
    }
  };

  if (loading) return <Card><CardContent className="p-6">Loading...</CardContent></Card>;

  if (team) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{team.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Invite Code</p>
            <code className="rounded bg-muted px-2 py-1 text-sm font-mono">
              {team.inviteCode}
            </code>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Members ({team.members.length})
            </p>
            <ul className="space-y-1">
              {team.members.map((m) => (
                <li key={m.id} className="text-sm">
                  {m.name || "Team member"}
                </li>
              ))}
            </ul>
          </div>
          <Button variant="outline" size="sm" onClick={leaveTeam}>
            Leave Team
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Team</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        <form onSubmit={createTeam} className="space-y-2">
          <p className="text-sm font-medium">Create a Team</p>
          <div className="flex gap-2">
            <Input
              placeholder="Team name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
            <Button type="submit">Create</Button>
          </div>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">or</span>
          </div>
        </div>
        <form onSubmit={joinTeam} className="space-y-2">
          <p className="text-sm font-medium">Join a Team</p>
          <div className="flex gap-2">
            <Input
              placeholder="Invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
            />
            <Button type="submit" variant="outline">
              Join
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
