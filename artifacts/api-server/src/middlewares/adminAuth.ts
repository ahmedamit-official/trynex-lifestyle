import type { Request, Response, NextFunction } from "express";

const SHA256_HEX_RE = /^[0-9a-f]{64}$/;

export const validTokens = new Map<string, number>();

export function validateToken(token: string): boolean {
  if (!SHA256_HEX_RE.test(token)) return false;
  const expiry = validTokens.get(token);
  if (expiry === undefined) return false;
  if (Date.now() > expiry) {
    validTokens.delete(token);
    return false;
  }
  return true;
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token =
    req.headers.authorization?.replace("Bearer ", "") ??
    req.cookies?.admin_token;
  if (!token || !validateToken(token)) {
    res.status(401).json({ error: "unauthorized", message: "Admin authentication required" });
    return;
  }
  next();
}
