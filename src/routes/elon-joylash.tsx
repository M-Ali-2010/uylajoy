import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/uyjoy/site-header";
import { SiteFooter } from "@/components/uyjoy/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cities, typeLabels, type PropType } from "@/data/listings";

export const Route = createFileRoute("/elon-joylash")({
  head: () => ({
    meta: [
      { title: "Bepul e'lon joylash — uyingizni tez soting | UyJoy.uz" },
      {
        name: "description",
        content:
          "Kvartira, hovli, ofis yoki yer uchastkangizni bepul e'lon qiling. Minglab xaridorlar sizni topadi.",
      },
      { property: "og:title", content: "Bepul e'lon joylash | UyJoy.uz" },
      {
        property: "og:description",
        content: "3 daqiqada e'lon joylang va tekshirilgan xaridorlar bilan bog'laning.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ElonJoylashPage,
});

function ElonJoylashPage() {
  const [type, setType] = useState<string>("kvartira");
  const [city, setCity] = useState<string>("Toshkent");

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-14">
        <h1 className="font-display text-3xl font-extrabold md:text-4xl">E'lon joylash</h1>
        <p className="mt-3 text-muted-foreground">
          Ma'lumotlarni to'ldiring — moderator 1 soat ichida e'loningizni tasdiqlaydi.
        </p>

        <form
          className="mt-10 space-y-6 rounded-2xl border border-border bg-card p-6 shadow-card"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("E'loningiz qabul qilindi!", {
              description: "Moderator tasdiqlagach, e'lon saytda paydo bo'ladi.",
            });
            (e.target as HTMLFormElement).reset();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="title">E'lon sarlavhasi</Label>
            <Input id="title" required placeholder="Masalan: Yunusobodda 3 xonali kvartira" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Mulk turi</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(typeLabels) as PropType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {typeLabels[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Shahar</Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="price">Narx ($)</Label>
              <Input id="price" type="number" required placeholder="75000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Maydon (m²)</Label>
              <Input id="area" type="number" required placeholder="72" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rooms">Xonalar</Label>
              <Input id="rooms" type="number" placeholder="3" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Tavsif</Label>
            <Textarea id="desc" rows={5} placeholder="Mulk haqida batafsil yozing..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefon raqam</Label>
            <Input id="phone" required placeholder="+998 90 123 45 67" />
          </div>

          <Button type="submit" variant="hero" size="xl" className="w-full">
            Bepul e'lon joylash
          </Button>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}