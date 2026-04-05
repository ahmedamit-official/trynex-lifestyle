import { Router, type IRouter } from "express";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const SETTINGS_KEYS = [
  "siteName", "tagline", "phone", "email", "address",
  "facebookUrl", "instagramUrl", "youtubeUrl",
  "heroTitle", "heroSubtitle",
  "announcementBar", "freeShippingThreshold",
  "bkashNumber", "nagadNumber", "rocketNumber",
  "whatsappNumber", "shippingCost",
];

async function getAllSettings() {
  const rows = await db.select().from(settingsTable);
  const map: Record<string, string | null> = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return {
    siteName: map["siteName"] ?? "TryNex Lifestyle",
    tagline: map["tagline"] ?? "You imagine, we craft.",
    phone: map["phone"] ?? "+880 1700-000000",
    email: map["email"] ?? "hello@trynex.com",
    address: map["address"] ?? "Banani, Dhaka-1213, Bangladesh",
    facebookUrl: map["facebookUrl"] ?? "",
    instagramUrl: map["instagramUrl"] ?? "",
    youtubeUrl: map["youtubeUrl"] ?? "",
    heroTitle: map["heroTitle"] ?? "Premium Custom Apparel",
    heroSubtitle: map["heroSubtitle"] ?? "You imagine, we craft.",
    announcementBar: map["announcementBar"] ?? "🚚 Free delivery on orders above ৳1,500!",
    freeShippingThreshold: parseFloat(map["freeShippingThreshold"] ?? "1500"),
    bkashNumber: map["bkashNumber"] ?? "01712-345678",
    nagadNumber: map["nagadNumber"] ?? "01811-234567",
    rocketNumber: map["rocketNumber"] ?? "01611-234567",
    whatsappNumber: map["whatsappNumber"] ?? "01700-000000",
    shippingCost: parseFloat(map["shippingCost"] ?? "100"),
  };
}

router.get("/settings", async (req, res) => {
  try {
    res.json(await getAllSettings());
  } catch (err) {
    req.log.error({ err }, "Failed to get settings");
    res.status(500).json({ error: "internal_error", message: "Failed to get settings" });
  }
});

router.put("/settings", async (req, res) => {
  try {
    for (const key of SETTINGS_KEYS) {
      if (req.body[key] !== undefined) {
        const value = req.body[key]?.toString() ?? null;
        await db.insert(settingsTable).values({ key, value }).onConflictDoUpdate({
          target: settingsTable.key,
          set: { value, updatedAt: new Date() },
        });
      }
    }
    res.json(await getAllSettings());
  } catch (err) {
    req.log.error({ err }, "Failed to update settings");
    res.status(500).json({ error: "internal_error", message: "Failed to update settings" });
  }
});

export default router;
