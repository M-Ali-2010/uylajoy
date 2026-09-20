import { SiteFooter } from "@/components/uyjoy/site-footer";
import { SiteHeader } from "@/components/uyjoy/site-header";
import { useTranslation } from "@/i18n";
import { legal } from "@/lib/legal-content";

export function LegalPage({ doc }: { doc: "terms" | "privacy" }) {
  const { language } = useTranslation();
  const content = legal[doc][language];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="shell flex-1 py-12">
        <article className="mx-auto max-w-2xl">
          <h1 className="type-h1">{content.title}</h1>
          <p className="mt-2 text-xs text-muted-foreground">
            <time dateTime={content.updated}>{content.updated}</time>
          </p>
          <p className="type-lead mt-6 text-muted-foreground">{content.intro}</p>
          {content.sections.map((s) => (
            <section key={s.heading} className="mt-8">
              <h2 className="type-h3">{s.heading}</h2>
              {s.body.map((p) => (
                <p key={p} className="mt-3 leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
