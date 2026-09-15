"use client";

import { CalendarClock, MessageSquare, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/i18n";
import { useAuthStore } from "@/lib/auth-store";
import type { Listing } from "@/lib/listing";
import { useCreateLead, useCreateViewing, useRevealContact } from "@/lib/queries";

/**
 * The three ways to reach a seller. The phone is fetched on click (and the
 * click is counted) rather than printed into the page.
 */
export function ContactPanel({ listing, isOwner }: { listing: Listing; isOwner: boolean }) {
  const { t } = useTranslation();
  const reveal = useRevealContact();
  const [dialog, setDialog] = useState<"lead" | "viewing" | null>(null);

  const contact = reveal.data?.contact;

  if (isOwner) {
    return (
      <p className="rounded-lg bg-secondary px-4 py-3 text-sm text-muted-foreground">
        {t.property.ownListing}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="border-t border-border pt-4">
        <p className="text-xs text-muted-foreground uppercase tracking-[0.12em]">
          {t.property.owner}
        </p>
        <p className="mt-1 font-semibold">{contact?.name ?? listing.owner?.name ?? "—"}</p>
      </div>

      {contact ? (
        contact.phone ? (
          <Button variant="hero" size="lg" className="w-full" asChild>
            <a href={`tel:${contact.phone}`}>
              <Phone /> <span className="tnum">{contact.phone}</span>
            </a>
          </Button>
        ) : (
          <p className="rounded-lg bg-secondary px-4 py-3 text-sm text-muted-foreground">
            {t.property.noPhone}
          </p>
        )
      ) : (
        <Button
          variant="hero"
          size="lg"
          className="w-full"
          loading={reveal.isPending}
          onClick={() =>
            reveal.mutate(listing.id, {
              onError: (e) => toast.error(e instanceof Error ? e.message : t.common.error),
            })
          }
        >
          <Phone /> {t.property.showPhone}
        </Button>
      )}

      <Button variant="outline" className="w-full" onClick={() => setDialog("lead")}>
        <MessageSquare /> {t.property.requestLead}
      </Button>
      <Button variant="outline" className="w-full" onClick={() => setDialog("viewing")}>
        <CalendarClock /> {t.property.requestViewing}
      </Button>

      <RequestDialog kind={dialog} listing={listing} onClose={() => setDialog(null)} />
    </div>
  );
}

function RequestDialog({
  kind,
  listing,
  onClose,
}: {
  kind: "lead" | "viewing" | null;
  listing: Listing;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const lead = useCreateLead();
  const viewing = useCreateViewing();

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [message, setMessage] = useState("");
  const [preferredAt, setPreferredAt] = useState(defaultSlot());

  const pending = lead.isPending || viewing.isPending;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (kind === "lead") {
        await lead.mutateAsync({
          propertyId: listing.id,
          name,
          phone,
          message: message || undefined,
        });
        toast.success(t.property.leadSent);
      } else {
        await viewing.mutateAsync({
          propertyId: listing.id,
          name,
          phone,
          preferredAt: new Date(preferredAt).toISOString(),
          message: message || undefined,
        });
        toast.success(t.property.viewingSent);
      }
      setMessage("");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.common.error);
    }
  };

  return (
    <Dialog open={kind !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {kind === "lead" ? t.property.leadTitle : t.property.viewingTitle}
          </DialogTitle>
          <DialogDescription>
            {kind === "lead" ? t.property.leadDesc : t.property.viewingDesc}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="rq-name">{t.property.yourName}</Label>
            <Input
              id="rq-name"
              required
              minLength={2}
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rq-phone">{t.property.yourPhone}</Label>
            <Input
              id="rq-phone"
              type="tel"
              required
              inputMode="tel"
              placeholder="+998 90 123 45 67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          {kind === "viewing" && (
            <div className="space-y-1.5">
              <Label htmlFor="rq-time">{t.property.preferredTime}</Label>
              <Input
                id="rq-time"
                type="datetime-local"
                required
                min={defaultSlot()}
                value={preferredAt}
                onChange={(e) => setPreferredAt(e.target.value)}
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="rq-msg">
              {t.property.yourMessage}{" "}
              <span className="text-muted-foreground">({t.common.optional})</span>
            </Label>
            <Textarea
              id="rq-msg"
              rows={3}
              maxLength={1000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" size="lg" loading={pending}>
            {t.common.submit}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Tomorrow at 11:00, formatted for datetime-local. */
function defaultSlot() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(11, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
