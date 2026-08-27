import { Globe, ChevronDown } from "lucide-react";
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
import { useCurrency, type Currency, currencySymbols } from "@/lib/currency";

const languages: { code: Language; name: string; flag: string }[] = [
  { code: "uz", name: "O'zbekcha", flag: "🇺🇿" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "en", name: "English", flag: "🇬🇧" },
];

const currencies: { code: Currency; symbol: string }[] = [
  { code: "USD", symbol: "$" },
  { code: "UZS", symbol: "so'm" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "AED", symbol: "AED" },
];

export function LanguageCurrencySelector() {
  const { language, setLanguage, t } = useLanguage();
  const { currency, setCurrency } = useCurrency();

  const currentLang = languages.find((l) => l.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
          <Globe className="size-4" />
          <span className="hidden sm:inline">{currentLang?.flag}</span>
          <span className="hidden md:inline">{currencySymbols[currency]}</span>
          <ChevronDown className="size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{t.profile.language}</DropdownMenuLabel>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={language === lang.code ? "bg-secondary" : ""}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t.profile.currency}</DropdownMenuLabel>
        {currencies.map((curr) => (
          <DropdownMenuItem
            key={curr.code}
            onClick={() => setCurrency(curr.code)}
            className={currency === curr.code ? "bg-secondary" : ""}
          >
            <span className="mr-2 font-mono">{curr.symbol}</span>
            {curr.code}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
