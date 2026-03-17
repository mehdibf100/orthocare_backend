// src/controllers/authController.ts
import { Router, Request, Response } from "express";
import { googleSignIn } from "../services/authService";
import { prisma } from "../prismaClient";

const router = Router();

router.post("/google-signin", async (req: Request, res: Response) => {
  try {
    // Attendu: { email, name, googleId, photoUrl } envoyé par le client
    const dto = req.body;
    const response = await googleSignIn(dto);
    return res.status(200).json(response);
  } catch (err: any) {
    if (err.message === "AccountNotActivated") {
      return res.status(403).json({ error: "Compte non activé. Un email d'activation a été envoyé." });
    }
    if (err.message === "Données Google incomplètes") {
      return res.status(400).json({ error: err.message });
    }
    console.error("Google sign-in error", err);
    return res.status(500).json({ error: "Erreur lors de la connexion avec Google" });
  }
});
router.get("/users", async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        imageUrl: true,
        phone: true,
        role: true,
        activated: true,
        createdAt: true,
        updatedAt: true,
        // password et googleId exclus (sécurité)
      },
      orderBy: { createdAt: "desc" },
    });
 
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err: any) {
    console.error("GET /auth/users error:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});
 
// ── NOUVEAU : GET user par ID ────────────────────────────────────────────────
router.get("/users/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID invalide" });
 
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        imageUrl: true,
        phone: true,
        role: true,
        activated: true,
        createdAt: true,
        updatedAt: true,
      },
    });
 
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
    return res.status(200).json({ success: true, data: user });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});
router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const [totalUsers, activeUsers, adminCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { activated: true } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
    ]);
 
    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        adminUsers:    adminCount,
        normalUsers:   totalUsers - adminCount,
      },
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});
 // ── NOUVEAU : CREATE user (admin) ────────────────────────────────────────────
router.post("/users", async (req: Request, res: Response) => {
  try {
    const { name, email, role, activated, password } = req.body;
    if (!email) return res.status(400).json({ error: "Email requis" });
 
    const bcrypt = await import("bcryptjs");
    const hashed = await bcrypt.default.hash(password || "OrthoeCare2024!", 10);
 
    const user = await prisma.user.create({
      data: {
        name:      name      || null,
        email,
        role:      role      || "USER",
        activated: activated !== undefined ? Boolean(activated) : false,
        password:  hashed,
      },
      select: {
        id: true, email: true, name: true,
        imageUrl: true, role: true, activated: true,
        createdAt: true, updatedAt: true,
      },
    });
 
    return res.status(201).json({ success: true, data: user });
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Email déjà utilisé" });
    }
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});
 
// ── NOUVEAU : UPDATE user ────────────────────────────────────────────────────
router.put("/users/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID invalide" });
 
    const { name, email, role, activated, imageUrl, phone } = req.body;
 
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name      !== undefined && { name }),
        ...(email     !== undefined && { email }),
        ...(role      !== undefined && { role }),
        ...(activated !== undefined && { activated: Boolean(activated) }),
        ...(imageUrl  !== undefined && { imageUrl }),
        ...(phone     !== undefined && { phone: Number(phone) }),
      },
      select: {
        id: true, email: true, name: true,
        imageUrl: true, phone: true, role: true,
        activated: true, createdAt: true, updatedAt: true,
      },
    });
 
    return res.status(200).json({ success: true, data: user });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ error: "Utilisateur non trouvé" });
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});
 
// ── NOUVEAU : DELETE user ────────────────────────────────────────────────────
router.delete("/users/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID invalide" });
 
    await prisma.user.delete({ where: { id } });
    return res.status(200).json({ success: true, message: "Utilisateur supprimé" });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ error: "Utilisateur non trouvé" });
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});
 
// ── NOUVEAU : GET stats dashboard ───────────────────────────────────────────
router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const [totalUsers, activeUsers, adminCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { activated: true } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
    ]);
 
    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        adminUsers:    adminCount,
        normalUsers:   totalUsers - adminCount,
      },
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
