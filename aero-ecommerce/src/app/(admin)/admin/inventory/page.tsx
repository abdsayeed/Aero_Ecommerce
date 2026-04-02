import { db } from "@/lib/db";
import { productVariants, products } from "@/lib/db/schema/products";
import { colors } from "@/lib/db/schema/filters/colors";
import { sizes } from "@/lib/db/schema/filters/sizes";
import { eq, asc } from "drizzle-orm";
import AdminInventoryRow from "@/components/admin/AdminInventoryRow";

export default async function AdminInventoryPage() {
  if (!db) return <p className="text-[var(--color-red)]">Database unavailable.</p>;

  const rows = await db
    .select({
      id: productVariants.id,
      sku: productVariants.sku,
      inStock: productVariants.inStock,
      lowStockThreshold: productVariants.lowStockThreshold,
      productName: products.name,
      colorName: colors.name,
      sizeName: sizes.name,
    })
    .from(productVariants)
    .innerJoin(products, eq(productVariants.productId, products.id))
    .innerJoin(colors, eq(productVariants.colorId, colors.id))
    .innerJoin(sizes, eq(productVariants.sizeId, sizes.id))
    .orderBy(asc(products.name), asc(sizes.sortOrder));

  return (
    <div>
      <h1 className="text-[length:var(--text-heading-3)] font-semibold text-[var(--color-dark-900)] mb-6">Inventory</h1>
      <div className="bg-white border border-[var(--color-light-300)]">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-3 border-b border-[var(--color-light-300)] text-[length:var(--text-footnote)] font-semibold text-[var(--color-dark-500)] uppercase tracking-wide">
          <span>Product</span>
          <span>SKU</span>
          <span>Color</span>
          <span>Size</span>
          <span>In Stock</span>
        </div>
        {rows.map((v) => <AdminInventoryRow key={v.id} variant={v} />)}
      </div>
    </div>
  );
}
