"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { parseFilters, stringifyFilters, setFilter } from "@/lib/utils/query";
import { SORT_OPTIONS } from "@/lib/data/mockProducts";

export default function Sort() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = parseFilters(searchParams.toString());
  const currentSort = filters.sort ?? "featured";

  const handleChange = (value: string) => {
    const next = setFilter(filters, "sort", value);
    next.page = "1";
    router.push(`${pathname}?${stringifyFilters(next)}`, { scroll: false });
  };

  return (
    <div className="relative flex items-center gap-1">
      <label htmlFor="sort-select" className="text-[length:var(--text-caption)] text-[var(--color-dark-900)] whitespace-nowrap">
        Sort By
      </label>
      <div className="relative">
        <select
          id="sort-select"
          value={currentSort}
          onChange={(e) => handleChange(e.target.value)}
          className="appearance-none bg-transparent pl-1 pr-5 text-[length:var(--text-caption)] font-medium text-[var(--color-dark-900)] cursor-pointer focus:outline-none"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none text-[var(--color-dark-900)]" />
      </div>
    </div>
  );
}
