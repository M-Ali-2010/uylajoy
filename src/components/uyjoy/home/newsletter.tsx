"use client";

import { ArrowRight, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/i18n";
import { Reveal } from "../reveal";

/**
 * One compact field: the input and its action share a single bordered shell,
 * so it reads as one control rather than a form.
 */
export function Newsletter() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    toast.success(t.home.newsletterTitle, { description: email });
    setEmail("");
  };

  return (
    <section className="section-y-sm">
      <div className="shell">
        <Reveal>
          <div className="flex flex-col gap-6 rounded-xl border border-border bg-card px-6 py-7 md:flex-row md:items-center md:justify-between md:gap-10 md:px-9 md:py-8">
            <div className="max-w-md">
              <h2 className="type-h3">{t.home.newsletterTitle}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{t.home.newsletterSubtitle}</p>
            </div>

            <form
              onSubmit={submit}
              className="flex w-full items-center gap-1 rounded-lg border border-border bg-background p-1 transition-colors focus-within:border-primary/50 md:max-w-md"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                {t.home.newsletterPlaceholder}
              </label>
              <Mail className="ml-2.5 size-4 shrink-0 text-muted-foreground" />
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t.home.newsletterPlaceholder}
                className="h-10 min-w-0 flex-1 bg-transparent px-2.5 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                className="lift inline-flex h-10 shrink-0 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
              >
                <span className="hidden sm:inline">{t.home.newsletterCta}</span>
                <ArrowRight className="size-4" />
              </button>
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
