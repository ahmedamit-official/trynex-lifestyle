import { Router, type IRouter } from "express";
import { db, ordersTable, productsTable } from "@workspace/db";
import { eq, and, desc, sql, inArray } from "drizzle-orm";

const router: IRouter = Router();

function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.getFullYear().toString().slice(2) +
    String(date.getMonth() + 1).padStart(2, "0") +
    String(date.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `TN${dateStr}${random}`;
}

function mapOrder(o: any) {
  return {
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
  };
}

router.get("/orders", async (req, res) => {
  try {
    const { status, page = "1", limit = "20" } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    const conditions: any[] = [];
    if (status) conditions.push(eq(ordersTable.status, status as string));
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [orders, countResult] = await Promise.all([
      db.select().from(ordersTable).where(where).orderBy(desc(ordersTable.createdAt)).limit(limitNum).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(where),
    ]);

    const total = Number(countResult[0]?.count ?? 0);
    res.json({
      orders: orders.map(mapOrder),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to list orders");
    res.status(500).json({ error: "internal_error", message: "Failed to list orders" });
  }
});

router.post("/orders/track", async (req, res) => {
  try {
    const { orderNumber, email } = req.body;
    if (!orderNumber || !email) {
      res.status(400).json({ error: "validation_error", message: "orderNumber and email are required" });
      return;
    }
    const [order] = await db.select().from(ordersTable).where(
      and(eq(ordersTable.orderNumber, orderNumber), eq(ordersTable.customerEmail, email))
    );
    if (!order) {
      res.status(404).json({ error: "not_found", message: "Order not found" });
      return;
    }
    res.json(mapOrder(order));
  } catch (err) {
    req.log.error({ err }, "Failed to track order");
    res.status(500).json({ error: "internal_error", message: "Failed to track order" });
  }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
    if (!order) {
      res.status(404).json({ error: "not_found", message: "Order not found" });
      return;
    }
    res.json(mapOrder(order));
  } catch (err) {
    req.log.error({ err }, "Failed to get order");
    res.status(500).json({ error: "internal_error", message: "Failed to get order" });
  }
});

router.post("/orders", async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, shippingAddress, shippingCity, shippingDistrict, paymentMethod, items, notes } = req.body;

    if (!customerName || !customerEmail || !customerPhone || !shippingAddress || !paymentMethod || !items?.length) {
      res.status(400).json({ error: "validation_error", message: "Missing required fields" });
      return;
    }

    const productIds = items.map((i: any) => Number(i.productId));

    const products = await Promise.all(
      productIds.map(async (id: number) => {
        const [p] = await db.select().from(productsTable).where(eq(productsTable.id, id));
        return p;
      })
    );

    const productMap = Object.fromEntries(products.map(p => [p.id, p]));

    const orderItems = items.map((item: any) => {
      const product = productMap[item.productId];
      if (!product) throw new Error(`Product ${item.productId} not found`);
      const price = product.discountPrice ? parseFloat(product.discountPrice) : parseFloat(product.price);
      return {
        productId: item.productId,
        productName: product.name,
        productImage: product.imageUrl,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price,
        customNote: item.customNote,
      };
    });

    const subtotal = orderItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const shippingCost = subtotal >= 1500 ? 0 : 100;
    const total = subtotal + shippingCost;

    const [order] = await db.insert(ordersTable).values({
      orderNumber: generateOrderNumber(),
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      shippingCity,
      shippingDistrict,
      paymentMethod,
      items: orderItems,
      subtotal: subtotal.toString(),
      shippingCost: shippingCost.toString(),
      total: total.toString(),
      notes,
    }).returning();

    res.status(201).json(mapOrder(order));
  } catch (err) {
    req.log.error({ err }, "Failed to create order");
    res.status(500).json({ error: "internal_error", message: "Failed to create order" });
  }
});

router.put("/orders/:id/status", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    if (!status) {
      res.status(400).json({ error: "validation_error", message: "status is required" });
      return;
    }
    const [order] = await db.update(ordersTable).set({ status, updatedAt: new Date() }).where(eq(ordersTable.id, id)).returning();
    if (!order) {
      res.status(404).json({ error: "not_found", message: "Order not found" });
      return;
    }
    res.json(mapOrder(order));
  } catch (err) {
    req.log.error({ err }, "Failed to update order status");
    res.status(500).json({ error: "internal_error", message: "Failed to update order status" });
  }
});

router.put("/orders/:id/payment-status", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { paymentStatus } = req.body;
    if (!paymentStatus) {
      res.status(400).json({ error: "validation_error", message: "paymentStatus is required" });
      return;
    }
    const [order] = await db.update(ordersTable).set({ paymentStatus, updatedAt: new Date() }).where(eq(ordersTable.id, id)).returning();
    if (!order) {
      res.status(404).json({ error: "not_found", message: "Order not found" });
      return;
    }
    res.json(mapOrder(order));
  } catch (err) {
    req.log.error({ err }, "Failed to update payment status");
    res.status(500).json({ error: "internal_error", message: "Failed to update payment status" });
  }
});

router.put("/orders/:id/payment-info", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { lastFourDigits, promoCode } = req.body;
    const notes = [
      lastFourDigits ? `Payment last 4 digits: ${lastFourDigits}` : null,
      promoCode ? `Promo code: ${promoCode}` : null,
    ].filter(Boolean).join(" | ");

    const [order] = await db.update(ordersTable)
      .set({ paymentStatus: "submitted", notes, updatedAt: new Date() })
      .where(eq(ordersTable.id, id))
      .returning();
    if (!order) {
      res.status(404).json({ error: "not_found", message: "Order not found" });
      return;
    }
    res.json(mapOrder(order));
  } catch (err) {
    req.log.error({ err }, "Failed to update payment info");
    res.status(500).json({ error: "internal_error", message: "Failed to update payment info" });
  }
});

export default router;
