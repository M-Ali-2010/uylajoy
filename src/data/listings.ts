import prop1 from "@/assets/prop-1.jpg";
import prop2 from "@/assets/prop-2.jpg";
import prop3 from "@/assets/prop-3.jpg";
import prop4 from "@/assets/prop-4.jpg";

export type Deal = "sotuv" | "ijara";
export type PropType = "kvartira" | "hovli" | "ofis" | "yer";

export interface Listing {
  id: string;
  title: string;
  city: string;
  district: string;
  address: string;
  price: number; // USD (sotuv) yoki oyiga (ijara)
  deal: Deal;
  type: PropType;
  rooms: number;
  area: number;
  floor: number;
  floors: number;
  year: number;
  image: string;
  featured?: boolean;
  description: string;
  features: string[];
  agent: { name: string; agency: string; phone: string };
  rating: number;
}

export const cities = [
  "Toshkent",
  "Samarqand",
  "Buxoro",
  "Andijon",
  "Farg'ona",
  "Namangan",
  "Nukus",
] as const;

export const typeLabels: Record<PropType, string> = {
  kvartira: "Kvartira",
  hovli: "Hovli",
  ofis: "Ofis",
  yer: "Yer uchastkasi",
};

export const listings: Listing[] = [
  {
    id: "tsh-101",
    title: "Yunusobodda zamonaviy 3 xonali kvartira",
    city: "Toshkent",
    district: "Yunusobod",
    address: "Amir Temur ko'chasi 108, Yunusobod tumani",
    price: 96000,
    deal: "sotuv",
    type: "kvartira",
    rooms: 3,
    area: 86,
    floor: 7,
    floors: 12,
    year: 2022,
    image: prop1,
    featured: true,
    rating: 4.8,
    description:
      "Yangi binoda evroremont qilingan yorug' kvartira. Panoramali derazalar, alohida oshxona, yopiq hovli va yer osti avtoturargoh mavjud. Metro va maktabga piyoda 5 daqiqa.",
    features: ["Evroremont", "Konditsioner", "Yer osti parking", "Lift", "Yopiq hovli"],
    agent: { name: "Dilnoza Karimova", agency: "UyJoy Premium", phone: "+998 90 123 45 67" },
  },
  {
    id: "tsh-102",
    title: "Chilonzorda oilaviy kvartira, yangi qurilish",
    city: "Toshkent",
    district: "Chilonzor",
    address: "Bunyodkor shoh ko'chasi 45, Chilonzor tumani",
    price: 620,
    deal: "ijara",
    type: "kvartira",
    rooms: 2,
    area: 62,
    floor: 4,
    floors: 9,
    year: 2021,
    image: prop2,
    featured: true,
    rating: 4.6,
    description:
      "To'liq jihozlangan 2 xonali kvartira uzoq muddatli ijaraga. Yangi mebel, kir yuvish mashinasi, tez internet. Kommunal to'lovlar alohida.",
    features: ["Jihozlangan", "Wi-Fi", "Kir yuvish mashinasi", "Bolalar maydonchasi"],
    agent: { name: "Sardor Yusupov", agency: "Toshkent Estate", phone: "+998 93 555 21 09" },
  },
  {
    id: "smq-201",
    title: "Samarqandda bog'li 5 xonali hovli",
    city: "Samarqand",
    district: "Registon yaqinida",
    address: "Registon ko'chasi 12, Samarqand shahri",
    price: 145000,
    deal: "sotuv",
    type: "hovli",
    rooms: 5,
    area: 240,
    floor: 2,
    floors: 2,
    year: 2019,
    image: prop3,
    featured: true,
    rating: 4.9,
    description:
      "6 sotix yerda joylashgan ikki qavatli hovli. Uzumzor, garaj, alohida mehmonxona. Tarixiy markazga 10 daqiqa.",
    features: ["6 sotix yer", "Garaj", "Uzumzor", "Qudduq suvi", "Alohida kirish"],
    agent: { name: "Jahongir Rasulov", agency: "Registon Realty", phone: "+998 91 700 88 44" },
  },
  {
    id: "tsh-103",
    title: "Biznes markazda A-klass ofis",
    city: "Toshkent",
    district: "Mirzo Ulug'bek",
    address: "Mustaqillik shoh ko'chasi 75, biznes markaz",
    price: 2400,
    deal: "ijara",
    type: "ofis",
    rooms: 6,
    area: 180,
    floor: 14,
    floors: 22,
    year: 2023,
    image: prop4,
    rating: 4.7,
    description:
      "Panoramali oynali zamonaviy ofis maydoni. Resepshn, majlislar xonasi, 24/7 xavfsizlik va parking.",
    features: ["A-klass", "Majlislar xonasi", "24/7 xavfsizlik", "Parking", "Generator"],
    agent: { name: "Nilufar Abdullayeva", agency: "UyJoy Business", phone: "+998 97 313 10 10" },
  },
  {
    id: "bux-301",
    title: "Buxoro markazida 2 xonali kvartira",
    city: "Buxoro",
    district: "Markaz",
    address: "Bahouddin Naqshband ko'chasi 8",
    price: 43000,
    deal: "sotuv",
    type: "kvartira",
    rooms: 2,
    area: 54,
    floor: 3,
    floors: 5,
    year: 2005,
    image: prop1,
    rating: 4.3,
    description:
      "Shahar markazidagi ixcham kvartira. Yaqinda ta'mirlangan, barcha infratuzilma yaqin.",
    features: ["Ta'mirlangan", "Markazda", "Balkon"],
    agent: { name: "Otabek Nazarov", agency: "Buxoro Uy", phone: "+998 90 404 55 66" },
  },
  {
    id: "and-401",
    title: "Andijonda yangi qurilgan hovli",
    city: "Andijon",
    district: "Bog'ishamol",
    address: "Bog'ishamol MFY, Andijon shahri",
    price: 78000,
    deal: "sotuv",
    type: "hovli",
    rooms: 4,
    area: 160,
    floor: 1,
    floors: 1,
    year: 2024,
    image: prop3,
    rating: 4.5,
    description: "Yangi qurilgan, hech kim yashamagan hovli. 4 sotix yer, keng hovli va garaj.",
    features: ["Yangi qurilish", "4 sotix", "Garaj", "Issiqxona"],
    agent: { name: "Muhammad Aliyev", agency: "Vodiy Estate", phone: "+998 94 222 33 11" },
  },
  {
    id: "tsh-104",
    title: "Sergeli tumanida arzon 1 xonali kvartira",
    city: "Toshkent",
    district: "Sergeli",
    address: "Yangi Sergeli 4-kvartal",
    price: 38500,
    deal: "sotuv",
    type: "kvartira",
    rooms: 1,
    area: 38,
    floor: 2,
    floors: 9,
    year: 2020,
    image: prop2,
    rating: 4.2,
    description: "Yosh oila uchun ideal variant. Ipoteka rasmiylashtirish imkoniyati mavjud.",
    features: ["Ipoteka mumkin", "Yangi bino", "Lift"],
    agent: { name: "Shahnoza To'rayeva", agency: "UyJoy Premium", phone: "+998 99 808 12 34" },
  },
  {
    id: "fzr-501",
    title: "Farg'onada tijorat uchun yer uchastkasi",
    city: "Farg'ona",
    district: "Markaziy trassa",
    address: "Farg'ona-Marg'ilon yo'li 4-km",
    price: 52000,
    deal: "sotuv",
    type: "yer",
    rooms: 0,
    area: 800,
    floor: 0,
    floors: 0,
    year: 0,
    image: prop4,
    rating: 4.1,
    description: "Trassa bo'yida 8 sotix tijorat yeri. Kadastr hujjatlari tayyor.",
    features: ["Trassa bo'yida", "Kadastr tayyor", "Elektr va gaz"],
    agent: { name: "Bekzod Isroilov", agency: "Vodiy Estate", phone: "+998 90 611 74 20" },
  },
];

export const formatPrice = (l: Pick<Listing, "price" | "deal">) =>
  l.deal === "ijara"
    ? `$${l.price.toLocaleString("en-US")}/oy`
    : `$${l.price.toLocaleString("en-US")}`;

export const getListing = (id: string) => listings.find((l) => l.id === id);