import qs from "query-string";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortOption =
  | "featured"
  | "newest"
  | "price_asc"
  | "price_desc";

export type FilterParams = {
  search?: string;
  gender?: string[];
  size?: string[];
  color?: string[];
  category?: string[];
  priceMin?: string;
  priceMax?: string;
  sort?: SortOption;
  page?: string;
  limit?: string;
};

export type ParsedProductFilters = {
  search: string | undefined;
  genderSlugs: string[];
  sizeSlugs: string[];
  colorSlugs: string[];
  categorySlugs: string[];
  priceMin: number | undefined;
  priceMax: number | undefined;
  sort: SortOption;
  page: number;
  limit: number;
  offset: number;
};

// ─── URL ↔ FilterParams ───────────────────────────────────────────────────────

/** Parse a raw URL search string into typed FilterParams */
export function parseFilters(search: string): FilterParams {
  const parsed = qs.parse(search, { arrayFormat: "comma" });

  const toArray = (val: unknown): string[] | undefined => {
    if (!val) return undefined;
    if (Array.isArray(val)) return val.filter(Boolean) as string[];
    if (typeof val === "string") return val.split(",").filter(Boolean);
    return undefined;
  };

  const sortRaw = typeof parsed.sort === "string" ? parsed.sort : undefined;
  const validSorts: SortOption[] = ["featured", "newest", "price_asc", "price_desc"];
  const sort = validSorts.includes(sortRaw as SortOption)
    ? (sortRaw as SortOption)
    : undefined;

  return {
    search: typeof parsed.search === "string" ? parsed.search : undefined,
    gender: toArray(parsed.gender),
    size: toArray(parsed.size),
    color: toArray(parsed.color),
    category: toArray(parsed.category),
    priceMin: typeof parsed.priceMin === "string" ? parsed.priceMin : undefined,
    priceMax: typeof parsed.priceMax === "string" ? parsed.priceMax : undefined,
    sort,
    page: typeof parsed.page === "string" ? parsed.page : undefined,
    limit: typeof parsed.limit === "string" ? parsed.limit : undefined,
  };
}

/** Stringify FilterParams back to a query string (no leading ?) */
export function stringifyFilters(filters: FilterParams): string {
  const clean: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(filters)) {
    if (val === undefined || val === null) continue;
    if (Array.isArray(val) && val.length === 0) continue;
    clean[key] = val;
  }
  return qs.stringify(clean, {
    arrayFormat: "comma",
    skipNull: true,
    skipEmptyString: true,
  });
}

/**
 * Parse URL searchParams (from Next.js page) into a fully resolved
 * ParsedProductFilters object ready to pass to getAllProducts().
 */
export function parseFilterParams(
  searchParams: Record<string, string | string[] | undefined>
): ParsedProductFilters {
  // Flatten Next.js searchParams (may be string | string[]) to a plain string
  const flat: Record<string, string> = {};
  for (const [k, v] of Object.entries(searchParams)) {
    if (!v) continue;
    flat[k] = Array.isArray(v) ? v.join(",") : v;
  }

  const raw = parseFilters(
    Object.entries(flat)
      .map(([k, v]) => `${k}=${v}`)
      .join("&")
  );

  const page = Math.max(1, parseInt(raw.page ?? "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(raw.limit ?? "24", 10) || 24));

  return {
    search: raw.search,
    genderSlugs: raw.gender ?? [],
    sizeSlugs: raw.size ?? [],
    colorSlugs: raw.color ?? [],
    categorySlugs: raw.category ?? [],
    priceMin: raw.priceMin ? parseFloat(raw.priceMin) : undefined,
    priceMax: raw.priceMax ? parseFloat(raw.priceMax) : undefined,
    sort: raw.sort ?? "newest",
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

// ─── Filter UI helpers ────────────────────────────────────────────────────────

/** Toggle a single value in a multi-select filter array */
export function toggleArrayFilter(
  current: string[] | undefined,
  value: string
): string[] {
  const arr = current ?? [];
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

/** Set a single key in filters, resetting page to 1 */
export function setFilter(
  current: FilterParams,
  key: keyof FilterParams,
  value: FilterParams[keyof FilterParams]
): FilterParams {
  return { ...current, [key]: value, page: "1" };
}

/** Remove a single key from filters */
export function removeFilter(
  current: FilterParams,
  key: keyof FilterParams
): FilterParams {
  const next = { ...current };
  delete next[key];
  next.page = "1";
  return next;
}

/** Clear all filters except sort */
export function clearFilters(current: FilterParams): FilterParams {
  return { sort: current.sort };
}
