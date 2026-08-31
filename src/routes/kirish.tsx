import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "@/i18n";
import { useAuthStore } from "@/lib/auth-store";

export const Route = createFileRoute("/kirish")({
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
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success("Muvaffaqiyatli kirdingiz!");
      navigate({ to: "/" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex w-full flex-col justify-center px-4 py-12 md:w-1/2 md:px-8 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2">
            <span className="bg-brand flex size-9 items-center justify-center rounded-xl text-primary-foreground">
              <Home className="size-5" />
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight">UyJoy.uz</span>
          </Link>

          <h1 className="font-display text-3xl font-extrabold">{t.auth.login}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t.auth.noAccount}{" "}
            <Link to="/royxatdan-otish" className="text-primary hover:underline">
              {t.auth.createAccount}
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">{t.auth.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t.auth.password}</Label>
                <a
                  href="/parolni-tiklash"
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  {t.auth.forgotPassword}
                </a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                {t.auth.rememberMe}
              </Label>
            </div>

            <Button type="submit" variant="hero" size="xl" className="w-full" disabled={isLoading}>
              {isLoading ? t.common.loading : t.auth.login}
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">{t.common.or}</span>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <Button variant="outline" size="lg" className="w-full" type="button">
                <svg className="mr-2 size-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {t.auth.loginWithGoogle}
              </Button>

              <Button variant="outline" size="lg" className="w-full" type="button">
                <svg className="mr-2 size-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M2.04 12c0-5.523 4.476-10 10-10 5.522 0 10 4.477 10 10s-4.478 10-10 10c-5.524 0-10-4.477-10-10zm6.602-2.397h1.73v1.73H8.642zm0 2.797h1.73v1.73H8.642zm4.716-2.797h1.73v1.73h-1.73zm0 2.797h1.73v1.73h-1.73z"
                  />
                </svg>
                {t.auth.loginWithYandex}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Image/Branding */}
      <div className="hidden bg-secondary md:flex md:w-1/2 md:flex-col md:items-center md:justify-center md:p-8">
        <div className="max-w-md text-center">
          <div className="bg-brand mx-auto flex size-20 items-center justify-center rounded-3xl text-primary-foreground">
            <Home className="size-10" />
          </div>
          <h2 className="mt-8 font-display text-3xl font-extrabold">
            O'zbekistonda o'z uyingizni toping
          </h2>
          <p className="mt-4 text-muted-foreground">
            Tekshirilgan e'lonlar, haqiqiy narxlar va professional agentlar — barchasi bitta
            platformada.
          </p>
        </div>
      </div>
    </div>
  );
}
