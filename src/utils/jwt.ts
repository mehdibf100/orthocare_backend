// src/utils/jwt.ts
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { User } from "@prisma/client";

const JWT_SECRET: Secret = (process.env.JWT_SECRET ?? "change_me") as Secret;
const REFRESH_SECRET: Secret = (process.env.REFRESH_SECRET ?? "change_me_refresh") as Secret;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "15m";
const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN ?? "7d";

function parseExpires(value: string): SignOptions["expiresIn"] {
  const num = Number(value);
  if (Number.isFinite(num)) {
    return num as SignOptions["expiresIn"];
  }
  return value as unknown as SignOptions["expiresIn"];
}

export function generateToken(user: User) {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: parseExpires(JWT_EXPIRES_IN) });
}

export function generateRefreshToken(user: User) {
  const payload = { sub: user.id };
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: parseExpires(REFRESH_EXPIRES_IN) });
}
