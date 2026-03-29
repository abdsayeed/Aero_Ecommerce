import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "../lib/db/schema/index.js";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

function pickMany<T>(arr: T[], min = 1, max = arr.length): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  return [...arr].sort(() => Math.random() - 0.5).slice(0, count);
}

function buildSku(name: string, color: string, size: string) {
  const base = name.toUpperCase().replace(/\s+/g, "-").replace(/[^A-Z0-9-]/g, "").slice(0, 12);
  return `${base}-${color.toUpperCase()}-${size.toUpperCase()}`;
}

function copyShoeImages(): Record<string, string> {
  const srcDir = path.resolve(process.cwd(), "public/shoes");
  const destDir = path.resolve(process.cwd(), "static/uploads/shoes");
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const urlMap: Record<string, string> = {};
  const files = fs.readdirSync(srcDir).filter((f) => /\.(jpg|webp|avif|png)$/i.test(f));
  for (const file of files) {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
    urlMap[file] = `/static/uploads/shoes/${file}`;
  }
  console.log(`  🖼️  Copied ${files.length} images to static/uploads/shoes`);
  return urlMap;
}

const GENDERS = [
  { label: "Men", slug: "men" },
  { label: "Women", slug: "women" },
  { label: "Unisex", slug: "unisex" },
  { label: "Kids", slug: "kids" },
];

const COLORS = [
  { name: "White", slug: "white", hexCode: "#FFFFFF" },
  { name: "Black", slug: "black", hexCode: "#000000" },
  { name: "Red", slug: "red", hexCode: "#FF0000" },
  { name: "Blue", slug: "blue", hexCode: "#0000FF" },
  { name: "Grey", slug: "grey", hexCode: "#808080" },
  { name: "Green", slug: "green", hexCode: "#008000" },
  { name: "Orange", slug: "orange", hexCode: "#FFA500" },
  { name: "Navy", slug: "navy", hexCode: "#001F5B" },
];

const SIZES = [
  { name: "US 6", slug: "us-6", sortOrder: 1 },
  { name: "US 7", slug: "us-7", sortOrder: 2 },
  { name: "US 8", slug: "us-8", sortOrder: 3 },
  { name: "US 9", slug: "us-9", sortOrder: 4 },
  { name: "US 10", slug: "us-10", sortOrder: 5 },
  { name: "US 11", slug: "us-11", sortOrder: 6 },
  { name: "US 12", slug: "us-12", sortOrder: 7 },
];

const CATEGORIES = [
  { name: "Sneakers", slug: "sneakers" },
  { name: "Running", slug: "running" },
  { name: "Basketball", slug: "basketball" },
  { name: "Lifestyle", slug: "lifestyle" },
  { name: "Training", slug: "training" },
];

const COLLECTIONS = [
  { name: "Summer 25", slug: "summer-25" },
  { name: "Air Max Collection", slug: "air-max-collection" },
  { name: "Jordan Legacy", slug: "jordan-legacy" },
  { name: "Retro Classics", slug: "retro-classics" },
];

const PRODUCTS = [
  { name: "Nike Air Max 270", description: "The Nike Air Max 270 delivers unrivaled comfort with its large Air unit and breathable mesh upper.", category: "sneakers", gender: "men", image: "shoe-1.jpg", price: "150.00" },
  { name: "Air Jordan 1 Retro High OG", description: "The shoe that started it all. Premium leather construction with iconic colorways that defined a generation.", category: "basketball", gender: "men", image: "shoe-2.webp", price: "180.00" },
  { name: "Nike Air Force 1 07", description: "The radiance lives on in the Nike Air Force 1. Durable leather upper with cushioned Air-Sole unit.", category: "lifestyle", gender: "unisex", image: "shoe-3.webp", price: "110.00" },
  { name: "Nike Dunk Low Retro", description: "Created for the hardwood but taken to the streets. Classic details and a low-cut silhouette.", category: "lifestyle", gender: "unisex", image: "shoe-4.webp", price: "110.00" },
  { name: "Nike React Infinity Run FK 3", description: "Designed to keep you running. React foam and a wide stable platform reduce injury risk.", category: "running", gender: "men", image: "shoe-5.avif", price: "160.00" },
  { name: "Nike Pegasus 40", description: "The dependable daily trainer. Air Zoom and React foam deliver a responsive cushioned ride.", category: "running", gender: "men", image: "shoe-6.avif", price: "130.00" },
  { name: "Nike Air Max 90", description: "Iconic waffle outsole and Max Air cushioning. A timeless silhouette blending heritage with comfort.", category: "sneakers", gender: "unisex", image: "shoe-7.avif", price: "120.00" },
  { name: "Nike Free Run 5.0", description: "Flexible and lightweight, the Free Run 5.0 moves with your foot for a natural feel.", category: "running", gender: "women", image: "shoe-8.avif", price: "100.00" },
  { name: "Nike Blazer Mid 77", description: "Vintage basketball style meets everyday wear. Crinkled leather upper with retro Nike branding.", category: "lifestyle", gender: "unisex", image: "shoe-9.avif", price: "100.00" },
  { name: "Nike ZoomX Vaporfly NEXT 2", description: "Race-day performance at its peak. ZoomX foam and a carbon fiber plate propel you forward.", category: "running", gender: "men", image: "shoe-10.avif", price: "250.00" },
  { name: "Air Jordan 4 Retro", description: "Visible Air cushioning and iconic mesh panels. One of the most coveted silhouettes ever.", category: "basketball", gender: "men", image: "shoe-11.avif", price: "210.00" },
  { name: "Nike Metcon 9", description: "Built for the gym. Stable heel, flexible forefoot, and durable rubber for training.", category: "training", gender: "men", image: "shoe-12.avif", price: "130.00" },
  { name: "Nike Air Max 97", description: "Inspired by Japanese bullet trains. Full-length Air cushioning and a futuristic silhouette.", category: "sneakers", gender: "unisex", image: "shoe-13.avif", price: "175.00" },
  { name: "Nike Revolution 7", description: "Lightweight and breathable everyday runner. Foam midsole and rubber outsole for cushioning.", category: "running", gender: "women", image: "shoe-14.avif", price: "75.00" },
  { name: "Nike Court Vision Low", description: "Basketball-inspired style for the streets. Perforated leather upper with a cupsole.", category: "lifestyle", gender: "unisex", image: "shoe-15.avif", price: "70.00" },
];

async function seed() {
  console.log("🌱 Starting seed...\n");

  const imageUrlMap = copyShoeImages();

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

  console.log("\n🛍️  Seeding products...\n");

  const allColorSlugs = COLORS.map((c) => c.slug);
  const allSizeSlugs = SIZES.map((s) => s.slug);

  for (const p of PRODUCTS) {
    const categoryId = categoryMap[p.category];
    const genderId = genderMap[p.gender];

    if (!categoryId || !genderId || !nike) {
      console.warn(`  ⚠️  Skipping ${p.name} — missing FK`);
      continue;
    }

    const [product] = await db
      .insert(schema.products)
      .values({ name: p.name, description: p.description, categoryId, genderId, brandId: nike.id, isPublished: true })
      .onConflictDoNothing()
      .returning();

    if (!product) {
      console.log(`   ↩  ${p.name} already exists, skipping`);
      continue;
    }

    const productColors = pickMany(allColorSlugs, 2, 4);
    const productSizes = pickMany(allSizeSlugs, 3, 5);
    let firstVariantId: string | null = null;
    let variantCount = 0;

    for (const colorSlug of productColors) {
      const colorId = colorMap[colorSlug];
      for (const sizeSlug of productSizes) {
        const sizeId = sizeMap[sizeSlug];
        const basePrice = parseFloat(p.price);
        const hasSale = Math.random() > 0.6;

        const variantSku = buildSku(p.name, colorSlug, sizeSlug);

        const rows = await db
          .insert(schema.productVariants)
          .values({
            productId: product.id,
            sku: variantSku,
            price: p.price,
            salePrice: hasSale ? (basePrice * 0.85).toFixed(2) : null,
            colorId,
            sizeId,
            inStock: Math.floor(Math.random() * 50) + 5,
            weight: parseFloat((Math.random() * 0.5 + 0.3).toFixed(2)),
            dimensions: {
              length: parseFloat((Math.random() * 5 + 10).toFixed(1)),
              width: parseFloat((Math.random() * 3 + 7).toFixed(1)),
              height: parseFloat((Math.random() * 2 + 4).toFixed(1)),
            },
          })
          .onConflictDoNothing()
          .returning();

        const variant = rows[0];
        if (!variant) continue;
        variantCount++;
        if (!firstVariantId) firstVariantId = variant.id;

        if (productColors.indexOf(colorSlug) < 2) {
          const imageUrl = imageUrlMap[p.image] ?? `/shoes/${p.image}`;
          await db.insert(schema.productImages).values({
            productId: product.id,
            variantId: variant.id,
            url: imageUrl,
            sortOrder: 0,
            isPrimary: productColors.indexOf(colorSlug) === 0,
          });
        }
      }
    }

    if (firstVariantId) {
      await db.update(schema.products).set({ defaultVariantId: firstVariantId }).where(eq(schema.products.id, product.id));
    }

    const assigned = pickMany(collectionIds, 1, 2);
    for (const collectionId of assigned) {
      await db.insert(schema.productCollections).values({ productId: product.id, collectionId }).onConflictDoNothing();
    }

    console.log(`   ✓ ${p.name} — ${productColors.length} colors x ${productSizes.length} sizes = ${variantCount} variants`);
  }

  console.log("\n✅ Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
