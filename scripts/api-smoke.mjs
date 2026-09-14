#!/usr/bin/env node
/**
 * End-to-end smoke test for the UyJoy API.
 *
 *   BASE_URL=http://localhost:8080 DATABASE_URL=postgres://... node scripts/api-smoke.mjs
 *
 * Exercises the critical business flow the ТЗ's Definition of Done names:
 * register → login → create listing → moderation → publish → lead → favourite,
 * plus the authorization holes the audit found (self-publish, self-admin,
 * draft leakage, private phone in public payload, blocked-user sessions).
 *
 * Needs a database: it promotes one test user to admin via SQL, because that
 * must never be possible through the API.
 */
import postgres from "postgres";

const BASE = process.env.BASE_URL ?? "http://localhost:8080";
const sql = postgres(process.env.DATABASE_URL, { max: 1 });

let failures = 0;
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "  ok " : " FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
  if (!ok) failures++;
};

async function api(method, path, { body, token, ip } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip ?? runIp,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* non-json */
  }
  return { status: res.status, json };
}

const stamp = Date.now();
// Each run pretends to be a fresh client address so the per-IP limiters
// (which key on x-forwarded-for, the header Vercel sets) don't trip on re-runs.
const runIp = `10.${(stamp >> 16) & 255}.${(stamp >> 8) & 255}.${stamp & 255}`;
const owner = { email: `owner-${stamp}@test.uyjoy`, password: "Passw0rd!", name: "Owner Test" };
const buyer = { email: `buyer-${stamp}@test.uyjoy`, password: "Passw0rd!", name: "Buyer Test" };
const admin = { email: `admin-${stamp}@test.uyjoy`, password: "Passw0rd!", name: "Admin Test" };

const listing = {
  title: "Smoke test kvartira Yunusobod",
  description: "Avtomatik test uchun yaratilgan e'lon. O'chirib tashlash mumkin.",
  type: "apartment",
  dealType: "sale",
  price: 96000,
  currency: "USD",
  city: "Toshkent",
  district: "Yunusobod",
  address: "Amir Temur 108",
  rooms: 3,
  totalArea: 86,
  floor: 7,
  totalFloors: 12,
  yearBuilt: 2022,
};

try {
  console.log(`\nAPI smoke @ ${BASE}\n`);

  // --- auth -------------------------------------------------------------
  let r = await api("POST", "/api/auth/register", { body: { ...admin, role: "admin" } });
  check(
    "register cannot self-assign admin",
    r.status === 400 || r.json?.user?.role !== "admin",
    `role=${r.json?.user?.role ?? "rejected"}`,
  );

  r = await api("POST", "/api/auth/register", { body: owner });
  check("register owner", r.status === 201 && r.json?.token, `status ${r.status}`);
  const ownerToken = r.json?.token;
  const ownerId = r.json?.user?.id;

  r = await api("POST", "/api/auth/register", { body: buyer });
  const buyerToken = r.json?.token;
  check("register buyer", r.status === 201 && buyerToken);

  r = await api("POST", "/api/auth/register", { body: admin });
  const adminToken = r.json?.token;
  await sql`update users set role = 'admin' where email = ${admin.email}`;
  r = await api("GET", "/api/auth/me", { token: adminToken });
  check("admin promoted via SQL, session reflects role", r.json?.user?.role === "admin");

  r = await api("POST", "/api/auth/login", { body: { email: owner.email, password: "wrong" } });
  check(
    "login rejects wrong password with a generic message",
    r.status === 401 && !/select|from|query/i.test(r.json?.error ?? ""),
    r.json?.error,
  );

  // --- listing lifecycle --------------------------------------------------
  r = await api("POST", "/api/properties", { body: listing });
  check("create listing requires auth", r.status === 401);

  r = await api("POST", "/api/properties", { body: listing, token: ownerToken });
  check(
    "owner creates listing (pending moderation)",
    r.status === 201 && r.json?.property?.status === "pending",
    `status ${r.status} / ${r.json?.property?.status}`,
  );
  const propertyId = r.json?.property?.id;

  r = await api("GET", "/api/properties");
  check(
    "public list hides pending listing",
    !(r.json?.properties ?? []).some((p) => p.id === propertyId),
  );

  r = await api("GET", "/api/properties?status=pending");
  check(
    "public list cannot request status=pending",
    !(r.json?.properties ?? []).some((p) => p.id === propertyId),
    `status ${r.status}`,
  );

  r = await api("GET", `/api/properties/${propertyId}`);
  check(
    "anonymous cannot read a pending listing by id",
    r.status === 404 || r.status === 403,
    `status ${r.status}`,
  );

  r = await api("GET", `/api/properties/${propertyId}`, { token: ownerToken });
  check("owner can read own pending listing", r.status === 200);

  r = await api("PATCH", `/api/properties/${propertyId}`, {
    body: { status: "active" },
    token: ownerToken,
  });
  check(
    "owner cannot self-publish (status=active)",
    r.status === 400 || r.json?.property?.status !== "active",
    `status ${r.status} / ${r.json?.property?.status}`,
  );

  r = await api("PATCH", `/api/properties/${propertyId}`, {
    body: { price: 1 },
    token: buyerToken,
  });
  check(
    "another user cannot edit the listing (IDOR)",
    r.status === 403 || r.status === 404,
    `status ${r.status}`,
  );

  r = await api("POST", "/api/admin/properties", {
    body: { propertyId, action: "approve" },
    token: ownerToken,
  });
  check("non-admin cannot approve", r.status === 403);

  r = await api("POST", "/api/admin/properties", {
    body: { propertyId, action: "approve" },
    token: adminToken,
  });
  check("admin approves", r.status === 200, `status ${r.status} ${r.json?.error ?? ""}`);

  r = await api("GET", `/api/properties/${propertyId}`);
  check("published listing is public", r.status === 200 && r.json?.property?.status === "active");
  check(
    "public payload does not expose owner phone",
    r.json?.property?.owner?.phone === undefined,
    `owner keys: ${Object.keys(r.json?.property?.owner ?? {}).join(",")}`,
  );

  r = await api("PATCH", `/api/properties/${propertyId}`, {
    body: { price: 99000 },
    token: ownerToken,
  });
  check(
    "editing a published listing sends it back to moderation",
    r.status === 200 && r.json?.property?.status === "pending",
    `status ${r.json?.property?.status}`,
  );
  await api("POST", "/api/admin/properties", {
    body: { propertyId, action: "approve" },
    token: adminToken,
  });

  r = await api("GET", "/api/properties?limit=100000");
  check(
    "list limit is capped",
    (r.json?.pagination?.limit ?? 0) <= 50,
    `limit ${r.json?.pagination?.limit}`,
  );

  r = await api("GET", "/api/properties?search=YUNUSOBOD");
  check(
    "search is case-insensitive",
    (r.json?.properties ?? []).some((p) => p.id === propertyId),
  );

  // --- leads & favourites -------------------------------------------------
  r = await api("POST", "/api/leads", {
    body: { propertyId, name: "Buyer", phone: "+998901234567", message: "Hi" },
    token: buyerToken,
  });
  check("buyer sends a lead", r.status === 201, `status ${r.status} ${r.json?.error ?? ""}`);

  r = await api("GET", "/api/leads", { token: ownerToken });
  check("owner sees the lead", (r.json?.leads ?? []).length >= 1, `count ${r.json?.leads?.length}`);

  r = await api("GET", "/api/leads", { token: buyerToken });
  check(
    "buyer does not see owner's leads",
    (r.json?.leads ?? []).length === 0,
    `count ${r.json?.leads?.length}`,
  );

  r = await api("POST", "/api/favorites", { body: { propertyId }, token: buyerToken });
  check("buyer favourites the listing", r.status === 201 || r.status === 200, `status ${r.status}`);

  r = await api("GET", "/api/favorites", { token: buyerToken });
  check(
    "favourite persisted",
    (r.json?.favorites ?? []).some((f) => (f.propertyId ?? f.property?.id) === propertyId),
  );

  // --- hardening extras ---------------------------------------------------
  r =
    await sql`select action, admin_id from admin_actions where target_id = ${propertyId}::uuid order by created_at`;
  check(
    "admin actions are logged",
    r.length >= 2 && r.every((a) => a.admin_id),
    `entries: ${r.map((a) => a.action).join(", ")}`,
  );

  r = await api("POST", "/api/leads", {
    body: { propertyId, name: "Buyer", phone: "90 123-45-67" },
    token: buyerToken,
  });
  check(
    "phone is normalised to E.164",
    r.json?.lead?.phone === "+998901234567",
    `phone ${r.json?.lead?.phone}`,
  );

  r = await api("POST", "/api/leads", {
    body: { propertyId, name: "Buyer", phone: "12345" },
    token: buyerToken,
  });
  check("invalid phone is rejected", r.status === 400);

  r = await api("POST", "/api/upload", {
    body: { image: "data:image/svg+xml;base64," + Buffer.from("<svg/>").toString("base64") },
    token: ownerToken,
  });
  check(
    "upload rejects non-allowlisted image type",
    r.status === 400,
    `status ${r.status} ${r.json?.error ?? ""}`,
  );

  r = await api("POST", "/api/upload", {
    body: {
      image: "data:image/png;base64," + Buffer.from("not really a png at all").toString("base64"),
    },
    token: ownerToken,
  });
  check("upload rejects mismatched magic bytes", r.status === 400, `${r.json?.error ?? ""}`);

  r = await api("PATCH", "/api/auth/me", { body: { role: "admin" }, token: buyerToken });
  check("profile update cannot change role", r.status === 400, `status ${r.status}`);

  let last;
  for (let i = 0; i < 11; i++) {
    last = await api("POST", "/api/auth/login", {
      body: { email: `nobody-${stamp}@test.uyjoy`, password: "x" },
      ip: `10.99.${(stamp >> 8) & 255}.${stamp & 255}`,
    });
  }
  check("login is rate limited", last.status === 429, `status ${last.status}`);

  // --- blocked user -------------------------------------------------------
  await sql`update users set is_active = false where email = ${buyer.email}`;
  r = await api("GET", "/api/auth/me", { token: buyerToken });
  check("blocked user loses access immediately", r.status === 401, `status ${r.status}`);

  // --- archive & cleanup --------------------------------------------------
  r = await api("PATCH", `/api/properties/${propertyId}`, {
    body: { status: "archived" },
    token: ownerToken,
  });
  check(
    "owner archives own listing",
    r.status === 200 && r.json?.property?.status === "archived",
    `status ${r.json?.property?.status}`,
  );

  r = await api("DELETE", `/api/properties/${propertyId}`, { token: ownerToken });
  check("owner deletes own listing", r.status === 200);
} catch (error) {
  failures++;
  console.error("\nUnhandled:", error);
} finally {
  await sql`delete from users where email like ${"%@test.uyjoy"}`;
  await sql.end();
}

console.log(`\n${failures === 0 ? "ALL PASSED" : `${failures} FAILED`}\n`);
process.exit(failures === 0 ? 0 : 1);
