ALTER TABLE "product_variants" ADD COLUMN "low_stock_threshold" integer DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "search_vector" "tsvector";--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "coupons" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
CREATE INDEX "idx_products_search_vector" ON "products" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "idx_orders_user_id" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_orders_created_at" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_payments_transaction_id" ON "payments" USING btree ("transaction_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_wishlists_user_product" ON "wishlists" USING btree ("user_id","product_id");