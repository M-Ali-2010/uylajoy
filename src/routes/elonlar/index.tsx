import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { SiteHeader } from "@/components/uyjoy/site-header";
import { SiteFooter } from "@/components/uyjoy/site-footer";
import { PropertyCard } from "@/components/uyjoy/property-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cities, listings, typeLabels, type PropType } from "@/data/listings";

type Search = {
  deal?: "sotuv" | "ijara" | undefined;
  city?: string | undefined;
  type?: string | undefined;
  q?: string | undefined;
};

export const Route = createFileRoute("/elonlar/")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    deal:
      search["deal"] === "ijara" ? "ijara" : search["deal"] === "sotuv" ? "sotuv" : undefined,
    city: typeof search["city"] === "string" ? search["city"] : undefined,
    type: typeof search["type"] === "string" ? search["type"] : undefined,
    q: typeof search["q"] === "string" ? search["q"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "E'lonlar — sotuv va ijara uylari | UyJoy.uz" },
      {
        name: "description",
        content:
          "O'zbekiston bo'ylab kvartira, hovli, ofis va yer uchastkalari e'lonlari. Narx, xonalar soni va hudud bo'yicha filtrlang.",
      },
      { property: "og:title", content: "E'lonlar — sotuv va ijara uylari | UyJoy.uz" },
      {
        property: "og:description",
        content: "Tekshirilgan ko'chmas mulk e'lonlarini filtrlar bilan toping.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ElonlarPage,
});

function ElonlarPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [maxPrice, setMaxPrice] = useState(200000);
  const [rooms, setRooms] = useState<string>("all");
  const [sort, setSort] = useState("new");
  const [query, setQuery] = useState(search.q ?? "");

  const results = useMemo(() => {
    let out = listings.filter((l) => {
      if (search.deal && l.deal !== search.deal) return false;
      if (search.city && l.city !== search.city) return false;
      if (search.type && l.type !== search.type) return false;
      if (rooms !== "all" && l.rooms < Number(rooms)) return false;
      if (l.deal === "sotuv" && l.price > maxPrice) return false;
      const q = query.trim().toLowerCase();
      if (q && !`${l.title} ${l.city} ${l.district} ${l.address}`.toLowerCase().includes(q))
        return false;
      return true;
    });
    out = [...out].sort((a, b) =>
      sort === "cheap" ? a.price - b.price : sort === "expensive" ? b.price - a.price : b.rating - a.rating,
    );
    return out;
  }, [search.deal, search.city, search.type, rooms, maxPrice, query, sort]);

  const setParam = (key: keyof Search, value?: string) =>
    navigate({ search: (prev) => ({ ...prev, [key]: value === "all" ? undefined : value }) });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="font-display text-3xl font-extrabold md:text-4xl">
          {search.deal === "ijara" ? "Ijaradagi mulklar" : "Sotuvdagi mulklar"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {results.length} ta e'lon topildi {search.city ? `— ${search.city}` : "— butun O'zbekiston"}
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit space-y-6 rounded-2xl border border-border bg-card p-5 shadow-card lg:sticky lg:top-24">
            <p className="flex items-center gap-2 font-semibold">
              <SlidersHorizontal className="size-4" /> Filtrlar
            </p>

            <div className="space-y-2">
              <Label>Qidiruv</Label>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tuman, ko'cha yoki nom"
              />
            </div>

            <div className="space-y-2">
              <Label>Bitim turi</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={search.deal !== "ijara" ? "default" : "soft"}
                  size="sm"
                  onClick={() => setParam("deal", "sotuv")}
                >
                  Sotuv
                </Button>
                <Button
                  variant={search.deal === "ijara" ? "default" : "soft"}
                  size="sm"
                  onClick={() => setParam("deal", "ijara")}
                >
                  Ijara
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Shahar</Label>
              <Select value={search.city ?? "all"} onValueChange={(v) => setParam("city", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Barcha shaharlar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha shaharlar</SelectItem>
                  {cities.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Mulk turi</Label>
              <Select value={search.type ?? "all"} onValueChange={(v) => setParam("type", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Barchasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barchasi</SelectItem>
                  {(Object.keys(typeLabels) as PropType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {typeLabels[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Xonalar (kamida)</Label>
              <Select value={rooms} onValueChange={setRooms}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Farqi yo'q</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Maksimal narx (sotuv): ${maxPrice.toLocaleString("en-US")}</Label>
              <Slider
                value={[maxPrice]}
                min={20000}
                max={200000}
                step={5000}
                onValueChange={(v) => setMaxPrice(v[0] ?? 200000)}
              />
            </div>

            <Button
              variant="soft"
              className="w-full"
              onClick={() => {
                setQuery("");
                setRooms("all");
                setMaxPrice(200000);
                navigate({ search: {} });
              }}
            >
              Filtrlarni tozalash
            </Button>
          </aside>

          <section>
            <div className="mb-5 flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">Saralash</p>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Tavsiya etilgan</SelectItem>
                  <SelectItem value="cheap">Avval arzoni</SelectItem>
                  <SelectItem value="expensive">Avval qimmati</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {results.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-16 text-center">
                <p className="font-semibold">Mos e'lon topilmadi</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Filtrlarni kengaytirib ko'ring yoki boshqa shahar tanlang.
                </p>
                <Button variant="soft" className="mt-5" asChild>
                  <Link to="/elonlar">Barcha e'lonlar</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((l) => (
                  <PropertyCard key={l.id} listing={l} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}