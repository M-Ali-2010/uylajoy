import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/uyjoy/legal-page";

export const Route = createFileRoute("/maxfiylik")({
  head: () => ({ meta: [{ title: "Maxfiylik siyosati — UyJoy.uz" }] }),
  component: () => <LegalPage doc="privacy" />,
});
