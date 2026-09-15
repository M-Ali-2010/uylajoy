import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, ImagePlus, Star, Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/uyjoy/site-header";
import { SiteFooter } from "@/components/uyjoy/site-footer";
import { RequireAuth } from "@/components/uyjoy/require-auth";
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
import { useTranslation } from "@/i18n";
import { propertiesApi, uploadApi } from "@/lib/api-client";
import { cities, DEAL_TO_API, TYPE_TO_API, type Deal, type PropType } from "@/lib/listing";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/elon-joylash")({
  head: () => ({
    meta: [
      { title: "Bepul e'lon joylash — uyingizni tez soting | UyJoy.uz" },
      {
        name: "description",
        content: "Kvartira, hovli yoki ofisingizni bepul e'lon qiling. Moderatsiya 1 soat ichida.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <PostListingPage />
    </RequireAuth>
  ),
});

const MAX_PHOTOS = 20;
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

interface Photo {
  id: string;
  url: string;
  preview: string;
  status: "uploading" | "done" | "error";
}

interface Form {
  deal: Deal;
  type: PropType;
  title: string;
  city: string;
  district: string;
  address: string;
  price: string;
  currency: "USD" | "UZS" | "EUR";
  area: string;
  rooms: string;
  floor: string;
  totalFloors: string;
  yearBuilt: string;
  description: string;
  amenities: string;
}

const initial: Form = {
  deal: "sotuv",
  type: "kvartira",
  title: "",
  city: "Toshkent",
  district: "",
  address: "",
  price: "",
  currency: "USD",
  area: "",
  rooms: "",
  floor: "",
  totalFloors: "",
  yearBuilt: "",
  description: "",
  amenities: "",
};

function PostListingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(initial);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [coverId, setCoverId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const steps = [
    t.postListing.stepBasics,
    t.postListing.stepDetails,
    t.postListing.stepPhotos,
    t.postListing.stepPreview,
  ];

  const typeOptions: { value: PropType; label: string }[] = [
    { value: "kvartira", label: t.propertyType.apartment },
    { value: "hovli", label: t.propertyType.house },
    { value: "ofis", label: t.propertyType.office },
    { value: "yer", label: t.propertyType.land },
    { value: "tijorat", label: t.propertyType.commercial },
  ];

  // What the API will receive — built once, shown on the preview step
  const payload = useMemo(() => {
    const num = (v: string) => (v.trim() === "" ? undefined : Number(v));
    const done = photos.filter((p) => p.status === "done");
    return {
      title: form.title.trim(),
      description: form.description.trim(),
      type: TYPE_TO_API[form.type],
      dealType: DEAL_TO_API[form.deal],
      price: Math.round(Number(form.price)),
      currency: form.currency,
      city: form.city,
      district: form.district.trim(),
      address: form.address.trim(),
      totalArea: Number(form.area),
      rooms: num(form.rooms),
      floor: num(form.floor),
      totalFloors: num(form.totalFloors),
      yearBuilt: num(form.yearBuilt),
      amenities: form.amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean)
        .slice(0, 40),
      images: done.map((p, i) => ({
        url: p.url,
        order: i,
        isCover: p.id === (coverId ?? done[0]?.id),
      })),
    };
  }, [form, photos, coverId]);

  const stepValid = [
    form.title.trim().length >= 5 &&
      form.district.trim().length >= 2 &&
      form.address.trim().length >= 5 &&
      Number(form.price) > 0,
    Number(form.area) > 0 && form.description.trim().length >= 20,
    photos.some((p) => p.status === "done") && !photos.some((p) => p.status === "uploading"),
    true,
  ];

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const room = MAX_PHOTOS - photos.length;
    if (files.length > room) toast.error(t.postListing.tooManyPhotos);

    Array.from(files)
      .slice(0, Math.max(0, room))
      .forEach((file) => {
        if (!ALLOWED.includes(file.type)) {
          toast.error(`${file.name}: ${t.postListing.fileType}`);
          return;
        }
        if (file.size > MAX_BYTES) {
          toast.error(`${file.name}: ${t.postListing.fileTooLarge}`);
          return;
        }

        const id = crypto.randomUUID();
        const preview = URL.createObjectURL(file);
        setPhotos((p) => [...p, { id, url: "", preview, status: "uploading" }]);

        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const res = await uploadApi.uploadImage(String(reader.result), "properties");
            setPhotos((p) =>
              p.map((x) => (x.id === id ? { ...x, url: res.result.url, status: "done" } : x)),
            );
          } catch (error) {
            setPhotos((p) => p.map((x) => (x.id === id ? { ...x, status: "error" } : x)));
            toast.error(
              `${t.postListing.uploadFailed}: ${error instanceof Error ? error.message : ""}`,
            );
          }
        };
        reader.readAsDataURL(file);
      });
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await propertiesApi.create(payload);
      const id = (res.property as { id: string }).id;
      toast.success(t.postListing.success, { description: t.postListing.successDesc });
      navigate({ to: "/elonlar/$id", params: { id } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.common.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="shell flex-1 py-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="type-h1">{t.postListing.title}</h1>
          <p className="mt-2 text-muted-foreground">{t.postListing.subtitle}</p>

          <ol className="mt-8 grid grid-cols-4 gap-2" aria-label={t.postListing.title}>
            {steps.map((label, i) => (
              <li
                key={label}
                aria-current={i === step ? "step" : undefined}
                className="text-center"
              >
                <div
                  className={cn(
                    "h-1 rounded-full transition-colors",
                    i <= step ? "bg-primary" : "bg-border",
                  )}
                />
                <span
                  className={cn(
                    "mt-2 block text-xs font-semibold",
                    i === step ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </li>
            ))}
          </ol>

          <section className="mt-8 rounded-xl border border-border bg-card p-6 shadow-card md:p-8">
            {step === 0 && (
              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label={t.postListing.dealType}>
                    <div className="grid grid-cols-2 gap-2">
                      {(["sotuv", "ijara"] as const).map((d) => (
                        <Button
                          key={d}
                          type="button"
                          variant={form.deal === d ? "default" : "soft"}
                          aria-pressed={form.deal === d}
                          onClick={() => set("deal", d)}
                        >
                          {d === "sotuv" ? t.deal.buy : t.deal.rent}
                        </Button>
                      ))}
                    </div>
                  </Field>
                  <Field label={t.postListing.propertyType}>
                    <Select value={form.type} onValueChange={(v) => set("type", v as PropType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {typeOptions.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <Field label={t.postListing.listingTitle} htmlFor="f-title">
                  <Input
                    id="f-title"
                    value={form.title}
                    maxLength={140}
                    placeholder={t.postListing.titlePlaceholder}
                    onChange={(e) => set("title", e.target.value)}
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label={t.postListing.city}>
                    <Select value={form.city} onValueChange={(v) => set("city", v)}>
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
                  </Field>
                  <Field label={t.postListing.district} htmlFor="f-district">
                    <Input
                      id="f-district"
                      value={form.district}
                      maxLength={80}
                      placeholder={t.postListing.districtPlaceholder}
                      onChange={(e) => set("district", e.target.value)}
                    />
                  </Field>
                </div>

                <Field label={t.postListing.address} htmlFor="f-address">
                  <Input
                    id="f-address"
                    value={form.address}
                    maxLength={200}
                    placeholder={t.postListing.addressPlaceholder}
                    onChange={(e) => set("address", e.target.value)}
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-[1fr_9rem]">
                  <Field label={t.postListing.price} htmlFor="f-price">
                    <Input
                      id="f-price"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={form.price}
                      onChange={(e) => set("price", e.target.value)}
                    />
                  </Field>
                  <Field label={t.postListing.currency}>
                    <Select
                      value={form.currency}
                      onValueChange={(v) => set("currency", v as Form["currency"])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="UZS">UZS</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label={t.postListing.area} htmlFor="f-area">
                    <Input
                      id="f-area"
                      type="number"
                      inputMode="decimal"
                      min={1}
                      value={form.area}
                      onChange={(e) => set("area", e.target.value)}
                    />
                  </Field>
                  <Field label={t.postListing.rooms} htmlFor="f-rooms">
                    <Input
                      id="f-rooms"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={50}
                      value={form.rooms}
                      onChange={(e) => set("rooms", e.target.value)}
                    />
                  </Field>
                  <Field label={t.postListing.floor} htmlFor="f-floor">
                    <Input
                      id="f-floor"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={form.floor}
                      onChange={(e) => set("floor", e.target.value)}
                    />
                  </Field>
                  <Field label={t.postListing.totalFloors} htmlFor="f-floors">
                    <Input
                      id="f-floors"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={form.totalFloors}
                      onChange={(e) => set("totalFloors", e.target.value)}
                    />
                  </Field>
                  <Field label={t.postListing.yearBuilt} htmlFor="f-year">
                    <Input
                      id="f-year"
                      type="number"
                      inputMode="numeric"
                      min={1800}
                      max={new Date().getFullYear() + 3}
                      value={form.yearBuilt}
                      onChange={(e) => set("yearBuilt", e.target.value)}
                    />
                  </Field>
                </div>
                <Field label={t.postListing.description} htmlFor="f-desc">
                  <Textarea
                    id="f-desc"
                    rows={6}
                    maxLength={5000}
                    value={form.description}
                    placeholder={t.postListing.descriptionPlaceholder}
                    onChange={(e) => set("description", e.target.value)}
                  />
                  <p className="tnum mt-1 text-right text-xs text-muted-foreground">
                    {form.description.trim().length} / 5000
                  </p>
                </Field>
                <Field label={t.postListing.amenities} htmlFor="f-amen">
                  <Input
                    id="f-amen"
                    value={form.amenities}
                    placeholder={t.postListing.amenitiesPlaceholder}
                    onChange={(e) => set("amenities", e.target.value)}
                  />
                </Field>
              </div>
            )}

            {step === 2 && (
              <div>
                <p className="text-sm text-muted-foreground">{t.postListing.photosHint}</p>
                <input
                  ref={fileInput}
                  type="file"
                  accept={ALLOWED.join(",")}
                  multiple
                  className="sr-only"
                  onChange={(e) => {
                    addFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {photos.map((p, i) => {
                    const isCover =
                      p.id === (coverId ?? photos.find((x) => x.status === "done")?.id);
                    return (
                      <figure
                        key={p.id}
                        className={cn(
                          "group relative aspect-square overflow-hidden rounded-lg border-2",
                          isCover ? "border-primary" : "border-transparent",
                        )}
                      >
                        <img
                          src={p.preview}
                          alt={`${i + 1}`}
                          className={cn(
                            "size-full object-cover",
                            p.status !== "done" && "opacity-50",
                          )}
                        />
                        {p.status === "uploading" && (
                          <span className="absolute inset-0 flex items-center justify-center bg-white/60 text-xs font-semibold">
                            {t.postListing.uploading}
                          </span>
                        )}
                        {p.status === "error" && (
                          <span className="absolute inset-0 flex items-center justify-center bg-destructive/20 text-xs font-semibold text-destructive">
                            {t.postListing.uploadFailed}
                          </span>
                        )}
                        {isCover && (
                          <span className="pill-on-media absolute top-2 left-2 bg-primary text-primary-foreground">
                            <Star className="size-3" /> {t.postListing.cover}
                          </span>
                        )}
                        <div className="absolute right-2 bottom-2 flex gap-1">
                          {p.status === "done" && !isCover && (
                            <button
                              type="button"
                              className="media-action size-8"
                              aria-label={t.postListing.makeCover}
                              onClick={() => setCoverId(p.id)}
                            >
                              <Star className="size-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            className="media-action size-8"
                            aria-label={t.common.delete}
                            onClick={() => setPhotos((list) => list.filter((x) => x.id !== p.id))}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </figure>
                    );
                  })}
                  {photos.length < MAX_PHOTOS && (
                    <button
                      type="button"
                      onClick={() => fileInput.current?.click()}
                      className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border-strong text-sm font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      <ImagePlus className="size-6" />
                      {t.postListing.addPhotos}
                    </button>
                  )}
                </div>
                {!stepValid[2] && photos.length === 0 && (
                  <p className="mt-3 text-sm text-muted-foreground">{t.postListing.needPhoto}</p>
                )}
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="type-h3">{t.postListing.previewTitle}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t.postListing.previewDesc}</p>
                <dl className="mt-6 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                  <Row k={t.postListing.listingTitle} v={payload.title} />
                  <Row
                    k={t.postListing.dealType}
                    v={form.deal === "sotuv" ? t.deal.buy : t.deal.rent}
                  />
                  <Row
                    k={t.postListing.propertyType}
                    v={typeOptions.find((o) => o.value === form.type)?.label ?? ""}
                  />
                  <Row
                    k={t.postListing.price}
                    v={`${payload.price.toLocaleString("en-US")} ${payload.currency}`}
                  />
                  <Row k={t.postListing.city} v={`${payload.city}, ${payload.district}`} />
                  <Row k={t.postListing.address} v={payload.address} />
                  <Row k={t.postListing.area} v={`${payload.totalArea} m²`} />
                  <Row k={t.postListing.rooms} v={payload.rooms ?? "—"} />
                  <Row
                    k={t.postListing.floor}
                    v={
                      payload.floor !== undefined
                        ? `${payload.floor}/${payload.totalFloors ?? "—"}`
                        : "—"
                    }
                  />
                  <Row k={t.postListing.yearBuilt} v={payload.yearBuilt ?? "—"} />
                  <Row k={t.postListing.photos} v={payload.images.length} />
                </dl>
                <p className="mt-5 text-sm whitespace-pre-line text-muted-foreground">
                  {payload.description}
                </p>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
              <Button
                type="button"
                variant="ghost"
                disabled={step === 0 || submitting}
                onClick={() => setStep((s) => s - 1)}
              >
                {t.postListing.back}
              </Button>
              {step < 3 ? (
                <Button
                  type="button"
                  disabled={!stepValid[step]}
                  onClick={() => setStep((s) => s + 1)}
                >
                  {t.postListing.next}
                </Button>
              ) : (
                <Button type="button" size="lg" loading={submitting} onClick={submit}>
                  <Check /> {t.postListing.publish}
                </Button>
              )}
            </div>
          </section>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link to="/dashboard" className="underline-offset-4 hover:underline">
              {t.dashboard.myListings}
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string | number }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-1.5">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right font-medium">{v}</dd>
    </div>
  );
}
