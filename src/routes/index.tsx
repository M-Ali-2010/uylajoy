import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter } from "@/components/uyjoy/site-footer";
import { SiteHeader } from "@/components/uyjoy/site-header";
import { Benefits } from "@/components/uyjoy/home/benefits";
import { CityExplorer } from "@/components/uyjoy/home/city-explorer";
import { CtaBanner } from "@/components/uyjoy/home/cta-banner";
import { FeaturedListings } from "@/components/uyjoy/home/featured-listings";
import { Hero } from "@/components/uyjoy/home/hero";
import { NewListings } from "@/components/uyjoy/home/new-listings";
import { Newsletter } from "@/components/uyjoy/home/newsletter";
import { PropertyCategories } from "@/components/uyjoy/home/property-categories";
import { TrustStrip } from "@/components/uyjoy/home/trust-strip";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UyJoy.uz — O'zbekistonda uy sotib olish va ijara" },
      {
        name: "description",
        content:
          "Toshkent, Samarqand va butun O'zbekiston bo'ylab tekshirilgan kvartira, hovli va ofis e'lonlari. Ipoteka kalkulyatori va real bozor narxlari.",
      },
      { property: "og:title", content: "UyJoy.uz — O'zbekiston ko'chmas mulk platformasi" },
      {
        property: "og:description",
        content: "Tekshirilgan e'lonlar, ipoteka kalkulyatori va hududlar bo'yicha bozor narxlari.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

/**
 * Section rhythm, top to bottom:
 *   photo → paper (raised) → tint → paper → INK → warm → paper → teal → paper
 * No two neighbouring sections share a ground, which is what keeps the scroll
 * from flattening out.
 */
function Index() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader overlay />

      <main className="flex-1">
        <Hero />
        <TrustStrip />
        <PropertyCategories />
        <FeaturedListings />
        <Benefits />
        <CityExplorer />
        <NewListings />
        <CtaBanner />
        <Newsletter />
      </main>

      <SiteFooter />
    </div>
  );
}
