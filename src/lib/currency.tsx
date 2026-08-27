import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type Currency = "USD" | "UZS" | "EUR" | "GBP" | "AED" | "KZT" | "TRY";

export const currencySymbols: Record<Currency, string> = {
  USD: "$",
  UZS: "so'm",
  EUR: "€",
  GBP: "£",
  AED: "AED",
  KZT: "₸",
  TRY: "₺",
};

export const currencyNames: Record<Currency, { uz: string; ru: string; en: string }> = {
  USD: { uz: "AQSh dollari", ru: "Доллар США", en: "US Dollar" },
  UZS: { uz: "O'zbek so'mi", ru: "Узбекский сум", en: "Uzbek Som" },
  EUR: { uz: "Yevro", ru: "Евро", en: "Euro" },
  GBP: { uz: "Funt sterling", ru: "Фунт стерлингов", en: "British Pound" },
  AED: { uz: "BAA dirhami", ru: "Дирхам ОАЭ", en: "UAE Dirham" },
  KZT: { uz: "Qozog'iston tengesi", ru: "Казахстанский тенге", en: "Kazakhstani Tenge" },
  TRY: { uz: "Turk lirasi", ru: "Турецкая лира", en: "Turkish Lira" },
};

// Approximate exchange rates (will be fetched from API in production)
const exchangeRates: Record<Currency, number> = {
  USD: 1,
  UZS: 12500, // 1 USD = 12,500 UZS (approximate)
  EUR: 0.92,
  GBP: 0.79,
  AED: 3.67,
  KZT: 450,
  TRY: 32,
};

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convert: (amount: number, from?: Currency, to?: Currency) => number;
  format: (amount: number, from?: Currency) => string;
  formatWithSymbol: (amount: number, from?: Currency) => string;
};

const STORAGE_KEY = "uyjoy-currency";

function getInitialCurrency(): Currency {
  if (typeof window === "undefined") return "USD";

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && Object.keys(exchangeRates).includes(stored)) {
    return stored as Currency;
  }

  return "USD";
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("USD");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCurrencyState(getInitialCurrency());
    setMounted(true);
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, c);
    }
  }, []);

  const convert = useCallback(
    (amount: number, from: Currency = "USD", to?: Currency): number => {
      const targetCurrency = to ?? currency;
      if (from === targetCurrency) return amount;

      // Convert to USD first, then to target currency
      const inUsd = amount / exchangeRates[from];
      return inUsd * exchangeRates[targetCurrency];
    },
    [currency]
  );

  const format = useCallback(
    (amount: number, from: Currency = "USD"): string => {
      const converted = convert(amount, from);

      if (currency === "UZS" || currency === "KZT") {
        return Math.round(converted).toLocaleString("en-US");
      }

      return converted.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    },
    [convert, currency]
  );

  const formatWithSymbol = useCallback(
    (amount: number, from: Currency = "USD"): string => {
      const formatted = format(amount, from);
      const symbol = currencySymbols[currency];

      if (currency === "UZS") {
        return `${formatted} ${symbol}`;
      }

      return `${symbol}${formatted}`;
    },
    [format, currency]
  );

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    convert,
    format,
    formatWithSymbol,
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <CurrencyContext.Provider value={{ ...value, currency: "USD" }}>
        {children}
      </CurrencyContext.Provider>
    );
  }

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}

// Utility for formatting price in listings
export function formatListingPrice(
  price: number,
  deal: "sotuv" | "ijara",
  currency: Currency,
  formatFn: (amount: number) => string
): string {
  const formatted = formatFn(price);
  const symbol = currencySymbols[currency];

  if (currency === "UZS") {
    return deal === "ijara" ? `${formatted} so'm/oy` : `${formatted} so'm`;
  }

  return deal === "ijara" ? `${symbol}${formatted}/oy` : `${symbol}${formatted}`;
}
