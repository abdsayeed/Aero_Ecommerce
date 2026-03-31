"use server";

import {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  ne,
  or,
  sql,
} from "drizzle-orm";
import { db } from "@/lib/db";
import {
  products,
  productVariants,
  productImages,
} from "@/lib/db/schema/products";
import { categories } from "@/lib/db/schema/categories";
import { brands } from "@/lib/db/schema/brands";
import { genders } from "@/lib/db/schema/filters/genders";
import { colors } from "@/lib/db/schema/filters/colors";
import { sizes } from "@/lib/db/schema/filters/sizes";
import { reviews } from "@/lib/db/schema/reviews";
import { user } from "@/lib/db/schema/user";
import type { ParsedProductFilters } from "@/lib/utils/query";

// ─── Return types ─────────────────────────────────────────────────────────────

export type ProductListItem = {
  id: string;
  name: string;
  description: string;
  isPublished: boolean;
  createdAt: Date;
  minPrice: string;
  maxPrice: string;
  hasSale: boolean;
  colorCount: number;
  category: { id: string; name: string; slug: string };
  gender: { id: string; label: string; slug: string };
  brand: { id: string; name: string; slug: string };
  primaryImage: string | null;
};

export type ProductDetail = {
  id: string;
  name: string;
  description: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  defaultVariantId: string | null;
  category: { id: string; name: string; slug: string };
  gender: { id: string; label: string; slug: string };
  brand: { id: string; name: string; slug: string; logoUrl: string | null };
  variants: Array<{
    id: string;
    sku: string;
    price: string;
    salePrice: string | null;
    inStock: number;
    color: { id: string; name: string; slug: string; hexCode: string };
    size: { id: string; name: string; slug: string; sortOrder: number };
  }>;
  images: Array<{
    id: string;
    url: string;
    sortOrder: number;
    isPrimary: boolean;
    variantId: string | null;
  }>;
};

export type GetAllProductsResult = {
  products: ProductListItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ─── getAllProducts ────────────────────────────────────────────────────────────

export async function getAllProducts(
  filters: ParsedProductFilters
): Promise<GetAllProductsResult> {
  if (!db) {
    return { products: [], totalCount: 0, page: 1, limit: filters.limit, totalPages: 0 };
  }

  const {
    search,
    genderSlugs,
    sizeSlugs,
    colorSlugs,
    categorySlugs,
    priceMin,
    priceMax,
    sort,
    page,
    limit,
    offset,
  } = filters;

  // ── Step 1: resolve filter slugs → IDs in parallel ────────────────────────
  const [genderIds, colorIds, sizeIds, categoryIds] = await Promise.all([
    genderSlugs.length
      ? db.select({ id: genders.id }).from(genders).where(inArray(genders.slug, genderSlugs))
      : Promise.resolve([]),
    colorSlugs.length
      ? db.select({ id: colors.id }).from(colors).where(inArray(colors.slug, colorSlugs))
      : Promise.resolve([]),
    sizeSlugs.length
      ? db.select({ id: sizes.id }).from(sizes).where(inArray(sizes.slug, sizeSlugs))
      : Promise.resolve([]),
    categorySlugs.length
      ? db.select({ id: categories.id }).from(categories).where(inArray(categories.slug, categorySlugs))
      : Promise.resolve([]),
  ]);

  // ── Step 2: build product-level WHERE conditions ──────────────────────────
  const productConditions = [eq(products.isPublished, true)];

  if (search) {
    productConditions.push(ilike(products.name, `%${search}%`));
  }
  if (genderIds.length) {
    productConditions.push(inArray(products.genderId, genderIds.map((r) => r.id)));
  }
  if (categoryIds.length) {
    productConditions.push(inArray(products.categoryId, categoryIds.map((r) => r.id)));
  }

  // ── Step 3: if color/size/price filters exist, find matching product IDs ──
  // This avoids a complex multi-join on the main query
  let filteredProductIds: string[] | null = null;

  if (colorIds.length || sizeIds.length || priceMin !== undefined || priceMax !== undefined) {
    const variantConditions = [];

    if (colorIds.length) {
      variantConditions.push(inArray(productVariants.colorId, colorIds.map((r) => r.id)));
    }
    if (sizeIds.length) {
      variantConditions.push(inArray(productVariants.sizeId, sizeIds.map((r) => r.id)));
    }
    if (priceMin !== undefined) {
      variantConditions.push(gte(productVariants.price, String(priceMin)));
    }
    if (priceMax !== undefined) {
      variantConditions.push(lte(productVariants.price, String(priceMax)));
    }

    const matchingVariants = await db
      .selectDistinct({ productId: productVariants.productId })
      .from(productVariants)
      .where(and(...variantConditions));

    filteredProductIds = matchingVariants.map((v) => v.productId);

    // No variants matched — return empty early
    if (filteredProductIds.length === 0) {
      return { products: [], totalCount: 0, page, limit, totalPages: 0 };
    }

    productConditions.push(inArray(products.id, filteredProductIds));
  }

  const whereClause = and(...productConditions);

  // ── Step 4: count total (for pagination) ─────────────────────────────────
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .where(whereClause);

  const totalCount = count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  if (totalCount === 0) {
    return { products: [], totalCount: 0, page, limit, totalPages: 0 };
  }

  // ── Step 5: fetch paginated product rows with joins ───────────────────────
  // NOTE: PostgreSQL does not allow ORDER BY to reference a SELECT-level alias
  // when that alias is an aggregate expression. We must repeat the expression.
  const minPriceExpr = sql`min(${productVariants.price}::numeric)`;
  const orderBy =
    sort === "price_asc"
      ? asc(minPriceExpr)
      : sort === "price_desc"
      ? desc(minPriceExpr)
      : desc(products.createdAt); // newest / featured

  // Single query: products + category + gender + brand + aggregated variant prices
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      isPublished: products.isPublished,
      createdAt: products.createdAt,
      categoryId: products.categoryId,
      categoryName: categories.name,
      categorySlug: categories.slug,
      genderId: products.genderId,
      genderLabel: genders.label,
      genderSlug: genders.slug,
      brandId: products.brandId,
      brandName: brands.name,
      brandSlug: brands.slug,
      minPrice: sql<string>`min(${productVariants.price}::numeric)::text`,
      maxPrice: sql<string>`max(${productVariants.price}::numeric)::text`,
      hasSale: sql<boolean>`bool_or(${productVariants.salePrice} is not null)`,
      colorCount: sql<number>`count(distinct ${productVariants.colorId})::int`,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .innerJoin(genders, eq(products.genderId, genders.id))
    .innerJoin(brands, eq(products.brandId, brands.id))
    .innerJoin(productVariants, eq(productVariants.productId, products.id))
    .where(whereClause)
    .groupBy(
      products.id,
      categories.id,
      genders.id,
      brands.id
    )
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  if (rows.length === 0) {
    return { products: [], totalCount, page, limit, totalPages };
  }

  // ── Step 6: fetch primary images for all returned products in one query ───
  const productIds = rows.map((r) => r.id);

  // If color filter active, prefer images tied to those color variants
  let imageRows: Array<{ productId: string; url: string; variantId: string | null; isPrimary: boolean }> = [];

  if (colorIds.length > 0) {
    // Get images for variants matching the color filter
    imageRows = await db
      .select({
        productId: productImages.productId,
        url: productImages.url,
        variantId: productImages.variantId,
        isPrimary: productImages.isPrimary,
      })
      .from(productImages)
      .innerJoin(productVariants, eq(productImages.variantId, productVariants.id))
      .where(
        and(
          inArray(productImages.productId, productIds),
          inArray(productVariants.colorId, colorIds.map((r) => r.id))
        )
      )
      .orderBy(asc(productImages.sortOrder));
  } else {
    // Get primary images (or first image) for each product
    imageRows = await db
      .select({
        productId: productImages.productId,
        url: productImages.url,
        variantId: productImages.variantId,
        isPrimary: productImages.isPrimary,
      })
      .from(productImages)
      .where(inArray(productImages.productId, productIds))
      .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder));
  }

  // Build a map: productId → first image url
  const imageMap = new Map<string, string>();
  for (const img of imageRows) {
    if (!imageMap.has(img.productId)) {
      imageMap.set(img.productId, img.url);
    }
  }

  // ── Step 7: assemble result ───────────────────────────────────────────────
  const productList: ProductListItem[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    isPublished: r.isPublished,
    createdAt: r.createdAt,
    minPrice: r.minPrice ?? "0",
    maxPrice: r.maxPrice ?? "0",
    hasSale: r.hasSale ?? false,
    colorCount: r.colorCount ?? 0,
    category: { id: r.categoryId, name: r.categoryName, slug: r.categorySlug },
    gender: { id: r.genderId, label: r.genderLabel, slug: r.genderSlug },
    brand: { id: r.brandId, name: r.brandName, slug: r.brandSlug },
    primaryImage: imageMap.get(r.id) ?? null,
  }));

  return { products: productList, totalCount, page, limit, totalPages };
}

// ─── getProduct ───────────────────────────────────────────────────────────────

export async function getProduct(productId: string): Promise<ProductDetail | null> {
  if (!db) return null;

  // Fetch product + relations in parallel
  const [productRows, variantRows, imageRows] = await Promise.all([
    db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        isPublished: products.isPublished,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        defaultVariantId: products.defaultVariantId,
        categoryId: categories.id,
        categoryName: categories.name,
        categorySlug: categories.slug,
        genderId: genders.id,
        genderLabel: genders.label,
        genderSlug: genders.slug,
        brandId: brands.id,
        brandName: brands.name,
        brandSlug: brands.slug,
        brandLogoUrl: brands.logoUrl,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .innerJoin(genders, eq(products.genderId, genders.id))
      .innerJoin(brands, eq(products.brandId, brands.id))
      .where(eq(products.id, productId))
      .limit(1),

    db
      .select({
        id: productVariants.id,
        sku: productVariants.sku,
        price: productVariants.price,
        salePrice: productVariants.salePrice,
        inStock: productVariants.inStock,
        colorId: colors.id,
        colorName: colors.name,
        colorSlug: colors.slug,
        colorHex: colors.hexCode,
        sizeId: sizes.id,
        sizeName: sizes.name,
        sizeSlug: sizes.slug,
        sizeSortOrder: sizes.sortOrder,
      })
      .from(productVariants)
      .innerJoin(colors, eq(productVariants.colorId, colors.id))
      .innerJoin(sizes, eq(productVariants.sizeId, sizes.id))
      .where(eq(productVariants.productId, productId))
      .orderBy(asc(sizes.sortOrder)),

    db
      .select({
        id: productImages.id,
        url: productImages.url,
        sortOrder: productImages.sortOrder,
        isPrimary: productImages.isPrimary,
        variantId: productImages.variantId,
      })
      .from(productImages)
      .where(eq(productImages.productId, productId))
      .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder)),
  ]);

  if (!productRows.length) return null;

  const p = productRows[0];

  return {
    id: p.id,
    name: p.name,
    description: p.description,
    isPublished: p.isPublished,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    defaultVariantId: p.defaultVariantId,
    category: { id: p.categoryId, name: p.categoryName, slug: p.categorySlug },
    gender: { id: p.genderId, label: p.genderLabel, slug: p.genderSlug },
    brand: {
      id: p.brandId,
      name: p.brandName,
      slug: p.brandSlug,
      logoUrl: p.brandLogoUrl,
    },
    variants: variantRows.map((v) => ({
      id: v.id,
      sku: v.sku,
      price: v.price,
      salePrice: v.salePrice,
      inStock: v.inStock,
      color: { id: v.colorId, name: v.colorName, slug: v.colorSlug, hexCode: v.colorHex },
      size: { id: v.sizeId, name: v.sizeName, slug: v.sizeSlug, sortOrder: v.sizeSortOrder },
    })),
    images: imageRows,
  };
}

// ─── Review type ──────────────────────────────────────────────────────────────

export type ProductReview = {
  id: string;
  author: string;
  rating: number;
  content: string;
  createdAt: string;
};

// ─── Recommended product type ─────────────────────────────────────────────────

export type RecommendedProduct = {
  id: string;
  name: string;
  price: string;
  salePrice: string | null;
  primaryImage: string | null;
  colorCount: number;
  category: { name: string; slug: string };
  gender: { label: string; slug: string };
};

// ─── getProductReviews ────────────────────────────────────────────────────────

export async function getProductReviews(
  productId: string
): Promise<ProductReview[]> {
  // No reviews in DB yet — return realistic dummy data
  if (!db) return getDummyReviews();

  try {
    const rows = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        content: reviews.comment,
        createdAt: reviews.createdAt,
        authorName: user.name,
      })
      .from(reviews)
      .innerJoin(user, eq(reviews.userId, user.id))
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt))
      .limit(10);

    if (rows.length === 0) return getDummyReviews();

    return rows.map((r) => ({
      id: r.id,
      author: r.authorName ?? "Anonymous",
      rating: r.rating,
      content: r.content ?? "",
      createdAt: r.createdAt.toISOString(),
    }));
  } catch {
    return getDummyReviews();
  }
}

function getDummyReviews(): ProductReview[] {
  return [
    {
      id: "dummy-1",
      author: "Jordan M.",
      rating: 5,
      content: "Absolutely love these. The fit is perfect and they look even better in person. Wore them all day and my feet felt great.",
      createdAt: new Date("2025-03-10").toISOString(),
    },
    {
      id: "dummy-2",
      author: "Alex T.",
      rating: 4,
      content: "Great shoe overall. Runs slightly large so I'd recommend going half a size down. The colorway is stunning.",
      createdAt: new Date("2025-02-28").toISOString(),
    },
    {
      id: "dummy-3",
      author: "Sam K.",
      rating: 5,
      content: "Best purchase I've made this year. Super comfortable right out of the box, no break-in period needed.",
      createdAt: new Date("2025-02-14").toISOString(),
    },
  ];
}

// ─── getRecommendedProducts ───────────────────────────────────────────────────

export async function getRecommendedProducts(
  productId: string
): Promise<RecommendedProduct[]> {
  if (!db) return [];

  try {
    // Get the current product's category and gender for matching
    const [current] = await db
      .select({
        categoryId: products.categoryId,
        genderId: products.genderId,
        brandId: products.brandId,
      })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!current) return [];

    // Fetch related products: same category OR same gender, excluding current
    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        categoryName: categories.name,
        categorySlug: categories.slug,
        genderLabel: genders.label,
        genderSlug: genders.slug,
        minPrice: sql<string>`min(${productVariants.price}::numeric)::text`,
        minSalePrice: sql<string | null>`min(${productVariants.salePrice}::numeric)::text`,
        colorCount: sql<number>`count(distinct ${productVariants.colorId})::int`,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .innerJoin(genders, eq(products.genderId, genders.id))
      .innerJoin(productVariants, eq(productVariants.productId, products.id))
      .where(
        and(
          eq(products.isPublished, true),
          ne(products.id, productId),
          or(
            eq(products.categoryId, current.categoryId),
            eq(products.genderId, current.genderId)
          )
        )
      )
      .groupBy(products.id, categories.id, genders.id)
      .orderBy(desc(products.createdAt))
      .limit(6);

    if (rows.length === 0) return [];

    const relatedIds = rows.map((r) => r.id);

    // Fetch one primary image per product
    const imageRows = await db
      .select({
        productId: productImages.productId,
        url: productImages.url,
      })
      .from(productImages)
      .where(
        and(
          inArray(productImages.productId, relatedIds),
          eq(productImages.isPrimary, true)
        )
      );

    const imageMap = new Map(imageRows.map((img) => [img.productId, img.url]));

    return rows
      .map((r) => ({
        id: r.id,
        name: r.name,
        price: r.minPrice ?? "0",
        salePrice: r.minSalePrice ?? null,
        primaryImage: imageMap.get(r.id) ?? null,
        colorCount: r.colorCount ?? 0,
        category: { name: r.categoryName, slug: r.categorySlug },
        gender: { label: r.genderLabel, slug: r.genderSlug },
      }))
      .filter((r) => r.primaryImage !== null); // skip products with no image
  } catch {
    return [];
  }
}
