#!/usr/bin/env node
/**
 * Development seed — realistic Uzbek listings so the site has something to
 * show on a fresh database. Idempotent: re-running replaces the seed users
 * and everything they own.
 *
 *   DATABASE_URL=postgres://... node scripts/seed.mjs
 *
 * Creates (password for all: Passw0rd!):
 *   admin@uyjoy.local      admin
 *   dilnoza@uyjoy.local    seller — owns most listings
 *   sardor@uyjoy.local     agent
 */
import bcrypt from "bcryptjs";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL, { max: 1 });
const hash = await bcrypt.hash("Passw0rd!", 12);

const users = [
  { email: "admin@uyjoy.local", name: "Admin", role: "admin", phone: "+998712000000" },
  {
    email: "dilnoza@uyjoy.local",
    name: "Dilnoza Karimova",
    role: "seller",
    phone: "+998901234567",
  },
  { email: "sardor@uyjoy.local", name: "Sardor Yusupov", role: "agent", phone: "+998935552109" },
];

const listings = [
  {
    owner: "dilnoza@uyjoy.local",
    title: "Yunusobodda zamonaviy 3 xonali kvartira",
    type: "apartment",
    deal: "sale",
    price: 96000,
    city: "Toshkent",
    district: "Yunusobod",
    address: "Amir Temur ko'chasi 108",
    rooms: 3,
    area: 86,
    floor: 7,
    floors: 12,
    year: 2022,
    image: "/images/prop-1.jpg",
    featured: true,
    description:
      "Yangi binoda evroremont qilingan yorug' kvartira. Panoramali derazalar, alohida oshxona, yopiq hovli va yer osti avtoturargoh mavjud. Metro va maktabga piyoda 5 daqiqa.",
    amenities: ["Evroremont", "Konditsioner", "Yer osti parking", "Lift", "Yopiq hovli"],
  },
  {
    owner: "sardor@uyjoy.local",
    title: "Chilonzorda oilaviy kvartira, yangi qurilish",
    type: "apartment",
    deal: "rent",
    price: 620,
    city: "Toshkent",
    district: "Chilonzor",
    address: "Bunyodkor shoh ko'chasi 45",
    rooms: 2,
    area: 62,
    floor: 4,
    floors: 9,
    year: 2021,
    image: "/images/prop-2.jpg",
    featured: true,
    description:
      "To'liq jihozlangan 2 xonali kvartira uzoq muddatli ijaraga. Yangi mebel, kir yuvish mashinasi, tez internet. Kommunal to'lovlar alohida.",
    amenities: ["Jihozlangan", "Wi-Fi", "Kir yuvish mashinasi", "Bolalar maydonchasi"],
  },
  {
    owner: "dilnoza@uyjoy.local",
    title: "Samarqandda bog'li 5 xonali hovli",
    type: "house",
    deal: "sale",
    price: 145000,
    city: "Samarqand",
    district: "Registon",
    address: "Registon ko'chasi 12",
    rooms: 5,
    area: 240,
    floor: 2,
    floors: 2,
    year: 2019,
    image: "/images/prop-3.jpg",
    featured: true,
    description:
      "6 sotix yerda joylashgan ikki qavatli hovli. Uzumzor, garaj, alohida mehmonxona. Tarixiy markazga 10 daqiqa.",
    amenities: ["6 sotix yer", "Garaj", "Uzumzor", "Qudduq suvi", "Alohida kirish"],
  },
  {
    owner: "sardor@uyjoy.local",
    title: "Biznes markazda A-klass ofis",
    type: "office",
    deal: "rent",
    price: 2400,
    city: "Toshkent",
    district: "Mirzo Ulug'bek",
    address: "Mustaqillik shoh ko'chasi 75",
    rooms: 6,
    area: 180,
    floor: 14,
    floors: 22,
    year: 2023,
    image: "/images/prop-4.jpg",
    description:
      "Panoramali oynali zamonaviy ofis maydoni. Resepshn, majlislar xonasi, 24/7 xavfsizlik va parking.",
    amenities: ["A-klass", "Majlislar xonasi", "24/7 xavfsizlik", "Parking", "Generator"],
  },
  {
    owner: "dilnoza@uyjoy.local",
    title: "Buxoro markazida 2 xonali kvartira",
    type: "apartment",
    deal: "sale",
    price: 43000,
    city: "Buxoro",
    district: "Markaz",
    address: "Bahouddin Naqshband ko'chasi 8",
    rooms: 2,
    area: 54,
    floor: 3,
    floors: 5,
    year: 2005,
    image: "/images/prop-1.jpg",
    description:
      "Shahar markazidagi ixcham kvartira. Yaqinda ta'mirlangan, barcha infratuzilma yaqin.",
    amenities: ["Ta'mirlangan", "Markazda", "Balkon"],
  },
  {
    owner: "dilnoza@uyjoy.local",
    title: "Andijonda yangi qurilgan hovli",
    type: "house",
    deal: "sale",
    price: 78000,
    city: "Andijon",
    district: "Bog'ishamol",
    address: "Bog'ishamol MFY",
    rooms: 4,
    area: 160,
    floor: 1,
    floors: 1,
    year: 2024,
    image: "/images/prop-3.jpg",
    description: "Yangi qurilgan, hech kim yashamagan hovli. 4 sotix yer, keng hovli va garaj.",
    amenities: ["Yangi qurilish", "4 sotix", "Garaj", "Issiqxona"],
  },
  {
    owner: "sardor@uyjoy.local",
    title: "Sergeli tumanida arzon 1 xonali kvartira",
    type: "apartment",
    deal: "sale",
    price: 38500,
    city: "Toshkent",
    district: "Sergeli",
    address: "Yangi Sergeli 4-kvartal",
    rooms: 1,
    area: 38,
    floor: 2,
    floors: 9,
    year: 2020,
    image: "/images/prop-2.jpg",
    description: "Yosh oila uchun ideal variant. Ipoteka rasmiylashtirish imkoniyati mavjud.",
    amenities: ["Ipoteka mumkin", "Yangi bino", "Lift"],
  },
  {
    owner: "dilnoza@uyjoy.local",
    title: "Farg'onada tijorat uchun yer uchastkasi",
    type: "land",
    deal: "sale",
    price: 52000,
    city: "Farg'ona",
    district: "Markaziy trassa",
    address: "Farg'ona-Marg'ilon yo'li 4-km",
    rooms: 0,
    area: 800,
    floor: null,
    floors: null,
    year: null,
    image: "/images/prop-4.jpg",
    description: "Trassa bo'yida 8 sotix tijorat yeri. Kadastr hujjatlari tayyor.",
    amenities: ["Trassa bo'yida", "Kadastr tayyor", "Elektr va gaz"],
  },
  {
    owner: "sardor@uyjoy.local",
    title: "Namanganda ijaraga 3 xonali kvartira",
    type: "apartment",
    deal: "rent",
    price: 350,
    city: "Namangan",
    district: "Markaz",
    address: "Alisher Navoiy ko'chasi 21",
    rooms: 3,
    area: 74,
    floor: 5,
    floors: 9,
    year: 2015,
    image: "/images/prop-1.jpg",
    status: "pending",
    description:
      "Markazda joylashgan keng 3 xonali kvartira. Mebel bilan, uzoq muddatga. Maktab va bozor yaqin.",
    amenities: ["Mebel", "Konditsioner", "Lift"],
  },
];

try {
  await sql`delete from users where email like ${"%@uyjoy.local"}`;

  const ids = {};
  for (const u of users) {
    const [row] = await sql`
      insert into users (email, password_hash, name, phone, role, is_verified, is_active)
      values (${u.email}, ${hash}, ${u.name}, ${u.phone}, ${u.role}, true, true)
      returning id`;
    ids[u.email] = row.id;
    if (u.role === "agent")
      await sql`insert into agents (user_id, bio) values (${row.id}, ${"Toshkent bo'yicha 6 yillik tajriba"})`;
  }
  const [agent] = await sql`select id from agents where user_id = ${ids["sardor@uyjoy.local"]}`;

  for (const l of listings) {
    const status = l.status ?? "active";
    const [p] = await sql`
      insert into properties (title, description, type, deal_type, price, currency, city, district, address,
        rooms, total_area, floor, total_floors, year_built, amenities, status, owner_id, agent_id,
        is_featured, view_count, published_at, created_at)
      values (${l.title}, ${l.description}, ${l.type}, ${l.deal}, ${l.price}, 'USD', ${l.city}, ${l.district}, ${l.address},
        ${l.rooms}, ${l.area}, ${l.floor}, ${l.floors}, ${l.year}, ${sql.json(l.amenities)}, ${status},
        ${ids[l.owner]}, ${l.owner === "sardor@uyjoy.local" ? agent.id : null},
        ${Boolean(l.featured)}, ${Math.floor(Math.random() * 400) + 20},
        ${status === "active" ? new Date() : null},
        ${new Date(Date.now() - Math.floor(Math.random() * 20) * 86400000)})
      returning id`;
    await sql`insert into property_images (property_id, url, "order", is_cover) values (${p.id}, ${l.image}, 0, true)`;
  }

  const [c] = await sql`select count(*)::int as n from properties`;
  console.log(`Seeded ${users.length} users and ${c.n} listings. Password for all: Passw0rd!`);
} finally {
  await sql.end();
}
