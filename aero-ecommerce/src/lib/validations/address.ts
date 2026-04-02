import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { addresses } from "@/lib/db/schema/addresses";

export const insertAddressValidationSchema = createInsertSchema(addresses, {
  line1: z.string().trim().min(1, "Address line 1 is required"),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  country: z.string().trim().min(1, "Country is required"),
  postalCode: z.string().trim().min(1, "Postal code is required"),
});

export const addressSchema = z.object({
  line1: z.string().trim().min(1, "Address line 1 is required"),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  country: z.string().trim().min(1, "Country is required"),
  postalCode: z.string().trim().min(1, "Postal code is required"),
  type: z.enum(["billing", "shipping"]),
});

export type AddressInput = z.infer<typeof addressSchema>;
