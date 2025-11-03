import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userName: string;
}

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secretkey") as JwtPayload;
    (req as any).user = payload; // attach user info
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }
}
