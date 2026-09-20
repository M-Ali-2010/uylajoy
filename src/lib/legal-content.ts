import type { Language } from "@/i18n";

export interface LegalDoc {
  title: string;
  updated: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
}

/** Terms of use and privacy policy — short, honest, in the reader's language. */
export const legal: Record<"terms" | "privacy", Record<Language, LegalDoc>> = {
  terms: {
    uz: {
      title: "Foydalanish shartlari",
      updated: "2026-09-20",
      intro:
        "UyJoy.uz — O'zbekistonda ko'chmas mulk e'lonlarini joylash va qidirish platformasi. Saytdan foydalanib, siz quyidagi shartlarga rozilik bildirasiz.",
      sections: [
        {
          heading: "1. Hisob",
          body: [
            "Ro'yxatdan o'tishda to'g'ri ma'lumot kiritasiz va parolingizni sir saqlaysiz.",
            "Hisob orqali qilingan barcha harakatlar uchun siz javobgarsiz.",
            "Qoidalarni buzgan hisob ogohlantirishsiz bloklanishi mumkin.",
          ],
        },
        {
          heading: "2. E'lonlar",
          body: [
            "Faqat haqiqiy, sizga tegishli yoki vakolat berilgan mulk haqida e'lon joylash mumkin.",
            "Narx, maydon, manzil va rasmlar haqiqatga mos bo'lishi shart. Har bir e'lon moderatsiyadan o'tadi; rad etish sababi kabinetda ko'rsatiladi.",
            "Nashr qilingan e'lonni tahrirlash uni qayta moderatsiyaga yuboradi.",
            "Takroriy, soxta yoki chalg'ituvchi e'lonlar o'chiriladi.",
          ],
        },
        {
          heading: "3. Platformaning roli",
          body: [
            "UyJoy.uz bitim tarafi emas: biz sotuvchi va xaridorni bog'laymiz, lekin mulk holati, hujjatlar va to'lovlar uchun javob bermaymiz.",
            "Bitimdan oldin mulkni va hujjatlarni mustaqil tekshiring.",
          ],
        },
        {
          heading: "4. Kontakt ma'lumotlari",
          body: [
            "Boshqa foydalanuvchilarning telefon raqamlaridan faqat e'lon bo'yicha bog'lanish uchun foydalaning. Spam va ommaviy yig'ish taqiqlanadi.",
          ],
        },
        {
          heading: "5. Shartlarning o'zgarishi",
          body: [
            "Biz shartlarni yangilashimiz mumkin; yangilangan sana shu sahifada ko'rsatiladi. Savollar: salom@uyjoy.uz.",
          ],
        },
      ],
    },
    ru: {
      title: "Условия использования",
      updated: "2026-09-20",
      intro:
        "UyJoy.uz — платформа для размещения и поиска объявлений о недвижимости в Узбекистане. Пользуясь сайтом, вы соглашаетесь с этими условиями.",
      sections: [
        {
          heading: "1. Аккаунт",
          body: [
            "При регистрации вы указываете достоверные данные и храните пароль в тайне.",
            "Вы отвечаете за все действия, совершённые через ваш аккаунт.",
            "Аккаунт, нарушающий правила, может быть заблокирован без предупреждения.",
          ],
        },
        {
          heading: "2. Объявления",
          body: [
            "Размещать можно только реальные объекты, которыми вы владеете или на которые имеете полномочия.",
            "Цена, площадь, адрес и фотографии должны соответствовать действительности. Каждое объявление проходит модерацию; причина отклонения видна в кабинете.",
            "Редактирование опубликованного объявления отправляет его на повторную модерацию.",
            "Дубликаты, фейковые и вводящие в заблуждение объявления удаляются.",
          ],
        },
        {
          heading: "3. Роль платформы",
          body: [
            "UyJoy.uz не является стороной сделки: мы связываем продавца и покупателя, но не отвечаем за состояние объекта, документы и расчёты.",
            "Перед сделкой самостоятельно проверяйте объект и документы.",
          ],
        },
        {
          heading: "4. Контактные данные",
          body: [
            "Телефоны других пользователей можно использовать только для связи по объявлению. Спам и массовый сбор контактов запрещены.",
          ],
        },
        {
          heading: "5. Изменение условий",
          body: [
            "Мы можем обновлять условия; дата обновления указана на этой странице. Вопросы: salom@uyjoy.uz.",
          ],
        },
      ],
    },
    en: {
      title: "Terms of Use",
      updated: "2026-09-20",
      intro:
        "UyJoy.uz is a platform for posting and searching real-estate listings in Uzbekistan. By using the site you agree to these terms.",
      sections: [
        {
          heading: "1. Your account",
          body: [
            "You provide accurate details when registering and keep your password private.",
            "You are responsible for everything done through your account.",
            "An account that breaks the rules may be blocked without notice.",
          ],
        },
        {
          heading: "2. Listings",
          body: [
            "Only real properties you own or are authorised to represent may be listed.",
            "Price, area, address and photos must be accurate. Every listing is moderated; a rejection reason is shown in your dashboard.",
            "Editing a published listing sends it back to moderation.",
            "Duplicate, fake or misleading listings are removed.",
          ],
        },
        {
          heading: "3. The platform's role",
          body: [
            "UyJoy.uz is not a party to any transaction: we connect sellers and buyers but are not responsible for the property, documents or payments.",
            "Verify the property and its paperwork independently before any deal.",
          ],
        },
        {
          heading: "4. Contact details",
          body: [
            "Other users' phone numbers may be used only to discuss the listing. Spam and bulk collection are prohibited.",
          ],
        },
        {
          heading: "5. Changes",
          body: [
            "We may update these terms; the date above shows the latest revision. Questions: salom@uyjoy.uz.",
          ],
        },
      ],
    },
  },
  privacy: {
    uz: {
      title: "Maxfiylik siyosati",
      updated: "2026-09-20",
      intro:
        "Bu sahifa UyJoy.uz qanday shaxsiy ma'lumotlarni saqlashi va ulardan qanday foydalanishini tushuntiradi.",
      sections: [
        {
          heading: "Nimani saqlaymiz",
          body: [
            "Hisob: ism, email, telefon (ixtiyoriy), parol xeshi (parolning o'zi saqlanmaydi).",
            "E'lonlar: siz kiritgan ma'lumotlar va rasmlar.",
            "So'rovlar: e'lon bo'yicha qoldirgan ism, telefon va xabaringiz — ular faqat e'lon egasiga ko'rsatiladi.",
            "Statistika: ko'rishlar va bosishlar anonim, IP manzil saqlanmaydi (faqat qaytarib bo'lmaydigan xesh).",
          ],
        },
        {
          heading: "Nima uchun",
          body: [
            "Xizmatni ko'rsatish, sizni sotuvchi bilan bog'lash, firibgarlikni oldini olish va platformani yaxshilash uchun.",
          ],
        },
        {
          heading: "Kim ko'radi",
          body: [
            "Telefon raqamingiz e'lon sahifasida ochiq turmaydi — u faqat «Telefonni ko'rsatish» tugmasi bosilganda ko'rsatiladi va har bir ko'rsatish hisoblanadi.",
            "Ma'lumotlarni uchinchi shaxslarga sotmaymiz. Rasmlar Cloudinary xizmatida saqlanadi.",
          ],
        },
        {
          heading: "Sizning huquqlaringiz",
          body: [
            "Kabinetda ma'lumotlarni o'zgartirishingiz, e'lonlarni o'chirishingiz mumkin. Hisobni to'liq o'chirish uchun salom@uyjoy.uz ga yozing.",
          ],
        },
      ],
    },
    ru: {
      title: "Политика конфиденциальности",
      updated: "2026-09-20",
      intro: "Здесь описано, какие персональные данные хранит UyJoy.uz и как они используются.",
      sections: [
        {
          heading: "Что мы храним",
          body: [
            "Аккаунт: имя, email, телефон (необязательно), хеш пароля (сам пароль не хранится).",
            "Объявления: введённые вами данные и фотографии.",
            "Заявки: имя, телефон и сообщение, оставленные по объявлению — их видит только владелец объявления.",
            "Статистика: просмотры и клики анонимны, IP-адрес не сохраняется (только необратимый хеш).",
          ],
        },
        {
          heading: "Зачем",
          body: [
            "Чтобы оказывать услугу, связывать вас с продавцом, предотвращать мошенничество и улучшать платформу.",
          ],
        },
        {
          heading: "Кто видит",
          body: [
            "Ваш телефон не отображается на странице объявления открыто — он показывается только по нажатию «Показать телефон», и каждый показ учитывается.",
            "Мы не продаём данные третьим лицам. Фотографии хранятся в сервисе Cloudinary.",
          ],
        },
        {
          heading: "Ваши права",
          body: [
            "В кабинете можно изменить данные и удалить объявления. Для полного удаления аккаунта напишите на salom@uyjoy.uz.",
          ],
        },
      ],
    },
    en: {
      title: "Privacy Policy",
      updated: "2026-09-20",
      intro: "This page explains what personal data UyJoy.uz stores and how it is used.",
      sections: [
        {
          heading: "What we store",
          body: [
            "Account: name, email, phone (optional), a password hash (never the password itself).",
            "Listings: the details and photos you enter.",
            "Enquiries: the name, phone and message you leave on a listing — visible only to that listing's owner.",
            "Analytics: views and clicks are anonymous; IP addresses are not stored (only an irreversible hash).",
          ],
        },
        {
          heading: "Why",
          body: [
            "To provide the service, connect you with sellers, prevent fraud and improve the platform.",
          ],
        },
        {
          heading: "Who sees it",
          body: [
            "Your phone number is not printed on the listing page — it is shown only when someone presses “Show phone”, and each reveal is counted.",
            "We do not sell data to third parties. Photos are stored with Cloudinary.",
          ],
        },
        {
          heading: "Your rights",
          body: [
            "You can edit your details and delete listings in your dashboard. To delete your account entirely, write to salom@uyjoy.uz.",
          ],
        },
      ],
    },
  },
};
