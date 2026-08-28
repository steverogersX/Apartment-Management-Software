"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Bird,
  Eye,
  EyeOff,
  Loader2,
  Receipt,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { ApiClientError } from "@/lib/apiClient";

const FEATURES = [
  { icon: Users, label: "Residents — visitors, bills & complaints" },
  { icon: Receipt, label: "Committee — billing, notices & approvals" },
  { icon: ShieldCheck, label: "Security — gate logs & guard app" },
];

function BrandMark({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
        <Bird className="size-4" />
      </div>
      <span className="text-[15px] font-semibold tracking-tight text-foreground">Rooster</span>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      router.push(user.isSuperAdmin ? "/platform" : "/dashboard");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Couldn't reach the server");
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-foreground p-10 text-background lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-background text-foreground">
            <Bird className="size-4" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight">Rooster</span>
        </div>

        <div className="flex flex-col gap-6">
          <h1 className="max-w-sm text-3xl font-semibold leading-tight tracking-tight">
            Run your society, beautifully.
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-background/70">
            A focused dashboard for every role — residents, the management committee, and security
            each get the tools built for their job.
          </p>

          <div className="flex flex-col gap-3 pt-2">
            {FEATURES.map((f) => (
              <div key={f.label} className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-background/10">
                  <f.icon className="size-4" />
                </span>
                <span className="text-sm text-background/80">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-background/50">
          © {new Date().getFullYear()} Rooster. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col items-center justify-center px-6 py-12">
        <div className="flex w-full max-w-sm flex-col gap-8">
          <BrandMark className="flex items-center gap-2.5 lg:hidden" />

          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground">
              Sign in to manage your flat, bills, and visitors.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="#"
                  className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-9"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-0 top-0 flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="mt-1 gap-1.5" disabled={loading}>
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Don&apos;t have an account? Ask your society admin for an invite.
          </p>
        </div>
      </div>
    </div>
  );
}
