import * as dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { products } from "./schema";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const nikeProducts = [
    {
        name: "Nike Air Max 270",
        brand: "Nike",
        price: "150.00",
        image: "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/awjogtnt2zymjqiyv0f3/air-max-270-shoes-2V5C4p.png",
        category: "Sneakers",
        description: "The Nike Air Max 270 delivers unrivaled comfort with its large Air unit and breathable mesh upper.",
    },
    {
        name: "Air Jordan 1 Retro High OG",
        brand: "Nike",
        price: "180.00",
        image: "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/i1-665455a5-45de-40fb-945f-c1852b82400d/air-jordan-1-retro-high-og-shoes-X5pM8t.png",
        category: "Basketball",
        description: "The shoe that started it all. The Air Jordan 1 Retro High OG is a timeless icon with premium leather construction.",
    },
    {
        name: "Nike Air Force 1 '07",
        brand: "Nike",
        price: "110.00",
        image: "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/b7d9211c-26e7-431a-ac24-b0540fb3c00f/air-force-1-07-shoes-WrLlWX.png",
        category: "Lifestyle",
        description: "The radiance lives on in the Nike Air Force 1 '07, a low-cut classic with durable leather and cushioned Air.",
    },
    {
        name: "Nike Dunk Low Retro",
        brand: "Nike",
        price: "110.00",
        image: "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/9H4PqMLEJmqPMggqpBAB/dunk-low-retro-mens-shoes-87q7Wm.png",
        category: "Lifestyle",
        description: "Created for the hardwood but taken to the streets, the Nike Dunk Low Retro returns with classic details.",
    },
    {
        name: "Nike React Infinity Run FK 3",
        brand: "Nike",
        price: "160.00",
        image: "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/ff02e8c5-f7d4-4d39-810e-e0d7c11a8c5a/react-infinity-run-flyknit-3-road-running-shoes-qf3DsN.png",
        category: "Running",
        description: "The Nike React Infinity Run Flyknit 3 is designed to keep you running. React foam and a wide, stable platform reduce injury.",
    },
    {
        name: "Nike Pegasus 40",
        brand: "Nike",
        price: "130.00",
        image: "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/8a05e030-2c1f-4d96-8ce4-44afd19d9be6/pegasus-40-road-running-shoes-bpS5nq.png",
        category: "Running",
        description: "The dependable Nike Pegasus 40 is a reliable daily training shoe built with Air Zoom and React foam.",
    },
];

async function seed() {
    console.log("🌱 Seeding Nike products...");
    await db.delete(products);
    await db.insert(products).values(nikeProducts);
    console.log("✅ Seeded", nikeProducts.length, "Nike products successfully!");
    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
