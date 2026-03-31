import * as dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "../lib/db/schema/index.js";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildSku(productId: string, name: string, color: string, size: string) {
  const base = name.toUpperCase().replace(/\s+/g, "-").replace(/[^A-Z0-9-]/g, "").slice(0, 10);
  const num = productId.replace(/\D/g, "").slice(-2).padStart(2, "0");
  return `${base}-${num}-${color.toUpperCase()}-${size.toUpperCase()}`;
}

// ─── Reference data ───────────────────────────────────────────────────────────

const GENDERS = [
  { label: "Men", slug: "men" },
  { label: "Women", slug: "women" },
  { label: "Unisex", slug: "unisex" },
  { label: "Kids", slug: "kids" },
];

const COLORS = [
  { name: "White", slug: "white", hexCode: "#F5F5F5" },
  { name: "Black", slug: "black", hexCode: "#111111" },
  { name: "Red", slug: "red", hexCode: "#D33918" },
  { name: "Blue", slug: "blue", hexCode: "#0000FF" },
  { name: "Grey", slug: "grey", hexCode: "#808080" },
  { name: "Green", slug: "green", hexCode: "#007D48" },
  { name: "Orange", slug: "orange", hexCode: "#D37918" },
  { name: "Navy", slug: "navy", hexCode: "#001F5B" },
];

const SIZES = [
  { name: "US 5",   slug: "us-5",   sortOrder: 1 },
  { name: "US 5.5", slug: "us-5-5", sortOrder: 2 },
  { name: "US 6",   slug: "us-6",   sortOrder: 3 },
  { name: "US 6.5", slug: "us-6-5", sortOrder: 4 },
  { name: "US 7",   slug: "us-7",   sortOrder: 5 },
  { name: "US 7.5", slug: "us-7-5", sortOrder: 6 },
  { name: "US 8",   slug: "us-8",   sortOrder: 7 },
  { name: "US 8.5", slug: "us-8-5", sortOrder: 8 },
  { name: "US 9",   slug: "us-9",   sortOrder: 9 },
  { name: "US 9.5", slug: "us-9-5", sortOrder: 10 },
  { name: "US 10",  slug: "us-10",  sortOrder: 11 },
  { name: "US 10.5",slug: "us-10-5",sortOrder: 12 },
  { name: "US 11",  slug: "us-11",  sortOrder: 13 },
  { name: "US 11.5",slug: "us-11-5",sortOrder: 14 },
  { name: "US 12",  slug: "us-12",  sortOrder: 15 },
];

const CATEGORIES = [
  { name: "Sneakers",   slug: "sneakers" },
  { name: "Running",    slug: "running" },
  { name: "Basketball", slug: "basketball" },
  { name: "Lifestyle",  slug: "lifestyle" },
  { name: "Training",   slug: "training" },
];

const COLLECTIONS = [
  { name: "Summer 25",         slug: "summer-25" },
  { name: "Air Max Collection", slug: "air-max-collection" },
  { name: "Jordan Legacy",      slug: "jordan-legacy" },
  { name: "Retro Classics",     slug: "retro-classics" },
];

// ─── Products — fixed IDs match mock data (p1–p15) ───────────────────────────
// Colors per product: first color = primary image color
// Images use /shoes/ path (served from public/ by Next.js)

const PRODUCTS = [
  {
    id: "p1",
    name: "Nike Air Max 270",
    description: "The Nike Air Max 270 delivers unrivaled comfort with its large Air unit and breathable mesh upper.",
    category: "sneakers", gender: "men",
    image: "/shoes/shoe-1.jpg",
    price: "150.00",
    colors: ["white", "black", "red"],
  },
  {
    id: "p2",
    name: "Air Jordan 1 Retro High OG",
    description: "The shoe that started it all. Premium leather construction with iconic colorways that defined a generation.",
    category: "basketball", gender: "men",
    image: "/shoes/shoe-2.webp",
    price: "180.00",
    colors: ["black", "red", "white"],
  },
  {
    id: "p3",
    name: "Nike Air Force 1 '07",
    description: "The radiance lives on in the Nike Air Force 1. Durable leather upper with cushioned Air-Sole unit.",
    category: "lifestyle", gender: "unisex",
    image: "/shoes/shoe-3.webp",
    price: "110.00",
    colors: ["white", "black"],
  },
  {
    id: "p4",
    name: "Nike Dunk Low Retro",
    description: "Created for the hardwood but taken to the streets. Classic details and a low-cut silhouette.",
    category: "lifestyle", gender: "unisex",
    image: "/shoes/shoe-4.webp",
    price: "110.00",
    salePrice: "93.50",
    colors: ["green", "white", "navy"],
  },
  {
    id: "p5",
    name: "Nike React Infinity Run FK 3",
    description: "Designed to keep you running. React foam and a wide stable platform reduce injury risk.",
    category: "running", gender: "men",
    image: "/shoes/shoe-5.avif",
    price: "160.00",
    colors: ["blue", "black", "grey"],
  },
  {
    id: "p6",
    name: "Nike Pegasus 40",
    description: "The dependable daily trainer. Air Zoom and React foam deliver a responsive cushioned ride.",
    category: "running", gender: "men",
    image: "/shoes/shoe-6.avif",
    price: "130.00",
    colors: ["orange", "black", "white"],
  },
  {
    id: "p7",
    name: "Nike Air Max 90",
    description: "Iconic waffle outsole and Max Air cushioning. A timeless silhouette blending heritage with comfort.",
    category: "sneakers", gender: "unisex",
    image: "/shoes/shoe-7.avif",
    price: "120.00",
    colors: ["grey", "white", "black"],
  },
  {
    id: "p8",
    name: "Nike Free Run 5.0",
    description: "Flexible and lightweight. Moves with your foot for a natural barefoot-like feel.",
    category: "running", gender: "women",
    image: "/shoes/shoe-8.avif",
    price: "100.00",
    colors: ["white", "grey"],
  },
  {
    id: "p9",
    name: "Nike Blazer Mid '77",
    description: "Vintage basketball style meets everyday wear. Crinkled leather upper with retro Nike branding.",
    category: "lifestyle", gender: "unisex",
    image: "/shoes/shoe-9.avif",
    price: "100.00",
    colors: ["white", "black", "red"],
  },
  {
    id: "p10",
    name: "Nike ZoomX Vaporfly NEXT% 2",
    description: "Race-day performance at its peak. ZoomX foam and a carbon fiber plate propel you forward.",
    category: "running", gender: "men",
    image: "/shoes/shoe-10.avif",
    price: "250.00",
    colors: ["green", "black", "orange"],
  },
  {
    id: "p11",
    name: "Air Jordan 4 Retro",
    description: "Visible Air cushioning and iconic mesh panels. One of the most coveted silhouettes ever.",
    category: "basketball", gender: "men",
    image: "/shoes/shoe-11.avif",
    price: "210.00",
    salePrice: "178.50",
    colors: ["black", "red", "white"],
  },
  {
    id: "p12",
    name: "Nike Metcon 9",
    description: "Built for the gym. Stable heel, flexible forefoot, and durable rubber for training.",
    category: "training", gender: "men",
    image: "/shoes/shoe-12.avif",
    price: "130.00",
    colors: ["black", "grey", "blue"],
  },
  {
    id: "p13",
    name: "Nike Air Max 97",
    description: "Inspired by Japanese bullet trains. Full-length Air cushioning and a futuristic silhouette.",
    category: "sneakers", gender: "unisex",
    image: "/shoes/shoe-13.avif",
    price: "175.00",
    colors: ["grey", "black"],
  },
  {
    id: "p14",
    name: "Nike Revolution 7",
    description: "Lightweight and breathable everyday runner. Foam midsole and rubber outsole for cushioning.",
    category: "running", gender: "women",
    image: "/shoes/shoe-14.avif",
    price: "75.00",
    colors: ["white", "navy", "grey"],
  },
  {
    id: "p15",
    name: "Nike Court Vision Low",
    description: "Basketball-inspired style for the streets. Perforated leather upper with a cupsole.",
    category: "lifestyle", gender: "unisex",
    image: "/shoes/shoe-15.avif",
    price: "70.00",
    colors: ["white", "black", "navy"],
  },
] as const;

// Fixed deterministic UUIDs for each product (stable across re-seeds)
// Generated once and hardcoded so they never change
const PRODUCT_IDS: Record<string, string> = {
  p1:  "00000000-0000-0000-0000-000000000001",
  p2:  "00000000-0000-0000-0000-000000000002",
  p3:  "00000000-0000-0000-0000-000000000003",
  p4:  "00000000-0000-0000-0000-000000000004",
  p5:  "00000000-0000-0000-0000-000000000005",
  p6:  "00000000-0000-0000-0000-000000000006",
  p7:  "00000000-0000-0000-0000-000000000007",
  p8:  "00000000-0000-0000-0000-000000000008",
  p9:  "00000000-0000-0000-0000-000000000009",
  p10: "00000000-0000-0000-0000-000000000010",
  p11: "00000000-0000-0000-0000-000000000011",
  p12: "00000000-0000-0000-0000-000000000012",
  p13: "00000000-0000-0000-0000-000000000013",
  p14: "00000000-0000-0000-0000-000000000014",
  p15: "00000000-0000-0000-0000-000000000015",
};

async function seed() {
  console.log("🌱 Starting seed...\n");

  // ── Wipe all existing products + variants + images ───────────────────────
  console.log("🗑️  Clearing all existing products...");
  await db.delete(schema.productImages);
  await db.delete(schema.productVariants);
  await db.delete(schema.productCollections);
  await db.delete(schema.products);
  console.log("   ✓ Cleared\n");

  // ── Reference data (upsert) ───────────────────────────────────────────────
  console.log("⚙️  Seeding genders...");
  await db.insert(schema.genders).values(GENDERS).onConflictDoNothing();
  const gRows = await db.select().from(schema.genders);
  const genderMap: Record<string, string> = Object.fromEntries(gRows.map((g) => [g.slug, g.id]));
  console.log(`   ✓ ${gRows.length} genders`);

  console.log("⚙️  Seeding colors...");
  await db.insert(schema.colors).values(COLORS).onConflictDoNothing();
  const cRows = await db.select().from(schema.colors);
  const colorMap: Record<string, string> = Object.fromEntries(cRows.map((c) => [c.slug, c.id]));
  console.log(`   ✓ ${cRows.length} colors`);

  console.log("⚙️  Seeding sizes...");
  await db.insert(schema.sizes).values(SIZES).onConflictDoNothing();
  const sRows = await db.select().from(schema.sizes);
  const sizeMap: Record<string, string> = Object.fromEntries(sRows.map((s) => [s.slug, s.id]));
  console.log(`   ✓ ${sRows.length} sizes`);

  console.log("⚙️  Seeding brand...");
  await db.insert(schema.brands).values({ name: "Nike", slug: "nike", logoUrl: "/logo.svg" }).onConflictDoNothing();
  const [nike] = await db.select().from(schema.brands).where(eq(schema.brands.slug, "nike"));
  console.log("   ✓ Nike");

  console.log("⚙️  Seeding categories...");
  await db.insert(schema.categories).values(CATEGORIES).onConflictDoNothing();
  const catRows = await db.select().from(schema.categories);
  const categoryMap: Record<string, string> = Object.fromEntries(catRows.map((c) => [c.slug, c.id]));
  console.log(`   ✓ ${catRows.length} categories`);

  console.log("⚙️  Seeding collections...");
  await db.insert(schema.collections).values(COLLECTIONS).onConflictDoNothing();
  const colRows = await db.select().from(schema.collections);
  const collectionIds = colRows.map((c) => c.id);
  console.log(`   ✓ ${colRows.length} collections`);

  // ── Products ──────────────────────────────────────────────────────────────
  console.log("\n🛍️  Seeding products...\n");

  const allSizeSlugs = SIZES.map((s) => s.slug);

  for (const p of PRODUCTS) {
    const categoryId = categoryMap[p.category];
    const genderId = genderMap[p.gender];

    if (!categoryId || !genderId || !nike) {
      console.warn(`  ⚠️  Skipping ${p.name} — missing FK`);
      continue;
    }

    // Insert product with fixed UUID
    const uuid = PRODUCT_IDS[p.id];
    const [product] = await db
      .insert(schema.products)
      .values({
        id: uuid,
        name: p.name,
        description: p.description,
        categoryId,
        genderId,
        brandId: nike.id,
        isPublished: true,
      })
      .returning();

    let firstVariantId: string | null = null;
    let variantCount = 0;

    // Each color gets all sizes
    for (const colorSlug of p.colors) {
      const colorId = colorMap[colorSlug];
      if (!colorId) continue;

      for (const sizeSlug of allSizeSlugs) {
        const sizeId = sizeMap[sizeSlug];
        if (!sizeId) continue;

        const isOos = ["us-10", "us-10-5", "us-11", "us-11-5", "us-12"].includes(sizeSlug);
        const hasSale = "salePrice" in p && !!p.salePrice;

        const [variant] = await db
          .insert(schema.productVariants)
          .values({
            productId: product.id,
            sku: buildSku(p.id, p.name, colorSlug, sizeSlug),
            price: p.price,
            salePrice: hasSale ? (p as { salePrice: string }).salePrice : null,
            colorId,
            sizeId,
            inStock: isOos ? 0 : Math.floor(Math.random() * 30) + 5,
            weight: parseFloat((Math.random() * 0.5 + 0.3).toFixed(2)),
            dimensions: {
              length: parseFloat((Math.random() * 5 + 10).toFixed(1)),
              width: parseFloat((Math.random() * 3 + 7).toFixed(1)),
              height: parseFloat((Math.random() * 2 + 4).toFixed(1)),
            },
          })
          .returning();

        variantCount++;
        if (!firstVariantId) firstVariantId = variant.id;

        // Primary image for first color only
        if (colorSlug === p.colors[0] && sizeSlug === allSizeSlugs[0]) {
          await db.insert(schema.productImages).values({
            productId: product.id,
            variantId: variant.id,
            url: p.image,
            sortOrder: 0,
            isPrimary: true,
          });
        }
      }
    }

    // Set defaultVariantId
    if (firstVariantId) {
      await db
        .update(schema.products)
        .set({ defaultVariantId: firstVariantId })
        .where(eq(schema.products.id, product.id));
    }

    // Assign to 1–2 collections
    const assigned = collectionIds.slice(0, 2);
    for (const collectionId of assigned) {
      await db
        .insert(schema.productCollections)
        .values({ productId: product.id, collectionId })
        .onConflictDoNothing();
    }

    console.log(`   ✓ [${p.id}] ${p.name} — ${p.colors.length} colors × ${allSizeSlugs.length} sizes = ${variantCount} variants`);
  }

  console.log("\n✅ Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
