import { Link } from "@tanstack/react-router";
import { Instagram, Mail, MapPin, Phone, Send } from "lucide-react";
import { useTranslation } from "@/i18n";
import { BrandLockup } from "./brand-mark";

export function SiteFooter() {
  const { t } = useTranslation();

  const columns = [
    {
      heading: t.footer.forBuyers,
      links: [
        { to: "/elonlar", search: { deal: "sotuv" as const }, label: t.footer.saleHouses },
        { to: "/elonlar", search: { deal: "ijara" as const }, label: t.footer.rentHouses },
        { to: "/ipoteka", label: t.nav.mortgage },
        { to: "/narxlar", label: t.nav.marketPrices },
      ],
    },
    {
      heading: t.footer.forSellers,
      links: [
        { to: "/elon-joylash", label: t.footer.freeListing },
        { to: "/narxlar", label: t.footer.priceAnalysis },
        { to: "/dashboard", label: t.nav.myListings },
        { to: "/kirish", label: t.nav.login },
      ],
    },
    {
      heading: t.footer.company,
      links: [
        { to: "/elonlar", label: t.nav.listings },
        { to: "/ipoteka", label: t.nav.mortgage },
        { to: "/sevimlilar", label: t.nav.favorites },
        { to: "/royxatdan-otish", label: t.nav.register },
      ],
    },
  ];

  const socials = [
    { icon: Instagram, href: "https://instagram.com/uyjoy.uz", label: "Instagram" },
    { icon: Send, href: "https://t.me/uyjoy_uz", label: "Telegram" },
  ];

  return (
    <footer className="surface-ink relative overflow-hidden">
      <div className="texture-grid pointer-events-none absolute inset-0 opacity-50" />

      <div className="shell relative">
        <div className="grid gap-10 py-14 md:grid-cols-2 md:py-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <Link to="/" className="group inline-flex" aria-label="UyJoy.uz">
              <BrandLockup tone="light" />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/55">
              {t.footer.description}
            </p>

            <p className="mt-8 text-[0.6875rem] font-bold tracking-[0.14em] text-white/40 uppercase">
              {t.footer.followUs}
            </p>
            <div className="mt-3 flex gap-2">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex size-10 items-center justify-center rounded-lg border border-white/12 text-white/70 transition-colors duration-200 hover:border-white/30 hover:bg-white/8 hover:text-white"
                >
                  <social.icon className="size-[1.15rem]" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((column) => (
            <nav key={column.heading} aria-label={column.heading} className="lg:col-span-2">
              <h2 className="text-[0.6875rem] font-bold tracking-[0.14em] text-white/40 uppercase">
                {column.heading}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      search={("search" in link ? link.search : {}) as never}
                      className="text-sm text-white/70 transition-colors duration-200 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="lg:col-span-2">
            <h2 className="text-[0.6875rem] font-bold tracking-[0.14em] text-white/40 uppercase">
              {t.footer.contact}
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li>
                <a
                  href="tel:+998712000000"
                  className="flex items-start gap-2.5 transition-colors hover:text-white"
                >
                  <Phone className="mt-0.5 size-4 shrink-0 text-white/40" />
                  <span className="tnum">+998 71 200 00 00</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:salom@uyjoy.uz"
                  className="flex items-start gap-2.5 transition-colors hover:text-white"
                >
                  <Mail className="mt-0.5 size-4 shrink-0 text-white/40" />
                  salom@uyjoy.uz
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-white/40" />
                <span>Toshkent, Amir Temur ko'chasi 1</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col-reverse items-center justify-between gap-4 border-t border-white/10 py-6 text-sm text-white/45 md:flex-row">
          <p>
            © <span className="tnum">{new Date().getFullYear()}</span> UyJoy.uz —{" "}
            {t.footer.allRightsReserved}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link to="/" className="transition-colors hover:text-white">
              {t.footer.privacy}
            </Link>
            <Link to="/" className="transition-colors hover:text-white">
              {t.footer.terms}
            </Link>
            <span className="hidden text-white/30 md:inline">{t.footer.madeIn}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
