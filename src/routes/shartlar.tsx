import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/uyjoy/legal-page";

export const Route = createFileRoute("/shartlar")({
  head: () => ({ meta: [{ title: "Foydalanish shartlari — UyJoy.uz" }] }),
  component: () => <LegalPage doc="terms" />,
});
