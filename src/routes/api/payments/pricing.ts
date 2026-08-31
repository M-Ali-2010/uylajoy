import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { PRICING } from "@/lib/server/payments";

export const APIRoute = createAPIFileRoute("/api/payments/pricing")({
  GET: async () => {
    return json({
      success: true,
      pricing: {
        featured: {
          "7days": { amount: PRICING.featured["7days"] / 100, currency: "UZS", label: "7 kun" },
          "14days": { amount: PRICING.featured["14days"] / 100, currency: "UZS", label: "14 kun" },
          "30days": { amount: PRICING.featured["30days"] / 100, currency: "UZS", label: "30 kun" },
        },
        premium: {
          "7days": { amount: PRICING.premium["7days"] / 100, currency: "UZS", label: "7 kun" },
          "14days": { amount: PRICING.premium["14days"] / 100, currency: "UZS", label: "14 kun" },
          "30days": { amount: PRICING.premium["30days"] / 100, currency: "UZS", label: "30 kun" },
        },
        boost: {
          single: { amount: PRICING.boost.single / 100, currency: "UZS", label: "1 marta" },
        },
      },
      benefits: {
        featured: [
          "Bosh sahifada ko'rsatiladi",
          "Qidiruv natijalarida yuqorida chiqadi",
          "Maxsus belgi bilan ajratiladi",
        ],
        premium: [
          "Premium dizayn",
          "Bosh sahifada katta ko'rinish",
          "Barcha afzalliklar + VIP qo'llab-quvvatlash",
        ],
        boost: [
          "E'lon yangi e'lonlar orasiga ko'tariladi",
          "Ko'rishlar soni oshadi",
        ],
      },
    });
  },
});
