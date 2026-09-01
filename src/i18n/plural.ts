import type { Language } from "./context";

const LOCALES: Record<Language, string> = { uz: "uz", ru: "ru", en: "en" };

/**
 * Picks the right plural form for a count. Russian needs three
 * ("1 объявление", "2 объявления", "5 объявлений"); Uzbek needs none.
 * Intl.PluralRules does the categorisation so we don't hand-roll the rules.
 */
export function pluralForm(
  language: Language,
  count: number,
  forms: { one: string; few: string; many: string },
): string {
  let category: Intl.LDMLPluralRule = count === 1 ? "one" : "other";
  try {
    category = new Intl.PluralRules(LOCALES[language]).select(count);
  } catch {
    // Fall through to the count === 1 guess above.
  }

  if (category === "one") return forms.one;
  if (category === "few") return forms.few;
  return forms.many;
}
