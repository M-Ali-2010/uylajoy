import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Home, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "@/i18n";
import { useAuthStore } from "@/lib/auth-store";

export const Route = createFileRoute("/royxatdan-otish")({
  head: () => ({
    meta: [
      { title: "Ro'yxatdan o'tish — UyJoy.uz" },
      { name: "description", content: "UyJoy.uz platformasida hisob yarating" },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const passwordRequirements = [
    { label: "Kamida 8 ta belgi", met: password.length >= 8 },
    { label: "Katta harf", met: /[A-Z]/.test(password) },
    { label: "Kichik harf", met: /[a-z]/.test(password) },
    { label: "Raqam", met: /[0-9]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Parollar mos kelmaydi!");
      return;
    }

    if (!acceptTerms) {
      toast.error("Iltimos, foydalanish shartlarini qabul qiling");
      return;
    }

    setIsLoading(true);

    try {
      await register({ email, password, name, phone: phone || undefined });
      toast.success("Hisobingiz yaratildi!");
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

          <h1 className="font-display text-3xl font-extrabold">{t.auth.register}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t.auth.hasAccount}{" "}
            <Link to="/kirish" className="text-primary hover:underline">
              {t.auth.loginNow}
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">{t.auth.fullName}</Label>
              <Input
                id="name"
                type="text"
                placeholder="Ism Familiya"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

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
              <Label htmlFor="phone">{t.auth.phone}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+998 90 123 45 67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t.auth.password}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
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
              {password && (
                <ul className="mt-2 space-y-1">
                  {passwordRequirements.map((req, i) => (
                    <li
                      key={i}
                      className={`flex items-center gap-2 text-xs ${
                        req.met ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <Check className={`size-3 ${req.met ? "" : "opacity-30"}`} />
                      {req.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t.auth.confirmPassword}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-destructive">Parollar mos kelmaydi</p>
              )}
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                className="mt-0.5"
              />
              <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
                <a href="/shartlar" className="text-primary hover:underline">
                  Foydalanish shartlari
                </a>{" "}
                va{" "}
                <a href="/maxfiylik" className="text-primary hover:underline">
                  Maxfiylik siyosati
                </a>
                ni qabul qilaman
              </Label>
            </div>

            <Button type="submit" variant="hero" size="xl" className="w-full" disabled={isLoading}>
              {isLoading ? t.common.loading : t.auth.createAccount}
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
            Bepul hisob yarating
          </h2>
          <p className="mt-4 text-muted-foreground">
            E'lon joylash, sevimlilarni saqlash va agentlar bilan bog'lanish uchun ro'yxatdan o'ting.
          </p>
          <ul className="mt-8 space-y-3 text-left">
            {[
              "Bepul e'lon joylash",
              "Sevimli e'lonlarni saqlash",
              "Agentlar bilan xabar almashish",
              "Narx o'zgarishi haqida bildirishnoma olish",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
