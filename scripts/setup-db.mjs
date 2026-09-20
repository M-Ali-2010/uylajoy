#!/usr/bin/env node
/**
 * One-shot production setup: apply migrations, then (optionally) create or
 * promote the first admin. Safe to re-run.
 *
 *   DATABASE_URL=postgres://… node scripts/setup-db.mjs
 *   DATABASE_URL=… ADMIN_EMAIL=you@site.uz ADMIN_PASSWORD='…' node scripts/setup-db.mjs
 *
 * With ADMIN_EMAIL only: an existing account with that email is promoted.
 * With ADMIN_EMAIL + ADMIN_PASSWORD: the account is created if missing.
 */
import { readdir, readFile } from "node:fs/promises";
import bcrypt from "bcryptjs";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const pooled = /pooler\.supabase\.com|:6543/.test(url);
const sql = postgres(url, {
  max: 1,
  connect_timeout: 15,
  onnotice: () => {},
  ...(pooled ? { prepare: false } : {}),
});

try {
  await sql`select 1`;
  console.log("✓ database reachable");

  // --- migrations (same journal drizzle-kit uses, applied in order) ---------
  await sql`create schema if not exists drizzle`;
  await sql`create table if not exists drizzle.__drizzle_migrations (
    id serial primary key, hash text not null, created_at bigint)`;

  const journal = JSON.parse(
    await readFile(new URL("../drizzle/meta/_journal.json", import.meta.url), "utf8"),
  );
  const applied = new Set(
    (await sql`select hash from drizzle.__drizzle_migrations`).map((r) => r.hash),
  );
  const files = (await readdir(new URL("../drizzle/", import.meta.url))).filter((f) =>
    f.endsWith(".sql"),
  );

  for (const entry of journal.entries) {
    const file = files.find((f) => f.startsWith(entry.tag));
    if (!file) throw new Error(`migration file for ${entry.tag} not found`);
    const text = await readFile(new URL(`../drizzle/${file}`, import.meta.url), "utf8");
    const hash = await hashOf(text);
    if (applied.has(hash)) {
      console.log(`· ${entry.tag} already applied`);
      continue;
    }
    const statements = text
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean);
    await sql.begin(async (tx) => {
      for (const statement of statements) {
        // A savepoint per statement so "already exists" (a schema created by an
        // earlier tool) is skipped without aborting the whole transaction.
        try {
          await tx.savepoint((sp) => sp.unsafe(statement));
        } catch (error) {
          if (!/already exists/i.test(error.message)) throw error;
        }
      }
      await tx`insert into drizzle.__drizzle_migrations (hash, created_at) values (${hash}, ${entry.when})`;
    });
    console.log(`✓ ${entry.tag} applied`);
  }

  // --- first admin ---------------------------------------------------------
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (email) {
    const [existing] = await sql`select id, role from users where email = ${email}`;
    if (existing) {
      if (existing.role !== "admin") {
        await sql`update users set role = 'admin', updated_at = now() where id = ${existing.id}`;
        console.log(`✓ ${email} promoted to admin`);
      } else console.log(`· ${email} is already admin`);
    } else if (process.env.ADMIN_PASSWORD) {
      const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
      await sql`insert into users (email, password_hash, name, role, is_verified, is_active)
        values (${email}, ${hash}, ${process.env.ADMIN_NAME ?? "Admin"}, 'admin', true, true)`;
      console.log(`✓ admin ${email} created`);
    } else {
      console.log(
        `! ${email} does not exist yet — register on the site, or pass ADMIN_PASSWORD to create it here`,
      );
    }
  }

  const [{ n }] = await sql`select count(*)::int as n from properties`;
  console.log(`done — ${n} listings in the database`);
} finally {
  await sql.end();
}

async function hashOf(text) {
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(text).digest("hex");
}
