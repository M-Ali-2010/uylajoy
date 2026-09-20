import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/uyjoy/auth/auth-layout";
import { PasswordInput } from "@/components/uyjoy/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/i18n";
import { describeApiError } from "@/lib/api-error-text";
import { useAuthStore } from "@/lib/auth-store";

export const Route = createFileRoute("/kirish")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string | undefined } => ({
    // Only same-origin paths — never an absolute URL someone could point elsewhere
    redirect:
      typeof search["redirect"] === "string" &&
      search["redirect"].startsWith("/") &&
      !search["redirect"].startsWith("//")
        ? search["redirect"]
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Kirish — UyJoy.uz" },
      { name: "description", content: "UyJoy.uz platformasiga kirish" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success(t.auth.loggedIn);
      const me = useAuthStore.getState().user;
      navigate({
        to:
          redirect ?? (me?.role === "admin" ? "/admin" : me?.role === "buyer" ? "/" : "/dashboard"),
      });
    } catch (err) {
      setError(describeApiError(err, t));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={t.auth.login}
      subtitle={t.auth.subtitleLogin}
      footer={
        <>
          {t.auth.noAccount}{" "}
          <Link
            to="/royxatdan-otish"
            search={{ redirect }}
            className="font-semibold text-primary hover:underline"
          >
            {t.auth.createAccount}
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email">{t.auth.email}</Label>
          <Input
            id="email"
            type="email"
            value={email}
            required
            autoComplete="email"
            inputMode="email"
            placeholder="email@example.com"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">{t.auth.password}</Label>
          <PasswordInput
            id="password"
            value={password}
            required
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" loading={submitting}>
          {t.auth.loginNow}
        </Button>
      </form>
    </AuthLayout>
  );
}
