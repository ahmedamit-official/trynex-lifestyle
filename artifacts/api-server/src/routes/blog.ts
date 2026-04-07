import { Router, type IRouter } from "express";
import { db, blogPostsTable } from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { requireAdmin, validateToken } from "../middlewares/adminAuth";

const router: IRouter = Router();

async function ensureBlogTable() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        excerpt TEXT,
        content TEXT NOT NULL,
        image_url TEXT,
        author TEXT DEFAULT 'TryNex Team',
        tags TEXT[] DEFAULT '{}',
        published BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
  } catch {}
}

function mapPost(p: any) {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    content: p.content,
    imageUrl: p.imageUrl,
    author: p.author,
    tags: p.tags ?? [],
    published: p.published ?? false,
    createdAt: p.createdAt?.toISOString(),
    updatedAt: p.updatedAt?.toISOString(),
  };
}

router.get("/blog", async (req, res) => {
  try {
    await ensureBlogTable();
    const { published, page = "1", limit = "12" } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    const token = req.headers.authorization?.replace("Bearer ", "") ?? req.cookies?.admin_token;
    const isAdmin = token ? validateToken(token) : false;
    const conditions: any[] = [];
    if (!isAdmin || published === "true") conditions.push(eq(blogPostsTable.published, true));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [posts, countResult] = await Promise.all([
      db.select().from(blogPostsTable).where(where).orderBy(desc(blogPostsTable.createdAt)).limit(limitNum).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(blogPostsTable).where(where),
    ]);

    res.json({
      posts: posts.map(mapPost),
      total: Number(countResult[0]?.count ?? 0),
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to list blog posts");
    res.status(500).json({ error: "internal_error", message: "Failed to list blog posts" });
  }
});

router.get("/blog/:id", async (req, res) => {
  try {
    await ensureBlogTable();
    const idOrSlug = req.params.id;
    const numericId = parseInt(idOrSlug, 10);

    let post;
    if (!isNaN(numericId)) {
      [post] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.id, numericId));
    } else {
      [post] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.slug, idOrSlug));
    }

    if (!post) {
      res.status(404).json({ error: "not_found", message: "Blog post not found" });
      return;
    }
    res.json(mapPost(post));
  } catch (err) {
    req.log.error({ err }, "Failed to get blog post");
    res.status(500).json({ error: "internal_error", message: "Failed to get blog post" });
  }
});

router.post("/blog", requireAdmin, async (req, res) => {
  try {
    await ensureBlogTable();
    const { title, slug, excerpt, content, imageUrl, author, tags, published } = req.body;
    if (!title || !slug || !content) {
      res.status(400).json({ error: "validation_error", message: "title, slug, content are required" });
      return;
    }
    const [post] = await db.insert(blogPostsTable).values({
      title, slug, excerpt, content, imageUrl, author: author || "TryNex Team",
      tags: tags || [], published: published ?? false,
    }).returning();
    res.status(201).json(mapPost(post));
  } catch (err) {
    req.log.error({ err }, "Failed to create blog post");
    res.status(500).json({ error: "internal_error", message: "Failed to create blog post" });
  }
});

router.put("/blog/:id", requireAdmin, async (req, res) => {
  try {
    await ensureBlogTable();
    const id = parseInt(req.params.id, 10);
    const { title, slug, excerpt, content, imageUrl, author, tags, published } = req.body;

    const updateData: any = { updatedAt: new Date() };
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (content !== undefined) updateData.content = content;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (author !== undefined) updateData.author = author;
    if (tags !== undefined) updateData.tags = tags;
    if (published !== undefined) updateData.published = published;

    const [post] = await db.update(blogPostsTable).set(updateData).where(eq(blogPostsTable.id, id)).returning();
    if (!post) {
      res.status(404).json({ error: "not_found", message: "Blog post not found" });
      return;
    }
    res.json(mapPost(post));
  } catch (err) {
    req.log.error({ err }, "Failed to update blog post");
    res.status(500).json({ error: "internal_error", message: "Failed to update blog post" });
  }
});

router.delete("/blog/:id", requireAdmin, async (req, res) => {
  try {
    await ensureBlogTable();
    const id = parseInt(req.params.id, 10);
    const [post] = await db.delete(blogPostsTable).where(eq(blogPostsTable.id, id)).returning();
    if (!post) {
      res.status(404).json({ error: "not_found", message: "Blog post not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete blog post");
    res.status(500).json({ error: "internal_error", message: "Failed to delete blog post" });
  }
});

export default router;
