import type { Language } from "./context";

const LOCALES: Record<Language, string> = { uz: "uz-UZ", ru: "ru-RU", en: "en-US" };

/**
 * Fills `{placeholder}` slots in a translated string.
 *
 * Deliberately minimal: the dictionaries are plain objects, not ICU messages,
 * and the only thing any of them needs is substitution. A missing value leaves
 * the placeholder untouched rather than printing "undefined", which makes a
 * forgotten key obvious in review instead of shipping as a broken sentence.
 */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

/**
 * Uzbek dates are written here rather than left to `Intl`.
 *
 * Chromium reports `uz` from `supportedLocalesOf` but formats it with root
 * data: `Intl.RelativeTimeFormat("uz-UZ").format(-8, "minute")` returns
 * "-8 min", and a medium date returns "2026 M09 17". Uzbek is this site's
 * default language, so the most visible locale would be the broken one, and
 * `supportedLocalesOf` gives us no way to detect it. Russian and English have
 * complete data in every engine we target, so they still go through `Intl`.
 *
 * Uzbek has no plural agreement here — "1 kun oldin", "5 kun oldin" — so one
 * template per unit is enough.
 */
const UZ = {
  now: "hozirgina",
  yesterday: "kecha",
  tomorrow: "ertaga",
  past: {
    minute: "{n} daqiqa oldin",
    hour: "{n} soat oldin",
    day: "{n} kun oldin",
    week: "{n} hafta oldin",
    month: "{n} oy oldin",
    year: "{n} yil oldin",
  },
  future: {
    minute: "{n} daqiqadan keyin",
    hour: "{n} soatdan keyin",
    day: "{n} kundan keyin",
    week: "{n} haftadan keyin",
    month: "{n} oydan keyin",
    year: "{n} yildan keyin",
  },
} as const;

type Unit = keyof typeof UZ.past;

const UNITS: [Unit, number][] = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["week", 604_800],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
];

const pad = (n: number) => String(n).padStart(2, "0");

/** "3 daqiqa oldin" / "3 минуты назад" / "3 minutes ago", in the active language. */
export function relativeTime(iso: string, language: Language): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const seconds = Math.round((then - Date.now()) / 1000);

  if (language === "uz") {
    const past = seconds < 0;
    const abs = Math.abs(seconds);
    if (abs < 60) return UZ.now;

    for (const [unit, size] of UNITS) {
      if (abs < size) continue;
      const n = Math.round(abs / size);
      if (unit === "day" && n === 1) return past ? UZ.yesterday : UZ.tomorrow;
      return fill(past ? UZ.past[unit] : UZ.future[unit], { n });
    }
    return UZ.now;
  }

  try {
    const rtf = new Intl.RelativeTimeFormat(LOCALES[language], { numeric: "auto" });
    for (const [unit, size] of UNITS) {
      if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
    }
    return rtf.format(Math.min(-1, seconds), "second");
  } catch {
    return formatDateTime(iso, language);
  }
}

/** Absolute date+time for tooltips and detail rows. */
export function formatDateTime(iso: string, language: Language): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  // Same reason as above: Chromium renders a medium `uz` date as "2026 M09 17".
  if (language === "uz") {
    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}, ${pad(
      date.getHours(),
    )}:${pad(date.getMinutes())}`;
  }

  try {
    return date.toLocaleString(LOCALES[language], { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return date.toLocaleString();
  }
}
