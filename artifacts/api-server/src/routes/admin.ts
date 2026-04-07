import { Router, type IRouter } from "express";
import { db, ordersTable, productsTable, adminTable } from "@workspace/db";
import { eq, sql, desc, lte, asc } from "drizzle-orm";
import * as crypto from "crypto";

const router: IRouter = Router();

const ADMIN_PASSWORD = "Admins@Trynex";
const SALT = "trynex_salt_2024";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + SALT).digest("hex");
}

const SHA256_HEX_RE = /^[0-9a-f]{64}$/;

const validTokens = new Map<string, number>();

function issueToken(): string {
  const token = crypto.createHash("sha256")
    .update(`admin:${Date.now()}:${crypto.randomBytes(16).toString("hex")}:trynex_secret`)
    .digest("hex");
  validTokens.set(token, Date.now() + 7 * 24 * 60 * 60 * 1000);
  return token;
}

function validateToken(token: string): boolean {
  if (!SHA256_HEX_RE.test(token)) return false;
  const expiry = validTokens.get(token);
  if (expiry === undefined) return false;
  if (Date.now() > expiry) {
    validTokens.delete(token);
    return false;
  }
  return true;
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
    const token = issueToken();
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

router.post("/admin/logout", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "") ?? req.cookies?.admin_token;
  if (token) validTokens.delete(token);
  res.clearCookie("admin_token");
  res.json({ success: true, message: "Logged out" });
});

router.get("/admin/me", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "") ?? req.cookies?.admin_token;
  if (!token || !validateToken(token)) {
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

    const [weeklyRevenueData, paymentMethodData] = await Promise.all([
      db.select({
        day: sql<string>`TO_CHAR(created_at, 'Dy')`,
        revenue: sql<number>`COALESCE(SUM(total::numeric), 0)`,
        orders: sql<number>`COUNT(*)`,
      }).from(ordersTable)
        .where(sql`created_at >= NOW() - INTERVAL '7 days'`)
        .groupBy(sql`TO_CHAR(created_at, 'Dy'), DATE(created_at)`)
        .orderBy(sql`DATE(created_at)`),

      db.select({
        method: ordersTable.paymentMethod,
        count: sql<number>`COUNT(*)`,
      }).from(ordersTable)
        .groupBy(ordersTable.paymentMethod),
    ]);

    const totalPaymentOrders = paymentMethodData.reduce((s, p) => s + Number(p.count), 0);
    const paymentColors: Record<string, string> = {
      bkash: "#e2136e", nagad: "#f7941d", cod: "#16a34a", rocket: "#8b2291"
    };
    const paymentLabels: Record<string, string> = {
      bkash: "bKash", nagad: "Nagad", cod: "COD", rocket: "Rocket"
    };
    const paymentDistribution = paymentMethodData.map(p => ({
      name: paymentLabels[p.method] || p.method,
      value: totalPaymentOrders > 0 ? Math.round((Number(p.count) / totalPaymentOrders) * 100) : 0,
      color: paymentColors[p.method] || "#6b7280",
    }));

    const weeklyData = weeklyRevenueData.map(w => ({
      day: w.day,
      revenue: Number(w.revenue),
      orders: Number(w.orders),
    }));

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
      weeklyData,
      paymentDistribution,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get admin stats");
    res.status(500).json({ error: "internal_error", message: "Failed to get stats" });
  }
});

router.get("/admin/customers", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "") ?? req.cookies?.admin_token;
  if (!token || !validateToken(token)) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  try {
    const allOrders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));

    const customerMap = new Map<string, {
      name: string;
      email: string;
      phone: string;
      district: string;
      city: string;
      address: string;
      totalOrders: number;
      totalSpent: number;
      firstOrder: string;
      lastOrder: string;
      paymentMethods: string[];
      statuses: string[];
    }>();

    for (const o of allOrders) {
      const key = o.customerPhone || o.customerEmail;
      const existing = customerMap.get(key);
      if (existing) {
        existing.totalOrders += 1;
        existing.totalSpent += parseFloat(String(o.total));
        if (o.createdAt && o.createdAt.toISOString() < existing.firstOrder) {
          existing.firstOrder = o.createdAt.toISOString();
        }
        if (o.createdAt && o.createdAt.toISOString() > existing.lastOrder) {
          existing.lastOrder = o.createdAt.toISOString();
        }
        if (!existing.paymentMethods.includes(o.paymentMethod)) {
          existing.paymentMethods.push(o.paymentMethod);
        }
        if (!existing.statuses.includes(o.status)) {
          existing.statuses.push(o.status);
        }
      } else {
        customerMap.set(key, {
          name: o.customerName,
          email: o.customerEmail,
          phone: o.customerPhone,
          district: o.shippingDistrict || "",
          city: o.shippingCity || "",
          address: o.shippingAddress || "",
          totalOrders: 1,
          totalSpent: parseFloat(String(o.total)),
          firstOrder: o.createdAt?.toISOString() || "",
          lastOrder: o.createdAt?.toISOString() || "",
          paymentMethods: [o.paymentMethod],
          statuses: [o.status],
        });
      }
    }

    const customers = Array.from(customerMap.values()).sort((a, b) =>
      new Date(b.lastOrder).getTime() - new Date(a.lastOrder).getTime()
    );

    const districtCounts: Record<string, number> = {};
    for (const c of customers) {
      if (c.district) {
        districtCounts[c.district] = (districtCounts[c.district] || 0) + 1;
      }
    }

    const topDistricts = Object.entries(districtCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([district, count]) => ({ district, count }));

    res.json({
      totalCustomers: customers.length,
      totalOrders: allOrders.length,
      customers,
      topDistricts,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get customers");
    res.status(500).json({ error: "internal_error", message: "Failed to get customers" });
  }
});

export default router;
