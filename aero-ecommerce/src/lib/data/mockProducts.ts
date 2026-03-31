// ─── Types ────────────────────────────────────────────────────────────────────

export type MockColor = { name: string; slug: string; hexCode: string };
export type MockSize = { name: string; slug: string };

export type MockVariant = {
  id: string;
  sku: string;
  price: string;
  salePrice?: string;
  color: MockColor;
  size: MockSize;
  inStock: number;
};

export type MockColorGroup = {
  color: MockColor;
  /** Primary image for this color */
  image: string;
  /** Additional gallery images for this color */
  gallery: string[];
};

export type MockProduct = {
  id: string;
  name: string;
  description: string;
  details: string[];
  category: { name: string; slug: string };
  gender: { label: string; slug: string };
  brand: { name: string; slug: string };
  isPublished: boolean;
  defaultVariant: MockVariant;
  variants: MockVariant[];
  /** Primary listing image */
  image: string;
  /** Per-color image groups for PDP gallery */
  colorGroups: MockColorGroup[];
  badge?: string;
};

// ─── Static data ──────────────────────────────────────────────────────────────

const COLORS = {
  white: { name: "White", slug: "white", hexCode: "#F5F5F5" },
  black: { name: "Black", slug: "black", hexCode: "#111111" },
  red: { name: "Red", slug: "red", hexCode: "#D33918" },
  blue: { name: "Blue", slug: "blue", hexCode: "#0000FF" },
  grey: { name: "Grey", slug: "grey", hexCode: "#808080" },
  green: { name: "Green", slug: "green", hexCode: "#007D48" },
  orange: { name: "Orange", slug: "orange", hexCode: "#D37918" },
  navy: { name: "Navy", slug: "navy", hexCode: "#001F5B" },
};

export const SIZES: MockSize[] = [
  { name: "5", slug: "us-5" },
  { name: "5.5", slug: "us-5-5" },
  { name: "6", slug: "us-6" },
  { name: "6.5", slug: "us-6-5" },
  { name: "7", slug: "us-7" },
  { name: "7.5", slug: "us-7-5" },
  { name: "8", slug: "us-8" },
  { name: "8.5", slug: "us-8-5" },
  { name: "9", slug: "us-9" },
  { name: "9.5", slug: "us-9-5" },
  { name: "10", slug: "us-10" },
  { name: "10.5", slug: "us-10-5" },
  { name: "11", slug: "us-11" },
  { name: "11.5", slug: "us-11-5" },
  { name: "12", slug: "us-12" },
];

// Sizes 10+ are out of stock for demo
const OUT_OF_STOCK_SLUGS = new Set(["us-10", "us-10-5", "us-11", "us-11-5", "us-12"]);

function makeVariants(
  productId: string,
  price: string,
  colorKeys: (keyof typeof COLORS)[],
  salePrice?: string
): MockVariant[] {
  const variants: MockVariant[] = [];
  for (const colorKey of colorKeys) {
    for (const size of SIZES) {
      variants.push({
        id: `${productId}-${colorKey}-${size.slug}`,
        sku: `${productId.toUpperCase()}-${colorKey.toUpperCase()}-${size.slug.toUpperCase()}`,
        price,
        salePrice,
        color: COLORS[colorKey],
        size,
        inStock: OUT_OF_STOCK_SLUGS.has(size.slug) ? 0 : Math.floor(Math.random() * 20) + 5,
      });
    }
  }
  return variants;
}

// All 15 shoe images — used as gallery images across products
const ALL_IMAGES = [
  "/shoes/shoe-1.jpg",
  "/shoes/shoe-2.webp",
  "/shoes/shoe-3.webp",
  "/shoes/shoe-4.webp",
  "/shoes/shoe-5.avif",
  "/shoes/shoe-6.avif",
  "/shoes/shoe-7.avif",
  "/shoes/shoe-8.avif",
  "/shoes/shoe-9.avif",
  "/shoes/shoe-10.avif",
  "/shoes/shoe-11.avif",
  "/shoes/shoe-12.avif",
  "/shoes/shoe-13.avif",
  "/shoes/shoe-14.avif",
  "/shoes/shoe-15.avif",
];

/** Pick `n` images starting at `offset`, wrapping around */
function pickImages(offset: number, n: number): string[] {
  return Array.from({ length: n }, (_, i) => ALL_IMAGES[(offset + i) % ALL_IMAGES.length]);
}

function makeColorGroups(
  colorKeys: (keyof typeof COLORS)[],
  primaryOffset: number
): MockColorGroup[] {
  return colorKeys.map((key, i) => ({
    color: COLORS[key],
    image: ALL_IMAGES[(primaryOffset + i * 3) % ALL_IMAGES.length],
    gallery: pickImages(primaryOffset + i * 3 + 1, 4),
  }));
}

// ─── Products ─────────────────────────────────────────────────────────────────

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Aero Air Max 270",
    description: "The Aero Air Max 270 delivers unrivaled comfort with its large Air unit and breathable mesh upper. Designed for all-day wear with a modern silhouette.",
    details: ["Padded collar", "Foam midsole", "Mesh upper for breathability", "Style: AH8050-100"],
    category: { name: "Sneakers", slug: "sneakers" },
    gender: { label: "Men", slug: "men" },
    brand: { name: "Aero", slug: "aero" },
    isPublished: true,
    image: "/shoes/shoe-1.jpg",
    badge: "Best Seller",
    colorGroups: makeColorGroups(["white", "black", "red"], 0),
    variants: makeVariants("p1", "150.00", ["white", "black", "red"]),
    get defaultVariant() { return this.variants[0]; },
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Air Jordan 1 Retro High OG",
    description: "The shoe that started it all. Premium leather construction with iconic colorways that defined a generation of basketball culture.",
    details: ["Full-grain leather upper", "Air-Sole unit", "Rubber outsole", "Style: 555088-161"],
    category: { name: "Basketball", slug: "basketball" },
    gender: { label: "Men", slug: "men" },
    brand: { name: "Aero", slug: "aero" },
    isPublished: true,
    image: "/shoes/shoe-2.webp",
    badge: "New",
    colorGroups: makeColorGroups(["black", "red", "white"], 1),
    variants: makeVariants("p2", "180.00", ["black", "red", "white"]),
    get defaultVariant() { return this.variants[0]; },
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    name: "Aero Force 1 '07",
    description: "The radiance lives on. Durable leather upper with cushioned Air-Sole unit for all-day comfort on any terrain.",
    details: ["Leather upper", "Air-Sole cushioning", "Rubber cupsole", "Style: CW2288-111"],
    category: { name: "Lifestyle", slug: "lifestyle" },
    gender: { label: "Unisex", slug: "unisex" },
    brand: { name: "Aero", slug: "aero" },
    isPublished: true,
    image: "/shoes/shoe-3.webp",
    colorGroups: makeColorGroups(["white", "black"], 2),
    variants: makeVariants("p3", "110.00", ["white", "black"]),
    get defaultVariant() { return this.variants[0]; },
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    name: "Aero Dunk Low Retro",
    description: "Created for the hardwood but taken to the streets. Classic details and a low-cut silhouette make this an everyday essential.",
    details: ["Leather and synthetic upper", "Foam midsole", "Rubber outsole", "Style: DD1391-300"],
    category: { name: "Lifestyle", slug: "lifestyle" },
    gender: { label: "Unisex", slug: "unisex" },
    brand: { name: "Aero", slug: "aero" },
    isPublished: true,
    image: "/shoes/shoe-4.webp",
    badge: "Extra 20% off",
    colorGroups: makeColorGroups(["green", "white", "navy"], 3),
    variants: makeVariants("p4", "110.00", ["green", "white", "navy"], "93.50"),
    get defaultVariant() { return this.variants[0]; },
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    name: "Aero React Infinity Run FK 3",
    description: "Designed to keep you running. React foam and a wide stable platform reduce injury risk on every run.",
    details: ["Flyknit upper", "React foam midsole", "Wide base for stability", "Style: DH5392-001"],
    category: { name: "Running", slug: "running" },
    gender: { label: "Men", slug: "men" },
    brand: { name: "Aero", slug: "aero" },
    isPublished: true,
    image: "/shoes/shoe-5.avif",
    colorGroups: makeColorGroups(["blue", "black", "grey"], 4),
    variants: makeVariants("p5", "160.00", ["blue", "black", "grey"]),
    get defaultVariant() { return this.variants[0]; },
  },
  {
    id: "00000000-0000-0000-0000-000000000006",
    name: "Aero Pegasus 40",
    description: "The dependable daily trainer. Air Zoom and React foam deliver a responsive cushioned ride mile after mile.",
    details: ["Engineered mesh upper", "Air Zoom unit", "React foam midsole", "Style: DV3853-001"],
    category: { name: "Running", slug: "running" },
    gender: { label: "Men", slug: "men" },
    brand: { name: "Aero", slug: "aero" },
    isPublished: true,
    image: "/shoes/shoe-6.avif",
    colorGroups: makeColorGroups(["orange", "black", "white"], 5),
    variants: makeVariants("p6", "130.00", ["orange", "black", "white"]),
    get defaultVariant() { return this.variants[0]; },
  },
  {
    id: "00000000-0000-0000-0000-000000000007",
    name: "Aero Air Max 90",
    description: "Iconic waffle outsole and Max Air cushioning. A timeless silhouette that blends heritage with modern comfort.",
    details: ["Leather and mesh upper", "Max Air heel unit", "Waffle rubber outsole", "Style: CN8490-100"],
    category: { name: "Sneakers", slug: "sneakers" },
    gender: { label: "Unisex", slug: "unisex" },
    brand: { name: "Aero", slug: "aero" },
    isPublished: true,
    image: "/shoes/shoe-7.avif",
    badge: "Sustainable",
    colorGroups: makeColorGroups(["grey", "white", "black"], 6),
    variants: makeVariants("p7", "120.00", ["grey", "white", "black"]),
    get defaultVariant() { return this.variants[0]; },
  },
  {
    id: "00000000-0000-0000-0000-000000000008",
    name: "Aero Free Run 5.0",
    description: "Flexible and lightweight. Moves with your foot for a natural barefoot-like feel on every stride.",
    details: ["Knit upper", "Free sole flex grooves", "Foam midsole", "Style: CZ1884-100"],
    category: { name: "Running", slug: "running" },
    gender: { label: "Women", slug: "women" },
    brand: { name: "Aero", slug: "aero" },
    isPublished: true,
    image: "/shoes/shoe-8.avif",
    colorGroups: makeColorGroups(["white", "grey"], 7),
    variants: makeVariants("p8", "100.00", ["white", "grey"]),
    get defaultVariant() { return this.variants[0]; },
  },
  {
    id: "00000000-0000-0000-0000-000000000009",
    name: "Aero Blazer Mid '77",
    description: "Vintage basketball style meets everyday wear. Crinkled leather upper with retro Aero branding.",
    details: ["Crinkled leather upper", "Foam midsole", "Rubber outsole", "Style: BQ6806-100"],
    category: { name: "Lifestyle", slug: "lifestyle" },
    gender: { label: "Unisex", slug: "unisex" },
    brand: { name: "Aero", slug: "aero" },
    isPublished: true,
    image: "/shoes/shoe-9.avif",
    badge: "Best Seller",
    colorGroups: makeColorGroups(["white", "black", "red"], 8),
    variants: makeVariants("p9", "100.00", ["white", "black", "red"]),
    get defaultVariant() { return this.variants[0]; },
  },
  {
    id: "00000000-0000-0000-0000-000000000010",
    name: "Aero ZoomX Vaporfly NEXT% 2",
    description: "Race-day performance at its peak. ZoomX foam and a carbon fiber plate propel you to new personal bests.",
    details: ["Flyknit upper", "ZoomX foam", "Carbon fiber plate", "Style: CU4123-300"],
    category: { name: "Running", slug: "running" },
    gender: { label: "Men", slug: "men" },
    brand: { name: "Aero", slug: "aero" },
    isPublished: true,
    image: "/shoes/shoe-10.avif",
    colorGroups: makeColorGroups(["green", "black", "orange"], 9),
    variants: makeVariants("p10", "250.00", ["green", "black", "orange"]),
    get defaultVariant() { return this.variants[0]; },
  },
  {
    id: "00000000-0000-0000-0000-000000000011",
    name: "Air Jordan 4 Retro",
    description: "Visible Air cushioning and iconic mesh panels. One of the most coveted silhouettes in sneaker history.",
    details: ["Leather and mesh upper", "Visible Air unit", "Rubber outsole", "Style: CT8527-016"],
    category: { name: "Basketball", slug: "basketball" },
    gender: { label: "Men", slug: "men" },
    brand: { name: "Aero", slug: "aero" },
    isPublished: true,
    image: "/shoes/shoe-11.avif",
    badge: "Extra 20% off",
    colorGroups: makeColorGroups(["black", "red", "white"], 10),
    variants: makeVariants("p11", "210.00", ["black", "red", "white"], "178.50"),
    get defaultVariant() { return this.variants[0]; },
  },
  {
    id: "00000000-0000-0000-0000-000000000012",
    name: "Aero Metcon 9",
    description: "Built for the gym. Stable heel, flexible forefoot, and durable rubber make it the ultimate training shoe.",
    details: ["Mesh upper", "Stable heel clip", "Flex grooves in forefoot", "Style: DH3394-001"],
    category: { name: "Training", slug: "training" },
    gender: { label: "Men", slug: "men" },
    brand: { name: "Aero", slug: "aero" },
    isPublished: true,
    image: "/shoes/shoe-12.avif",
    colorGroups: makeColorGroups(["black", "grey", "blue"], 11),
    variants: makeVariants("p12", "130.00", ["black", "grey", "blue"]),
    get defaultVariant() { return this.variants[0]; },
  },
  {
    id: "00000000-0000-0000-0000-000000000013",
    name: "Aero Air Max 97",
    description: "Inspired by Japanese bullet trains. Full-length Air cushioning and a sleek futuristic silhouette.",
    details: ["Mesh and synthetic upper", "Full-length Air unit", "Rubber outsole", "Style: 921826-001"],
    category: { name: "Sneakers", slug: "sneakers" },
    gender: { label: "Unisex", slug: "unisex" },
    brand: { name: "Aero", slug: "aero" },
    isPublished: true,
    image: "/shoes/shoe-13.avif",
    colorGroups: makeColorGroups(["grey", "black"], 12),
    variants: makeVariants("p13", "175.00", ["grey", "black"]),
    get defaultVariant() { return this.variants[0]; },
  },
  {
    id: "00000000-0000-0000-0000-000000000014",
    name: "Aero Revolution 7",
    description: "Lightweight and breathable everyday runner. Foam midsole and rubber outsole for reliable cushioning.",
    details: ["Mesh upper", "Foam midsole", "Rubber outsole", "Style: FB2207-100"],
    category: { name: "Running", slug: "running" },
    gender: { label: "Women", slug: "women" },
    brand: { name: "Aero", slug: "aero" },
    isPublished: true,
    image: "/shoes/shoe-14.avif",
    colorGroups: makeColorGroups(["white", "navy", "grey"], 13),
    variants: makeVariants("p14", "75.00", ["white", "navy", "grey"]),
    get defaultVariant() { return this.variants[0]; },
  },
  {
    id: "00000000-0000-0000-0000-000000000015",
    name: "Aero Court Vision Low",
    description: "Basketball-inspired style for the streets. Perforated leather upper with a cupsole for a classic look.",
    details: ["Perforated leather upper", "Foam midsole", "Rubber cupsole", "Style: CD5463-100"],
    category: { name: "Lifestyle", slug: "lifestyle" },
    gender: { label: "Unisex", slug: "unisex" },
    brand: { name: "Aero", slug: "aero" },
    isPublished: true,
    image: "/shoes/shoe-15.avif",
    colorGroups: makeColorGroups(["white", "black", "navy"], 14),
    variants: makeVariants("p15", "70.00", ["white", "black", "navy"]),
    get defaultVariant() { return this.variants[0]; },
  },
];

// ─── Filter/sort options ──────────────────────────────────────────────────────

export const FILTER_OPTIONS = {
  genders: [
    { label: "Men", slug: "men" },
    { label: "Women", slug: "women" },
    { label: "Unisex", slug: "unisex" },
  ],
  sizes: SIZES,
  colors: Object.values(COLORS),
  priceRanges: [
    { label: "$25 – $100", min: "25", max: "100" },
    { label: "$100 – $150", min: "100", max: "150" },
    { label: "$150 – $200", min: "150", max: "200" },
    { label: "Over $200", min: "200", max: "" },
  ],
};

export const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Newest", value: "newest" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Price: Low → High", value: "price_asc" },
];
