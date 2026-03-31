import { Suspense } from "react";
import Link from "next/link";
import { PackageX } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGalleryDB from "@/components/ProductGalleryDB";
import SizePickerDB from "@/components/SizePickerDB";
import CollapsibleSection from "@/components/CollapsibleSection";
import ReviewsSection from "@/components/ReviewsSection";
import AlsoLikeSection from "@/components/AlsoLikeSection";
import WishlistButton from "@/components/WishlistButton";
import ReviewForm from "@/components/ReviewForm";
import { ReviewsSkeleton, AlsoLikeSkeleton } from "@/components/skeletons";
import { getProduct } from "@/lib/actions/products";
import type { ProductDetail } from "@/lib/actions/products";
import type { GalleryColor, GalleryImage } from "@/components/ProductGalleryDB";
import type { SizeOption } from "@/components/SizePickerDB";
import { MOCK_PRODUCTS } from "@/lib/data/mockProducts";
import { getWishlistedProductIds } from "@/lib/actions/wishlist";
import { getUserReviewForProduct } from "@/lib/actions/reviews";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// ─── Types ────────────────────────────────────────────────────────────────────

type Params = Promise<{ id: string }>;

// ─── Not Found block ──────────────────────────────────────────────────────────

function ProductNotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-light-100)]">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <PackageX className="w-12 h-12 text-[var(--color-dark-500)]" />
        <h1 className="text-[length:var(--text-heading-3)] font-semibold text-[var(--color-dark-900)]">
          Product not found
        </h1>
        <p className="text-[length:var(--text-body)] text-[var(--color-dark-700)] max-w-sm">
          This product doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/products"
          className="mt-2 px-6 py-3 bg-[var(--color-dark-900)] text-[var(--color-light-100)] text-[length:var(--text-body-medium)] font-medium hover:bg-[var(--color-dark-700)] transition-colors"
        >
          Back to Products
        </Link>
      </main>
      <Footer />
    </div>
  );
}

// ─── Derive gallery props from ProductDetail ──────────────────────────────────

function buildGalleryProps(product: ProductDetail) {
  // Unique colors from variants
  const colorMap = new Map<string, GalleryColor>();
  const variantsByColor: Record<string, string[]> = {};

  for (const v of product.variants) {
    if (!colorMap.has(v.color.id)) {
      colorMap.set(v.color.id, {
        id: v.color.id,
        name: v.color.name,
        slug: v.color.slug,
        hexCode: v.color.hexCode,
      });
    }
    if (!variantsByColor[v.color.id]) variantsByColor[v.color.id] = [];
    variantsByColor[v.color.id].push(v.id);
  }

  const images: GalleryImage[] = product.images.map((img) => ({
    id: img.id,
    url: img.url,
    sortOrder: img.sortOrder,
    isPrimary: img.isPrimary,
    variantId: img.variantId,
  }));

  return {
    images,
    colors: Array.from(colorMap.values()),
    variantsByColor,
  };
}

// ─── Derive size options from variants (unique sizes, first color) ────────────

function buildSizeOptions(product: ProductDetail): {
  sizes: SizeOption[];
  variantIdBySizeId: Record<string, string>;
} {
  const firstColorId = product.variants[0]?.color.id;
  const sizeMap = new Map<string, SizeOption>();
  const variantIdBySizeId: Record<string, string> = {};

  for (const v of product.variants) {
    if (v.color.id !== firstColorId) continue;
    if (!sizeMap.has(v.size.id)) {
      sizeMap.set(v.size.id, {
        id: v.size.id,
        name: v.size.name,
        slug: v.size.slug,
        sortOrder: v.size.sortOrder,
        inStock: v.inStock,
      });
      variantIdBySizeId[v.size.id] = v.id;
    }
  }

  return {
    sizes: Array.from(sizeMap.values()).sort((a, b) => a.sortOrder - b.sortOrder),
    variantIdBySizeId,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { id } = await params;

  // Fetch wishlist + review state in parallel with product
  const [wishlistedIds, existingReview, sessionResult] = await Promise.all([
    getWishlistedProductIds(),
    getUserReviewForProduct(id),
    auth.api.getSession({ headers: await headers() }).catch(() => null),
  ]);
  const isLoggedIn = !!sessionResult?.user;
  const isWishlisted = wishlistedIds.includes(id);

  // Try DB first, fall back to mock
  let product: ProductDetail | null = null;
  try {
    product = await getProduct(id);
  } catch {
    // DB unavailable — fall through to mock
  }

  // Mock fallback: build a ProductDetail-shaped object from mock data
  if (!product) {
    const mock = MOCK_PRODUCTS.find((p) => p.id === id);
    if (!mock) return <ProductNotFound />;

    // Build a minimal ProductDetail from mock
    const mockVariants = mock.variants.map((v, i) => ({
      id: v.id,
      sku: v.sku,
      price: v.price,
      salePrice: v.salePrice ?? null,
      inStock: v.inStock,
      color: { id: v.color.slug, name: v.color.name, slug: v.color.slug, hexCode: v.color.hexCode },
      size: { id: v.size.slug, name: v.size.name, slug: v.size.slug, sortOrder: i },
    }));

    // Build images from colorGroups
    const mockImages: ProductDetail["images"] = [];
    mock.colorGroups.forEach((cg, ci) => {
      const variantsForColor = mockVariants.filter((v) => v.color.slug === cg.color.slug);
      const firstVariant = variantsForColor[0];
      mockImages.push({
        id: `img-${ci}-0`,
        url: cg.image,
        sortOrder: 0,
        isPrimary: ci === 0,
        variantId: firstVariant?.id ?? null,
      });
      cg.gallery.forEach((url, gi) => {
        mockImages.push({
          id: `img-${ci}-${gi + 1}`,
          url,
          sortOrder: gi + 1,
          isPrimary: false,
          variantId: firstVariant?.id ?? null,
        });
      });
    });

    product = {
      id: mock.id,
      name: mock.name,
      description: mock.description,
      isPublished: mock.isPublished,
      createdAt: new Date(),
      updatedAt: new Date(),
      defaultVariantId: mockVariants[0]?.id ?? null,
      category: { id: mock.category.slug, name: mock.category.name, slug: mock.category.slug },
      gender: { id: mock.gender.slug, label: mock.gender.label, slug: mock.gender.slug },
      brand: { id: mock.brand.slug, name: mock.brand.name, slug: mock.brand.slug, logoUrl: null },
      variants: mockVariants,
      images: mockImages,
    };
  }

  if (!product) return <ProductNotFound />;

  // ── Supplement DB images with mock gallery if DB has sparse images ──────────
  const mock = MOCK_PRODUCTS.find((p) => p.id === id);
  if (mock && product.images.length < 3) {
    // Map color slug → all variant IDs for that color (from DB variants)
    const dbColorSlugToVariantIds = new Map<string, string[]>();
    for (const v of product.variants) {
      const slug = v.color.slug;
      if (!dbColorSlugToVariantIds.has(slug)) dbColorSlugToVariantIds.set(slug, []);
      dbColorSlugToVariantIds.get(slug)!.push(v.id);
    }

    // Also build colorId → slug map so we can cross-reference
    const dbColorIdToSlug = new Map<string, string>();
    for (const v of product.variants) {
      dbColorIdToSlug.set(v.color.id, v.color.slug);
    }

    const enrichedImages: typeof product.images = [];
    mock.colorGroups.forEach((cg, ci) => {
      // Find matching DB variant IDs by color slug
      const variantIds = dbColorSlugToVariantIds.get(cg.color.slug) ?? [];
      // Use the first variant ID as the image tag — it's in variantsByColor for this color
      const tagVariantId = variantIds[0] ?? null;

      enrichedImages.push({
        id: `mock-${ci}-0`,
        url: cg.image,
        sortOrder: 0,
        isPrimary: ci === 0,
        variantId: tagVariantId,
      });
      cg.gallery.forEach((url, gi) => {
        enrichedImages.push({
          id: `mock-${ci}-${gi + 1}`,
          url,
          sortOrder: gi + 1,
          isPrimary: false,
          variantId: tagVariantId,
        });
      });
    });

    // Only use enriched images if we successfully matched at least one color
    if (enrichedImages.some((img) => img.variantId !== null)) {
      product = { ...product, images: enrichedImages };
    } else {
      // Fallback: assign images round-robin to colors by index
      const colorIds = [...new Set(product.variants.map((v) => v.color.id))];
      const fallbackImages: typeof product.images = [];
      mock.colorGroups.forEach((cg, ci) => {
        const tagVariantId =
          product!.variants.find((v) => v.color.id === colorIds[ci])?.id ?? null;
        fallbackImages.push({
          id: `mock-${ci}-0`,
          url: cg.image,
          sortOrder: 0,
          isPrimary: ci === 0,
          variantId: tagVariantId,
        });
        cg.gallery.forEach((url, gi) => {
          fallbackImages.push({
            id: `mock-${ci}-${gi + 1}`,
            url,
            sortOrder: gi + 1,
            isPrimary: false,
            variantId: tagVariantId,
          });
        });
      });
      product = { ...product, images: fallbackImages };
    }
  }

  // ── Derived data ────────────────────────────────────────────────────────────
  const { images, colors, variantsByColor } = buildGalleryProps(product);
  const { sizes: sizeOptions, variantIdBySizeId } = buildSizeOptions(product);

  // Price from default variant or first variant
  const defaultVariant =
    product.variants.find((v) => v.id === product!.defaultVariantId) ??
    product.variants[0];

  const price = parseFloat(defaultVariant?.price ?? "0");
  const salePrice = defaultVariant?.salePrice ? parseFloat(defaultVariant.salePrice) : null;
  const discountPct = salePrice ? Math.round(((price - salePrice) / price) * 100) : null;

  // Mock details bullets (not in DB schema)
  const mockDetails = MOCK_PRODUCTS.find((p) => p.id === id)?.details ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-light-100)]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">

        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-1.5 text-[length:var(--text-footnote)] text-[var(--color-dark-700)] mb-6"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-[var(--color-dark-900)] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[var(--color-dark-900)] transition-colors">Products</Link>
          <span>/</span>
          <span className="text-[var(--color-dark-900)]">{product.name}</span>
        </nav>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

          {/* LEFT — Gallery + swatches (client) */}
          <ProductGalleryDB
            productName={product.name}
            images={images}
            colors={colors}
            variantsByColor={variantsByColor}
          />

          {/* RIGHT — Product info (server) */}
          <div className="flex flex-col">

            {/* Name */}
            <h1 className="text-[length:var(--text-heading-3)] font-semibold text-[var(--color-dark-900)] leading-tight mb-1">
              {product.name}
            </h1>

            {/* Subtitle */}
            <p className="text-[length:var(--text-caption)] text-[var(--color-dark-700)] mb-4">
              {product.gender.label}&apos;s {product.category.name}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-[length:var(--text-lead)] font-semibold text-[var(--color-dark-900)]">
                ${salePrice ? salePrice.toFixed(2) : price.toFixed(2)}
              </span>
              {salePrice && (
                <span className="text-[length:var(--text-body)] text-[var(--color-dark-500)] line-through">
                  ${price.toFixed(2)}
                </span>
              )}
            </div>

            {discountPct && (
              <p className="text-[length:var(--text-caption)] font-medium text-[var(--color-green)] mb-5">
                Extra {discountPct}% off w/ code SPORT
              </p>
            )}

            <div className="border-t border-[var(--color-light-300)] my-5" />

            {/* Size picker (client) */}
            <SizePickerDB sizes={sizeOptions} variantIdBySizeId={variantIdBySizeId} />

            {/* Wishlist button */}
            <div className="mt-3">
              <WishlistButton productId={product.id} initialWishlisted={isWishlisted} />
            </div>

            {/* Collapsible sections */}
            <div className="mt-6">
              <CollapsibleSection title="Product Details" defaultOpen>
                <p className="mb-3">{product.description}</p>
                {mockDetails.length > 0 && (
                  <ul className="flex flex-col gap-1">
                    {mockDetails.map((d) => (
                      <li key={d} className="flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-[var(--color-dark-700)] shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                )}
              </CollapsibleSection>

              <CollapsibleSection title="Shipping & Returns">
                <p>
                  Free standard shipping on orders over $50. Free returns within 30 days of
                  purchase. Items must be unworn and in original packaging.
                </p>
              </CollapsibleSection>

              {/* Reviews — non-blocking via Suspense */}
              <Suspense fallback={<ReviewsSkeleton />}>
                <ReviewsSection productId={product.id} />
              </Suspense>

              {/* Review form — only for logged-in users who haven't reviewed yet */}
              {isLoggedIn && !existingReview && (
                <ReviewForm productId={product.id} />
              )}
            </div>
          </div>
        </div>

        {/* You Might Also Like — non-blocking via Suspense */}
        <Suspense fallback={<AlsoLikeSkeleton />}>
          <AlsoLikeSection productId={product.id} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

// ─── Static params ────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return MOCK_PRODUCTS.map((p) => ({ id: p.id }));
}
