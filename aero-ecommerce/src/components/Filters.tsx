"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp, X, SlidersHorizontal } from "lucide-react";
import {
  parseFilters,
  stringifyFilters,
  toggleArrayFilter,
  clearFilters,
  type FilterParams,
} from "@/lib/utils/query";
import { FILTER_OPTIONS } from "@/lib/data/mockProducts";

// ─── Collapsible filter group ─────────────────────────────────────────────────

function FilterGroup({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="py-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-[length:var(--text-caption)] font-medium text-[var(--color-dark-900)] hover:text-[var(--color-dark-700)] transition-colors focus:outline-none"
        aria-expanded={open}
      >
        <span>{title}</span>
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      {open && <div className="mt-2 flex flex-col gap-1.5">{children}</div>}
    </div>
  );
}

// ─── Checkbox row ─────────────────────────────────────────────────────────────

function CheckRow({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 cursor-pointer group">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-3.5 h-3.5 border-[var(--color-dark-500)] accent-[var(--color-dark-900)] cursor-pointer"
      />
      <span className="text-[length:var(--text-footnote)] text-[var(--color-dark-900)] group-hover:text-[var(--color-dark-700)] transition-colors">
        {label}
      </span>
    </label>
  );
}

// ─── Filter panel ─────────────────────────────────────────────────────────────

function FilterPanel({
  filters,
  onUpdate,
  prefix,
}: {
  filters: FilterParams;
  onUpdate: (next: FilterParams) => void;
  prefix: string;
}) {
  const toggle = (key: "gender" | "size" | "color", slug: string) =>
    onUpdate({ ...filters, [key]: toggleArrayFilter(filters[key], slug), page: "1" });

  const togglePrice = (min: string, max: string) => {
    const active = filters.priceMin === min && filters.priceMax === (max || undefined);
    if (active) {
      const next = { ...filters, page: "1" };
      delete next.priceMin;
      delete next.priceMax;
      onUpdate(next);
    } else {
      onUpdate({ ...filters, priceMin: min, priceMax: max || undefined, page: "1" });
    }
  };

  return (
    <div className="flex flex-col divide-y divide-[var(--color-light-300)]">
      <FilterGroup title="Gender">
        {FILTER_OPTIONS.genders.map((g) => (
          <CheckRow
            key={g.slug}
            id={`${prefix}-gender-${g.slug}`}
            label={g.label}
            checked={filters.gender?.includes(g.slug) ?? false}
            onChange={() => toggle("gender", g.slug)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Size" defaultOpen={false}>
        {FILTER_OPTIONS.sizes.map((s) => (
          <CheckRow
            key={s.slug}
            id={`${prefix}-size-${s.slug}`}
            label={s.name}
            checked={filters.size?.includes(s.slug) ?? false}
            onChange={() => toggle("size", s.slug)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Shop By Price" defaultOpen={false}>
        {FILTER_OPTIONS.priceRanges.map((r) => (
          <CheckRow
            key={r.label}
            id={`${prefix}-price-${r.min}-${r.max}`}
            label={r.label}
            checked={filters.priceMin === r.min && filters.priceMax === (r.max || undefined)}
            onChange={() => togglePrice(r.min, r.max)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Color" defaultOpen={false}>
        {FILTER_OPTIONS.colors.map((c) => (
          <CheckRow
            key={c.slug}
            id={`${prefix}-color-${c.slug}`}
            label={c.name}
            checked={filters.color?.includes(c.slug) ?? false}
            onChange={() => toggle("color", c.slug)}
          />
        ))}
      </FilterGroup>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface FiltersProps {
  totalCount: number;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
}

export default function Filters({ totalCount, mobileOnly, desktopOnly }: FiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filters = parseFilters(searchParams.toString());
  const push = (next: FilterParams) =>
    router.push(`${pathname}?${stringifyFilters(next)}`, { scroll: false });

  const activeCount =
    (filters.gender?.length ?? 0) +
    (filters.size?.length ?? 0) +
    (filters.color?.length ?? 0) +
    (filters.priceMin ? 1 : 0);

  const hasActive = activeCount > 0;

  // ── Desktop sidebar ───────────────────────────────────────────────────────
  if (desktopOnly) {
    return (
      <aside className="hidden lg:block w-48 shrink-0 pt-1" aria-label="Filters">
        {hasActive && (
          <button
            type="button"
            onClick={() => push(clearFilters(filters))}
            className="mb-3 text-[length:var(--text-footnote)] text-[var(--color-dark-700)] underline hover:text-[var(--color-dark-900)] transition-colors"
          >
            Clear All ({activeCount})
          </button>
        )}
        <FilterPanel filters={filters} onUpdate={push} prefix="sidebar" />
      </aside>
    );
  }

  // ── Mobile trigger + drawer ───────────────────────────────────────────────
  return (
    <>
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 border border-[var(--color-light-300)] text-[length:var(--text-caption)] font-medium text-[var(--color-dark-900)] hover:bg-[var(--color-light-200)] transition-colors focus:outline-none"
        aria-label="Open filters"
        aria-expanded={drawerOpen}
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filters
        {activeCount > 0 && (
          <span className="ml-1 text-[length:var(--text-footnote)] text-[var(--color-dark-700)]">
            ({activeCount})
          </span>
        )}
      </button>

      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-[var(--color-light-100)] shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Filters"
        aria-modal={drawerOpen}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-light-300)]">
          <span className="text-[length:var(--text-body-medium)] font-semibold text-[var(--color-dark-900)]">
            Filters {activeCount > 0 && `(${activeCount})`}
          </span>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="text-[var(--color-dark-700)] hover:text-[var(--color-dark-900)] transition-colors focus:outline-none rounded"
            aria-label="Close filters"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 pb-8">
          {hasActive && (
            <button
              type="button"
              onClick={() => { push(clearFilters(filters)); setDrawerOpen(false); }}
              className="mt-4 mb-2 text-[length:var(--text-footnote)] text-[var(--color-dark-700)] underline hover:text-[var(--color-dark-900)] transition-colors"
            >
              Clear All
            </button>
          )}
          <FilterPanel
            filters={filters}
            onUpdate={(next) => { push(next); setDrawerOpen(false); }}
            prefix="drawer"
          />
        </div>
      </aside>
    </>
  );
}
