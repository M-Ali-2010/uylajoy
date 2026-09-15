import { fill, formatDateTime, type Language, type TranslationKeys } from "@/i18n";
import type { AppNotification } from "./queries";

/**
 * Where a notification leads. Kept as a union of literal routes rather than a
 * bare string so the router's typed `Link` accepts it without a cast.
 */
export type NotificationHref =
  | { to: "/elonlar/$id"; params: { id: string } }
  | { to: "/dashboard/elonlarim" }
  | { to: "/dashboard/sorovlar" }
  | { to: "/dashboard/korishlar" };

export interface NotificationView {
  title: string;
  body: string;
  href: NotificationHref | null;
}

const str = (value: unknown): string | null =>
  typeof value === "string" && value.trim() !== "" ? value : null;

const num = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

/**
 * Renders a notification in the reader's language.
 *
 * `title` and `content` were written to the row in Uzbek when the event
 * happened, so they cannot follow a later language switch. Every event helper
 * also writes its moving parts to `data`, which lets us rebuild the sentence
 * here. When a row predates that (or is an admin-authored `system` message,
 * which has no template), we fall back to the stored text — stale language
 * beats a blank card.
 */
export function describeNotification(
  n: AppNotification,
  t: TranslationKeys,
  language: Language,
): NotificationView {
  const data = n.data ?? {};
  const stored = { title: n.title, body: n.content, href: null } satisfies NotificationView;

  const propertyId = str(data["propertyId"]);
  const propertyHref = propertyId
    ? ({ to: "/elonlar/$id", params: { id: propertyId } } as const)
    : null;

  switch (n.type) {
    case "listing_approved": {
      const title = str(data["propertyTitle"]);
      if (!title) return { ...stored, href: propertyHref };
      return {
        title: t.notifications.approvedTitle,
        body: fill(t.notifications.approvedBody, { title }),
        href: propertyHref,
      };
    }

    case "listing_rejected": {
      const title = str(data["propertyTitle"]);
      const reason = str(data["reason"]);
      if (!title || !reason) return { ...stored, href: { to: "/dashboard/elonlarim" } };
      return {
        title: t.notifications.rejectedTitle,
        body: fill(t.notifications.rejectedBody, { title, reason }),
        href: { to: "/dashboard/elonlarim" },
      };
    }

    // Both leads and viewing requests are stored as `lead`; only a viewing
    // request carries a viewingRequestId.
    case "lead": {
      const name = str(data["leadName"]);
      const viewingId = str(data["viewingRequestId"]);

      if (viewingId) {
        const preferredAt = str(data["preferredAt"]);
        if (!name || !preferredAt) return { ...stored, href: { to: "/dashboard/korishlar" } };
        return {
          title: t.notifications.viewingTitle,
          body: fill(t.notifications.viewingBody, {
            name,
            time: formatDateTime(preferredAt, language),
          }),
          href: { to: "/dashboard/korishlar" },
        };
      }

      const phone = str(data["leadPhone"]);
      const title = str(data["propertyTitle"]);
      if (!name || !phone || !title) return { ...stored, href: { to: "/dashboard/sorovlar" } };
      return {
        title: t.notifications.leadTitle,
        body: fill(t.notifications.leadBody, { name, phone, title }),
        href: { to: "/dashboard/sorovlar" },
      };
    }

    case "price_drop": {
      const title = str(data["propertyTitle"]);
      const oldPrice = num(data["oldPrice"]);
      const newPrice = num(data["newPrice"]);
      const currency = str(data["currency"]) ?? "";
      if (!title || oldPrice === null || newPrice === null)
        return { ...stored, href: propertyHref };
      // Every price on the site is grouped en-US style (see lib/currency.tsx);
      // a notification is not the place to introduce a second convention.
      const money = (value: number) => `${value.toLocaleString("en-US")} ${currency}`.trim();
      return {
        title: t.notifications.priceDropTitle,
        body: fill(t.notifications.priceDropBody, {
          title,
          oldPrice: money(oldPrice),
          newPrice: money(newPrice),
        }),
        href: propertyHref,
      };
    }

    case "review": {
      const name = str(data["reviewerName"]);
      const rating = num(data["rating"]);
      if (!name || rating === null) return stored;
      return {
        title: t.notifications.reviewTitle,
        body: fill(t.notifications.reviewBody, { name, rating }),
        href: null,
      };
    }

    // `system` and `message` are written by a human, not a template.
    default:
      return { ...stored, href: propertyHref };
  }
}
