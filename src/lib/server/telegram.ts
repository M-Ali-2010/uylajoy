// Telegram Bot API integration for notifications

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

interface TelegramMessage {
  chat_id: string | number;
  text: string;
  parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
  disable_web_page_preview?: boolean;
}

interface TelegramPhoto {
  chat_id: string | number;
  photo: string;
  caption?: string;
  parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
}

// Send text message
export async function sendTelegramMessage(chatId: string | number, text: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn("Telegram bot token not configured");
    return false;
  }

  try {
    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      } as TelegramMessage),
    });

    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
    return false;
  }
}

// Send photo with caption
export async function sendTelegramPhoto(
  chatId: string | number,
  photoUrl: string,
  caption?: string
): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn("Telegram bot token not configured");
    return false;
  }

  try {
    const response = await fetch(`${TELEGRAM_API_URL}/sendPhoto`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        photo: photoUrl,
        caption,
        parse_mode: "HTML",
      } as TelegramPhoto),
    });

    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error("Failed to send Telegram photo:", error);
    return false;
  }
}

// Notification templates
export const notificationTemplates = {
  // New property listing notification
  newListing: (property: {
    title: string;
    price: number;
    currency: string;
    city: string;
    rooms: number;
    area: number;
    url: string;
  }) => `
<b>🏠 Yangi e'lon qo'shildi!</b>

<b>${property.title}</b>

💰 Narx: <b>${property.price.toLocaleString()} ${property.currency}</b>
📍 Joylashuv: ${property.city}
🛏 Xonalar: ${property.rooms}
📐 Maydon: ${property.area} m²

<a href="${property.url}">Ko'rish →</a>
`,

  // Property approved notification
  propertyApproved: (property: { title: string; url: string }) => `
<b>✅ E'loningiz tasdiqlandi!</b>

<b>${property.title}</b>

Sizning e'loningiz muvaffaqiyatli tasdiqlandi va endi boshqalar ko'ra oladi.

<a href="${property.url}">Ko'rish →</a>
`,

  // Property rejected notification
  propertyRejected: (property: { title: string; reason: string }) => `
<b>❌ E'loningiz rad etildi</b>

<b>${property.title}</b>

Sabab: ${property.reason}

Iltimos, e'lonni qayta tahrirlang va yuborin.
`,

  // New lead notification
  newLead: (lead: {
    propertyTitle: string;
    name: string;
    phone: string;
    message?: string;
  }) => `
<b>📞 Yangi so'rov!</b>

<b>E'lon:</b> ${lead.propertyTitle}

<b>Mijoz:</b>
👤 ${lead.name}
📱 ${lead.phone}
${lead.message ? `💬 ${lead.message}` : ""}
`,

  // Price drop notification
  priceDrop: (property: {
    title: string;
    oldPrice: number;
    newPrice: number;
    currency: string;
    url: string;
  }) => `
<b>📉 Narx tushdi!</b>

<b>${property.title}</b>

Eski narx: <s>${property.oldPrice.toLocaleString()} ${property.currency}</s>
Yangi narx: <b>${property.newPrice.toLocaleString()} ${property.currency}</b>

Tejamkorlik: ${((property.oldPrice - property.newPrice) / property.oldPrice * 100).toFixed(1)}%

<a href="${property.url}">Ko'rish →</a>
`,

  // Welcome message
  welcome: (name: string) => `
<b>👋 Xush kelibsiz, ${name}!</b>

UyJoy.uz - O'zbekistonning eng yaxshi ko'chmas mulk platformasiga xush kelibsiz!

Biz bilan siz:
✅ Eng yaxshi takliflarni toping
✅ E'lonlaringizni bepul joylashtiring
✅ Ishonchli agentlar bilan ishlang

Savollaringiz bo'lsa, /help buyrug'ini yuboring.
`,

  // New review notification
  newReview: (review: {
    reviewerName: string;
    rating: number;
    text?: string;
    targetName: string;
  }) => `
<b>⭐ Yangi sharh!</b>

${review.targetName} uchun yangi sharh qoldirildi.

<b>Baholash:</b> ${"⭐".repeat(review.rating)}${"☆".repeat(5 - review.rating)}
<b>Muallif:</b> ${review.reviewerName}
${review.text ? `<b>Sharh:</b> ${review.text}` : ""}
`,
};

// Notification sender functions
export async function notifyNewListing(
  adminChatIds: string[],
  property: Parameters<typeof notificationTemplates.newListing>[0]
): Promise<void> {
  const message = notificationTemplates.newListing(property);
  await Promise.all(adminChatIds.map((chatId) => sendTelegramMessage(chatId, message)));
}

export async function notifyPropertyApproved(
  userChatId: string,
  property: Parameters<typeof notificationTemplates.propertyApproved>[0]
): Promise<void> {
  const message = notificationTemplates.propertyApproved(property);
  await sendTelegramMessage(userChatId, message);
}

export async function notifyPropertyRejected(
  userChatId: string,
  property: Parameters<typeof notificationTemplates.propertyRejected>[0]
): Promise<void> {
  const message = notificationTemplates.propertyRejected(property);
  await sendTelegramMessage(userChatId, message);
}

export async function notifyNewLead(
  agentChatId: string,
  lead: Parameters<typeof notificationTemplates.newLead>[0]
): Promise<void> {
  const message = notificationTemplates.newLead(lead);
  await sendTelegramMessage(agentChatId, message);
}

export async function notifyPriceDrop(
  subscriberChatIds: string[],
  property: Parameters<typeof notificationTemplates.priceDrop>[0]
): Promise<void> {
  const message = notificationTemplates.priceDrop(property);
  await Promise.all(subscriberChatIds.map((chatId) => sendTelegramMessage(chatId, message)));
}

export async function sendWelcomeMessage(chatId: string, name: string): Promise<void> {
  const message = notificationTemplates.welcome(name);
  await sendTelegramMessage(chatId, message);
}
