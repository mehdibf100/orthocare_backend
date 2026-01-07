// src/services/authService.ts
import bcrypt from "bcryptjs";
import { prisma } from "../prismaClient";
import { GoogleSignInRequest, JWTAuthenticationResponse } from "../types/auth";
import { generateToken, generateRefreshToken } from "../utils/jwt";

// parseInt fallback handled
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);

export async function googleSignIn(
  dto: GoogleSignInRequest
): Promise<JWTAuthenticationResponse> {
  if (!dto.email || !dto.googleId) {
    throw new Error("Données Google incomplètes");
  }

  // Find existing user by email
  let user = await prisma.user.findUnique({ where: { email: dto.email } });

  if (user) {
    if (!user.activated) {
      // Option : appeler une fonction d'envoi d'email d'activation
      // sendActivationEmail(user.email);
      throw new Error("AccountNotActivated");
    }
  } else {
    // Create new user auto-activated for Google sign-in
    const placeholderPassword = `google_${dto.googleId}`;
    const hashed = await bcrypt.hash(placeholderPassword, SALT_ROUNDS);

    user = await prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        googleId: dto.googleId,
        imageUrl: dto.photoUrl,
        password: hashed,
        role: "USER",
        activated: true,
      },
    });
  }

  // At this point user exists and is activated
  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  return { token, refreshToken };
}
