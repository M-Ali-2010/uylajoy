"use client";

import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Home,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Send,
  ArrowUpRight,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/i18n";

export function SiteFooter() {
  const { t } = useTranslation();

  const footerLinks = {
    buyers: [
      { to: "/elonlar", search: { deal: "sotuv" }, label: t.footer.saleHouses },
      { to: "/elonlar", search: { deal: "ijara" }, label: t.footer.rentHouses },
      { to: "/ipoteka", label: t.nav.mortgage },
      { to: "/narxlar", label: t.nav.marketPrices },
    ],
    sellers: [
      { to: "/elon-joylash", label: t.footer.freeListing },
      { to: "/narxlar", label: "Narxlar tahlili" },
      { to: "/agentlar", label: "Agentlar" },
      { to: "/agentliklar", label: "Agentliklar" },
    ],
    company: [
      { to: "/haqida", label: "Biz haqimizda" },
      { to: "/kontakt", label: "Bog'lanish" },
      { to: "/blog", label: "Blog" },
      { to: "/yordam", label: "Yordam markazi" },
    ],
  };

  const socialLinks = [
    { icon: Instagram, href: "https://instagram.com/uyjoy.uz", label: "Instagram" },
    { icon: Facebook, href: "https://facebook.com/uyjoy.uz", label: "Facebook" },
    { icon: Send, href: "https://t.me/uyjoy_uz", label: "Telegram" },
  ];

  return (
    <footer className="relative mt-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 to-secondary/80" />
      <div className="absolute inset-0 hero-pattern opacity-30" />

      {/* Newsletter Section */}
      <div className="relative border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-between gap-8 lg:flex-row"
          >
            <div className="text-center lg:text-left">
              <h3 className="font-display text-2xl font-bold md:text-3xl">
                Yangi e'lonlardan xabardor bo'ling
              </h3>
              <p className="mt-2 text-muted-foreground">
                Eng so'nggi e'lonlar va maxsus takliflarni birinchi bo'lib oling
              </p>
            </div>

            <form className="flex w-full max-w-md gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email manzilingiz"
                  className="h-12 rounded-xl border-border/60 bg-card pl-12"
                />
              </div>
              <Button type="submit" className="h-12 gap-2 rounded-xl px-6">
                Obuna
                <ArrowUpRight className="size-4" />
              </Button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="relative">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
            {/* Brand */}
            <div className="lg:col-span-2">
              <Link to="/" className="inline-flex items-center gap-2.5">
                <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/25">
                  <Home className="size-5 text-white" />
                </div>
                <span className="font-display text-xl font-black tracking-tight">
                  UyJoy.uz
                </span>
              </Link>

              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {t.footer.description}
              </p>

              {/* Social Links */}
              <div className="mt-6 flex gap-3">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex size-10 items-center justify-center rounded-xl bg-card text-muted-foreground shadow-sm transition-colors hover:bg-primary hover:text-white"
                    aria-label={social.label}
                  >
                    <social.icon className="size-5" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
                {t.footer.forBuyers}
              </h4>
              <ul className="mt-4 space-y-3">
                {footerLinks.buyers.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to as "/elonlar" | "/ipoteka" | "/narxlar"}
                      search={"search" in link ? link.search as { deal: "sotuv" | "ijara" } : undefined}
                      className="group flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                      <ArrowUpRight className="size-3 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
                {t.footer.forSellers}
              </h4>
              <ul className="mt-4 space-y-3">
                {footerLinks.sellers.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="group flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                      <ArrowUpRight className="size-3 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
                {t.footer.contact}
              </h4>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>+998 71 200 00 00</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>salom@uyjoy.uz</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>Toshkent, Amir Temur ko'chasi 1</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-muted-foreground md:flex-row lg:px-6">
            <p>
              © {new Date().getFullYear()} UyJoy.uz — {t.footer.allRightsReserved}
            </p>
            <div className="flex items-center gap-1">
              <span>Made with</span>
              <Heart className="size-4 fill-red-500 text-red-500" />
              <span>in Uzbekistan</span>
            </div>
            <div className="flex gap-6">
              <Link to="/" className="transition-colors hover:text-foreground">
                Maxfiylik siyosati
              </Link>
              <Link to="/" className="transition-colors hover:text-foreground">
                Foydalanish shartlari
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
