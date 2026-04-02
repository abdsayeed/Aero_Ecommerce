import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { reviews } from "@/lib/db/schema/reviews";

export const insertReviewValidationSchema = createInsertSchema(reviews, {
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(1, "Comment is required"),
});

export const createReviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(1, "Comment is required"),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
