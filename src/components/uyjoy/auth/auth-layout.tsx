import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { BrandLockup } from "@/components/uyjoy/brand-mark";
import { useTranslation } from "@/i18n";
import heroImage from "@/assets/hero-tashkent.jpg";

/** Two-pane frame shared by sign-in and sign-up: form left, brand pane right. */
export function AuthLayout({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const benefits = [t.auth.benefit1, t.auth.benefit2, t.auth.benefit3, t.auth.benefit4];

  return (
    <div className="flex min-h-screen">
      <div className="flex w-full flex-col px-5 py-8 md:w-1/2 md:justify-center md:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="group inline-flex" aria-label="UyJoy.uz">
            <BrandLockup />
          </Link>

          <h1 className="type-h2 mt-10">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>

          <div className="mt-8">{children}</div>

          <p className="mt-8 text-center text-sm text-muted-foreground">{footer}</p>
        </div>
      </div>

      <aside className="relative hidden overflow-hidden bg-ink md:flex md:w-1/2 md:items-end">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 size-full object-cover opacity-70"
        />
        <div className="scrim-copy relative w-full p-10 pt-40 text-white lg:p-14">
          <p className="type-h3 max-w-md text-white">{t.home.heroSubtitle}</p>
          <ul className="mt-8 space-y-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-3 text-sm text-white/85">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-bright/20 text-primary-bright">
                  <Check className="size-3" />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
