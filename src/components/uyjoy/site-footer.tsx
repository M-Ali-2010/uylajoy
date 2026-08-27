import { Link } from "@tanstack/react-router";
import { useTranslation } from "@/i18n";

export function SiteFooter() {
  const { t } = useTranslation();

  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <p className="font-display text-lg font-extrabold">UyJoy.uz</p>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            {t.footer.description}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">{t.footer.forBuyers}</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/elonlar" search={{ deal: "sotuv" }} className="hover:text-foreground">
                {t.footer.saleHouses}
              </Link>
            </li>
            <li>
              <Link to="/elonlar" search={{ deal: "ijara" }} className="hover:text-foreground">
                {t.footer.rentHouses}
              </Link>
            </li>
            <li>
              <Link to="/ipoteka" className="hover:text-foreground">
                {t.nav.mortgage}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">{t.footer.forSellers}</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/elon-joylash" className="hover:text-foreground">
                {t.footer.freeListing}
              </Link>
            </li>
            <li>
              <Link to="/narxlar" className="hover:text-foreground">
                {t.nav.marketPrices}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">{t.footer.contact}</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>+998 71 200 00 00</li>
            <li>salom@uyjoy.uz</li>
            <li>Toshkent, Amir Temur ko'chasi 1</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} UyJoy.uz — {t.footer.allRightsReserved}
      </div>
    </footer>
  );
}
