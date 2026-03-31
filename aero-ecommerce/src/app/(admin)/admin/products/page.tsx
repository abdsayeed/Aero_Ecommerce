import { db } from "@/lib/db";
import { products } from "@/lib/db/schema/products";
import { categories } from "@/lib/db/schema/categories";
import { brands } from "@/lib/db/schema/brands";
import { eq, desc } from "drizzle-orm";
import AdminProductRow from "@/components/admin/AdminProductRow";

export default async function AdminProductsPage() {
  if (!db) return <p className="text-[var(--color-red)]">Database unavailable.</p>;

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      isPublished: products.isPublished,
      createdAt: products.createdAt,
      categoryName: categories.name,
      brandName: brands.name,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .innerJoin(brands, eq(products.brandId, brands.id))
    .orderBy(desc(products.createdAt));

  return (
    <div>
      <h1 className="text-[length:var(--text-heading-3)] font-semibold text-[var(--color-dark-900)] mb-6">Products</h1>
      <div className="bg-white border border-[var(--color-light-300)]">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-3 border-b border-[var(--color-light-300)] text-[length:var(--text-footnote)] font-semibold text-[var(--color-dark-500)] uppercase tracking-wide">
          <span>Product</span>
          <span>Brand</span>
          <span>Category</span>
          <span>Published</span>
        </div>
        {rows.map((p) => <AdminProductRow key={p.id} product={p} />)}
      </div>
    </div>
  );
}
