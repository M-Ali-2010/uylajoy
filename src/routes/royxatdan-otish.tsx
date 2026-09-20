import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Briefcase, Check, KeyRound, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/uyjoy/auth/auth-layout";
import { PasswordInput } from "@/components/uyjoy/auth/password-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/i18n";
import { describeApiError } from "@/lib/api-error-text";
import { ApiError } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

const safeRedirect = (v: unknown) =>
  typeof v === "string" && v.startsWith("/") && !v.startsWith("//") ? v : undefined;

export const Route = createFileRoute("/royxatdan-otish")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string | undefined } => ({
    redirect: safeRedirect(search["redirect"]),
  }),
  head: () => ({
    meta: [
      { title: "Ro'yxatdan o'tish — UyJoy.uz" },
      { name: "description", content: "UyJoy.uz platformasida bepul hisob yarating" },
    ],
  }),
  component: RegisterPage,
});

type Role = "buyer" | "seller" | "agent";

function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const register = useAuthStore((state) => state.register);

  const [role, setRole] = useState<Role>("buyer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState<Record<string, string>>({});

  // Mirrors the server's passwordSchema exactly — the form never promises
  // something the API will refuse.
  const rules = [
    { label: t.auth.passwordLength, met: password.length >= 8 },
    { label: t.auth.passwordLetter, met: /[A-Za-z]/.test(password) },
    { label: t.auth.passwordDigit, met: /\d/.test(password) },
  ];
  const passwordOk = rules.every((r) => r.met);
  const mismatch = confirm.length > 0 && password !== confirm;

  const roles: { value: Role; label: string; desc: string; icon: typeof Search }[] = [
    { value: "buyer", label: t.auth.roleBuyer, desc: t.auth.roleBuyerDesc, icon: Search },
    { value: "seller", label: t.auth.roleSeller, desc: t.auth.roleSellerDesc, icon: KeyRound },
    { value: "agent", label: t.auth.roleAgent, desc: t.auth.roleAgentDesc, icon: Briefcase },
  ];

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFieldError({});

    if (!passwordOk) return setFieldError({ password: t.errors.weakPassword });
    if (mismatch) return setFieldError({ confirm: t.auth.passwordsMismatch });
    if (!acceptTerms) return toast.error(t.auth.acceptTermsRequired);

    setSubmitting(true);
    try {
      await register({ email, password, name, phone: phone.trim() || undefined, role });
      toast.success(t.auth.registered);
      navigate({ to: redirect ?? (role === "buyer" ? "/" : "/dashboard") });
    } catch (error) {
      const message = describeApiError(error, t);
      if (error instanceof ApiError && Object.keys(error.fields).length > 0) {
        const first = Object.keys(error.fields)[0] ?? "";
        setFieldError({
          [first === "phone" ? "phone" : first === "email" ? "email" : first]: message,
        });
      } else if (error instanceof ApiError && error.code === "email_taken") {
        setFieldError({ email: message });
      } else {
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={t.auth.register}
      subtitle={t.auth.subtitleRegister}
      footer={
        <>
          {t.auth.hasAccount}{" "}
          <Link
            to="/kirish"
            search={{ redirect }}
            className="font-semibold text-primary hover:underline"
          >
            {t.auth.loginNow}
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        <fieldset>
          <legend className="mb-2 text-sm font-medium">{t.auth.iAm}</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {roles.map((r) => (
              <button
                key={r.value}
                type="button"
                aria-pressed={role === r.value}
                onClick={() => setRole(r.value)}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors",
                  role === r.value
                    ? "border-primary bg-primary-soft"
                    : "border-border hover:border-border-strong hover:bg-secondary/60",
                )}
              >
                <r.icon
                  className={cn(
                    "size-4",
                    role === r.value ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <span className="text-sm font-semibold">{r.label}</span>
                <span className="text-xs text-muted-foreground">{r.desc}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <Field label={t.auth.fullName} htmlFor="name" error={fieldError["name"]}>
          <Input
            id="name"
            value={name}
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

        <Field label={t.auth.email} htmlFor="email" error={fieldError["email"]}>
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
        </Field>

        <Field
          label={t.auth.phoneOptional}
          htmlFor="phone"
          error={fieldError["phone"]}
          hint={t.auth.phoneHint}
        >
          <Input
            id="phone"
            type="tel"
            value={phone}
            autoComplete="tel"
            inputMode="tel"
            placeholder="+998 90 123 45 67"
            onChange={(e) => setPhone(e.target.value)}
          />
        </Field>

        <Field label={t.auth.password} htmlFor="password" error={fieldError["password"]}>
          <PasswordInput
            id="password"
            value={password}
            required
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1" aria-label={t.auth.passwordRule}>
            {rules.map((r) => (
              <li
                key={r.label}
                className={cn(
                  "flex items-center gap-1.5 text-xs",
                  r.met ? "text-success" : "text-muted-foreground",
                )}
              >
                <Check className={cn("size-3", !r.met && "opacity-30")} /> {r.label}
              </li>
            ))}
          </ul>
        </Field>

        <Field
          label={t.auth.confirmPassword}
          htmlFor="confirm"
          error={fieldError["confirm"] ?? (mismatch ? t.auth.passwordsMismatch : undefined)}
        >
          <PasswordInput
            id="confirm"
            value={confirm}
            required
            autoComplete="new-password"
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Field>

        <div className="flex items-start gap-2.5">
          <Checkbox
            id="terms"
            checked={acceptTerms}
            onCheckedChange={(v) => setAcceptTerms(v === true)}
            className="mt-0.5"
          />
          <Label htmlFor="terms" className="cursor-pointer text-sm leading-snug font-normal">
            {t.auth.acceptTerms}{" "}
            <Link to="/shartlar" className="text-primary hover:underline">
              →
            </Link>
          </Label>
        </div>

        <Button type="submit" size="lg" className="w-full" loading={submitting}>
          {t.auth.createAccount}
        </Button>
      </form>
    </AuthLayout>
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string | undefined;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
