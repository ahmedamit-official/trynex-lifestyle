import { Router, type IRouter } from "express";
import { db, ordersTable, productsTable, adminTable } from "@workspace/db";
import { eq, sql, desc, lte } from "drizzle-orm";
import * as crypto from "crypto";

const router: IRouter = Router();

const ADMIN_PASSWORD = "Admins@Trynex";
const SALT = "trynex_salt_2024";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + SALT).digest("hex");
}

async function ensureAdminExists() {
  const existing = await db.select().from(adminTable).limit(1);
  if (existing.length === 0) {
    await db.insert(adminTable).values({
      username: "admin",
      passwordHash: hashPassword(ADMIN_PASSWORD),
    });
  } else {
    await db.update(adminTable).set({ passwordHash: hashPassword(ADMIN_PASSWORD) }).where(eq(adminTable.username, "admin"));
  }
}

router.post("/admin/login", async (req, res) => {
  try {
    await ensureAdminExists();
    const { password } = req.body;
    if (!password) {
      res.status(400).json({ error: "validation_error", message: "password required" });
      return;
    }
    if (hashPassword(password) !== hashPassword(ADMIN_PASSWORD)) {
      res.status(401).json({ error: "unauthorized", message: "Invalid password" });
      return;
    }
    const token = crypto.createHash("sha256").update(`admin:${Date.now()}:trynex_secret`).digest("hex");
    res.cookie("admin_token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ success: true, token });
  } catch (err) {
    req.log.error({ err }, "Admin login failed");
    res.status(500).json({ error: "internal_error", message: "Login failed" });
  }
});

router.post("/admin/logout", (_req, res) => {
  res.clearCookie("admin_token");
  res.json({ success: true, message: "Logged out" });
});

router.get("/admin/me", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "") ?? req.cookies?.admin_token;
  if (!token) {
    res.status(401).json({ error: "unauthorized", message: "Not authenticated" });
    return;
  }
  res.json({ authenticated: true, username: "admin" });
});

router.get("/admin/stats", async (req, res) => {
  try {
    const [
      totalResult,
      pendingResult,
      processingResult,
      shippedResult,
      deliveredResult,
      totalRevenueResult,
      todayRevenueResult,
      totalProductsResult,
      lowStockResult,
      recentOrders,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(ordersTable),
      db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(eq(ordersTable.status, "pending")),
      db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(eq(ordersTable.status, "processing")),
      db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(eq(ordersTable.status, "shipped")),
      db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(eq(ordersTable.status, "delivered")),
      db.select({ total: sql<number>`COALESCE(SUM(total::numeric), 0)` }).from(ordersTable),
      db.select({ total: sql<number>`COALESCE(SUM(total::numeric), 0)` }).from(ordersTable).where(
        sql`created_at::date = CURRENT_DATE`
      ),
      db.select({ count: sql<number>`count(*)` }).from(productsTable),
      db.select({ count: sql<number>`count(*)` }).from(productsTable).where(lte(productsTable.stock, 5)),
      db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(5),
    ]);

    const mapOrder = (o: any) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      customerPhone: o.customerPhone,
      shippingAddress: o.shippingAddress,
      shippingCity: o.shippingCity,
      shippingDistrict: o.shippingDistrict,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      status: o.status,
      items: (o.items ?? []).map((item: any, idx: number) => ({ id: idx + 1, ...item })),
      subtotal: parseFloat(o.subtotal),
      shippingCost: parseFloat(o.shippingCost ?? "0"),
      total: parseFloat(o.total),
      notes: o.notes,
      createdAt: o.createdAt?.toISOString(),
      updatedAt: o.updatedAt?.toISOString(),
    });

    res.json({
      totalOrders: Number(totalResult[0]?.count ?? 0),
      pendingOrders: Number(pendingResult[0]?.count ?? 0),
      processingOrders: Number(processingResult[0]?.count ?? 0),
      shippedOrders: Number(shippedResult[0]?.count ?? 0),
      deliveredOrders: Number(deliveredResult[0]?.count ?? 0),
      totalRevenue: Number(totalRevenueResult[0]?.total ?? 0),
      todayRevenue: Number(todayRevenueResult[0]?.total ?? 0),
      totalProducts: Number(totalProductsResult[0]?.count ?? 0),
      lowStockProducts: Number(lowStockResult[0]?.count ?? 0),
      recentOrders: recentOrders.map(mapOrder),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get admin stats");
    res.status(500).json({ error: "internal_error", message: "Failed to get stats" });
  }
});

export default router;
