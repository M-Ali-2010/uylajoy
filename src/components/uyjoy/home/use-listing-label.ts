import { pluralForm, useTranslation } from "@/i18n";

/** Returns the correctly inflected "listings" word for a given count. */
export function useListingLabel() {
  const { t, language } = useTranslation();

  return (count: number) =>
    pluralForm(language, count, {
      one: t.home.listingsCountOne,
      few: t.home.listingsCountFew,
      many: t.home.listingsCountMany,
    });
}
