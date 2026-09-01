import { Check, ChevronDown, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage, type Language } from "@/i18n";
import { useCurrency, currencySymbols, type Currency } from "@/lib/currency";
import { cn } from "@/lib/utils";

const languages: { code: Language; name: string; short: string }[] = [
  { code: "uz", name: "O'zbekcha", short: "UZ" },
  { code: "ru", name: "Русский", short: "RU" },
  { code: "en", name: "English", short: "EN" },
];

const currencies: Currency[] = ["USD", "UZS", "EUR", "GBP", "AED"];

export function LanguageCurrencySelector({ tone = "default" }: { tone?: "default" | "light" }) {
  const { language, setLanguage, t } = useLanguage();
  const { currency, setCurrency } = useCurrency();

  const current = languages.find((l) => l.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-9 gap-1.5 px-2.5 text-xs font-semibold tracking-wide",
            tone === "light" && "text-white/80 hover:bg-white/10 hover:text-white",
          )}
          aria-label={`${t.profile.language} / ${t.profile.currency}`}
        >
          <Globe className="size-4" />
          <span>{current?.short}</span>
          <span className={cn("opacity-40", tone === "light" && "opacity-50")}>·</span>
          <span>{currencySymbols[currency]}</span>
          <ChevronDown className="size-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="text-[0.6875rem] font-bold tracking-[0.12em] text-muted-foreground uppercase">
          {t.profile.language}
        </DropdownMenuLabel>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className="justify-between gap-2 font-medium"
          >
            <span className="flex items-center gap-2.5">
              <span className="w-6 text-[0.6875rem] font-bold tracking-wider text-muted-foreground">
                {lang.short}
              </span>
              {lang.name}
            </span>
            {language === lang.code && <Check className="size-4 text-primary" />}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-[0.6875rem] font-bold tracking-[0.12em] text-muted-foreground uppercase">
          {t.profile.currency}
        </DropdownMenuLabel>
        {currencies.map((code) => (
          <DropdownMenuItem
            key={code}
            onClick={() => setCurrency(code)}
            className="justify-between gap-2 font-medium"
          >
            <span className="flex items-center gap-2.5">
              <span className="w-6 text-[0.6875rem] font-bold tracking-wider text-muted-foreground">
                {currencySymbols[code]}
              </span>
              {code}
            </span>
            {currency === code && <Check className="size-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
