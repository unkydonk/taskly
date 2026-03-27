"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeamPanel } from "@/components/team-panel";

interface Props {
  plan: "FREE" | "PRO";
  email: string;
  name: string | null;
  hasStripeCustomer: boolean;
  hasTeam: boolean;
}

export function SettingsClient({
  plan,
  email,
  name,
  hasStripeCustomer,
}: Props) {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const upgraded = searchParams.get("upgraded");

  const handleUpgrade = async () => {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const { url } = await res.json();
    window.location.href = url;
  };

  const handleManageBilling = async () => {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await res.json();
    window.location.href = url;
  };

  return (
    <div className="space-y-6">
      {upgraded && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          Welcome to Pro! You now have unlimited tasks.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="text-sm font-medium">{name || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-sm font-medium">{email}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Plan
            <Badge variant={plan === "PRO" ? "default" : "outline"}>
              {plan}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {plan === "FREE" ? (
            <>
              <p className="text-sm text-muted-foreground">
                Free plan — 20 tasks max. Upgrade to Pro for $9/mo and get
                unlimited tasks.
              </p>
              <Button onClick={handleUpgrade} disabled={loading}>
                {loading ? "Redirecting..." : "Upgrade to Pro — $9/mo"}
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Pro plan — unlimited tasks. $9/month.
              </p>
              {hasStripeCustomer && (
                <Button
                  variant="outline"
                  onClick={handleManageBilling}
                  disabled={loading}
                >
                  {loading ? "Redirecting..." : "Manage Billing"}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <TeamPanel />
    </div>
  );
}
