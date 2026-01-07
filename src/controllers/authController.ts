// src/controllers/authController.ts
import { Router, Request, Response } from "express";
import { googleSignIn } from "../services/authService";

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

export default router;
