import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";
import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { ProductRepository } from "@/lib/repositories/product.repository";
import { AuditLogRepository } from "@/lib/repositories/auditLog.repository";
import { products } from "@/lib/db/schema/products";
import type { ServiceResult } from "./auth.service";

const CACHE_TTL = 300; // 5 minutes

export const ProductService = {
  async search(query: string) {
    const cacheKey = `product:search:${query}`;
    const cached = await cacheGet<(typeof products.$inferSelect)[]>(cacheKey);
    if (cached) return cached;

    const results = await ProductRepository.search(query);
    await cacheSet(cacheKey, results, CACHE_TTL);
    return results;
  },

  async getById(id: string) {
    const cacheKey = `product:${id}`;
    const cached = await cacheGet<typeof products.$inferSelect>(cacheKey);
    if (cached) return cached;

    const product = await ProductRepository.findById(id);
    if (product) await cacheSet(cacheKey, product, CACHE_TTL);
    return product;
  },

  async create(
    data: typeof products.$inferInsert,
    actorId: string
  ): Promise<ServiceResult<typeof products.$inferSelect>> {
    try {
      const product = await ProductRepository.create(data);
      if (!product) return { data: null, error: "CREATE_FAILED" };

      await AuditLogRepository.create({
        actorId,
        action: "product.created",
        resourceType: "product",
        resourceId: product.id,
        after: { name: product.name },
      });

      revalidatePath("/products");
      return { data: product, error: null };
    } catch (e) {
      logger.error({ err: e }, "ProductService.create failed");
      return { data: null, error: "INTERNAL_ERROR" };
    }
  },

  async update(
    id: string,
    data: Partial<typeof products.$inferInsert>,
    actorId: string
  ): Promise<ServiceResult<typeof products.$inferSelect>> {
    try {
      const before = await ProductRepository.findById(id);
      const updated = await ProductRepository.update(id, data);
      if (!updated) return { data: null, error: "NOT_FOUND" };

      await AuditLogRepository.create({
        actorId,
        action: "product.updated",
        resourceType: "product",
        resourceId: id,
        before: before ? { name: before.name } : undefined,
        after: { name: updated.name },
      });

      await cacheDel(`product:${id}`);
      revalidatePath("/products");
      revalidatePath(`/products/${id}`);
      return { data: updated, error: null };
    } catch (e) {
      logger.error({ err: e, id }, "ProductService.update failed");
      return { data: null, error: "INTERNAL_ERROR" };
    }
  },

  async softDelete(id: string, actorId: string): Promise<ServiceResult<boolean>> {
    try {
      const deleted = await ProductRepository.softDelete(id);
      if (!deleted) return { data: null, error: "NOT_FOUND" };

      await AuditLogRepository.create({
        actorId,
        action: "product.deleted",
        resourceType: "product",
        resourceId: id,
        before: { name: deleted.name },
      });

      await cacheDel(`product:${id}`);
      revalidatePath("/products");
      return { data: true, error: null };
    } catch (e) {
      logger.error({ err: e, id }, "ProductService.softDelete failed");
      return { data: null, error: "INTERNAL_ERROR" };
    }
  },

  async togglePublished(
    id: string,
    isPublished: boolean,
    actorId: string
  ): Promise<ServiceResult<typeof products.$inferSelect>> {
    try {
      const updated = await ProductRepository.togglePublished(id, isPublished);
      if (!updated) return { data: null, error: "NOT_FOUND" };

      await AuditLogRepository.create({
        actorId,
        action: isPublished ? "product.published" : "product.unpublished",
        resourceType: "product",
        resourceId: id,
        after: { isPublished },
      });

      await cacheDel(`product:${id}`);
      revalidatePath("/products");
      revalidatePath(`/products/${id}`);
      return { data: updated, error: null };
    } catch (e) {
      logger.error({ err: e, id }, "ProductService.togglePublished failed");
      return { data: null, error: "INTERNAL_ERROR" };
    }
  },
};
