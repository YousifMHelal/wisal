"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";

interface SignInFormProps {
  callbackUrl: string;
}

export function SignInForm({ callbackUrl }: SignInFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await signIn("credentials", {
        email: form.get("email") as string,
        password: form.get("password") as string,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@hms.gov.sa"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              disabled={isPending}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md bg-status-red-bg px-3 py-2 text-sm text-status-red-fg">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        {/* Dev role switcher — seeded users */}
        {process.env.NODE_ENV === "development" && (
          <DevRoleSwitcher />
        )}
      </CardContent>
    </Card>
  );
}

function DevRoleSwitcher() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const devUsers = [
    { label: "Operator", email: "operator@wisal.dev", password: "Wisal2024!" },
    { label: "Supervisor", email: "supervisor@wisal.dev", password: "Wisal2024!" },
    { label: "Compliance", email: "compliance@wisal.dev", password: "Wisal2024!" },
    { label: "Executive", email: "executive@wisal.dev", password: "Wisal2024!" },
    { label: "Admin", email: "admin@wisal.dev", password: "Wisal2024!" },
  ];

  async function loginAs(email: string, password: string) {
    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (!result?.error) {
        router.push("/live-operations");
        router.refresh();
      }
    });
  }

  return (
    <div className="mt-6 border-t pt-4">
      <p className="text-xs text-muted-foreground mb-2 text-center">
        Dev quick-login
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {devUsers.map((u) => (
          <button
            key={u.email}
            type="button"
            disabled={isPending}
            onClick={() => loginAs(u.email, u.password)}
            className="text-xs px-2 py-1 rounded border border-border bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
          >
            {u.label}
          </button>
        ))}
      </div>
    </div>
  );
}
